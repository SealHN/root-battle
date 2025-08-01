class Game {
    constructor() {
        // 画布初始化
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setCanvasSize();
        
        // 游戏状态
        this.resetGameState();
        
        // 资源管理
        this.assets = {
            images: {},
            paths: {
                playerStand: 'svg/stickman.svg',
                playerThrow: 'svg/throw.svg',
                // ...其他资源路径...
            }
        };
        
        // 初始化流程
        this.initControls();
        this.loadResources().then(() => {
            this.initGameObjects();
            this.gameLoop();
        }).catch(err => {
            console.error("🚨 资源加载失败:", err);
            this.showErrorScreen();
        });
    }

    // === 核心方法 === //
    setCanvasSize() {
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        console.log("🎮 画布尺寸设置为:", this.width, this.height);
    }

    resetGameState() {
        this.score = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        this.isPlayerStunned = false;
        this.projectiles = [];
        this.enemyProjectiles = [];
    }

    async loadResources() {
        const loadPromises = [];
        
        // 图片加载
        for (const [key, path] of Object.entries(this.assets.paths)) {
            this.assets.images[key] = new Image();
            loadPromises.push(new Promise((resolve, reject) => {
                this.assets.images[key].onload = resolve;
                this.assets.images[key].onerror = () => 
                    reject(new Error(`加载失败: ${path}`));
                this.assets.images[key].src = `./assets/${path}`;
            }));
        }
        
        await Promise.all(loadPromises);
        console.log("✅ 所有资源加载完成");
    }

    initGameObjects() {
        // 地板
        this.floor = {
            x: 0, 
            y: this.height - 50,
            width: this.width,
            height: 20
        };
        
        // 玩家初始化（居中偏下）
        this.player = {
            x: this.width / 2 - 25,
            y: this.floor.y - 100,  // 确保在地板上方
            width: 50,
            height: 60,
            image: this.assets.images.playerStand,
            // ...其他属性...
        };
        
        // 敌人初始化（右上角）
        this.enemy = {
            x: this.width - 100,
            y: 50,
            width: 80,
            height: 100,
            image: this.assets.images.enemyNormal,
            // ...其他属性...
        };
        
        console.log("🛠 游戏对象初始化完成");
        console.log("📍 玩家位置:", this.player.x, this.player.y);
        console.log("📍 大根位置:", this.enemy.x, this.enemy.y);
    }

    draw() {
        // 清空画布（使用半透明清空实现运动残影效果）
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制调试信息（开发时启用）
        if (DEBUG_MODE) {
            this.drawDebugInfo();
        }
        
        // 绘制玩家
        this.drawCharacter(this.player);
        
        // 绘制大根
        this.drawCharacter(this.enemy);
        
        // ...其他绘制逻辑...
    }

    drawCharacter(obj) {
        if (!obj.image.complete) {
            // 图像未加载时显示占位符
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            return;
        }
        
        this.ctx.save();
        if (obj.direction === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                obj.image, 
                -obj.x - obj.width, 
                obj.y, 
                obj.width, 
                obj.height
            );
        } else {
            this.ctx.drawImage(
                obj.image, 
                obj.x, 
                obj.y, 
                obj.width, 
                obj.height
            );
        }
        this.ctx.restore();
    }

    // === 调试工具 === //
    drawDebugInfo() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`玩家: (${this.player.x},${this.player.y})`, 10, 20);
        this.ctx.fillText(`大根: (${this.enemy.x},${this.enemy.y})`, 10, 40);
        
        // 显示碰撞框
        this.ctx.strokeStyle = 'lime';
        this.ctx.strokeRect(
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );
    }

    showErrorScreen() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'red';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('资源加载失败，请刷新重试', 50, this.height/2);
    }
}

// 全局调试开关
const DEBUG_MODE = true; // 发布时改为false

// 启动游戏
const game = new Game();
