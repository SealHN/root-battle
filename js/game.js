// game.js - 根の战 完全修正版
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // 游戏状态
        this.score = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        this.isPlayerStunned = false;
        this.stunTimer = 0;
        this.projectileCooldown = 0;
        
        // 游戏对象
        this.player = null;
        this.enemy = null;
        this.floor = null;
        this.projectiles = [];
        this.enemyProjectiles = [];
        
        // 控制状态
        this.keys = {
            left: false,
            right: false,
            jump: false
        };
        
        // 资源路径前缀
        this.assetPrefix = './assets/';
        
        // 资源占位符（防止未加载时报错）
        this.images = {
            playerStand: new Image(),
            playerThrow: new Image(),
            playerFallen: new Image(),
            enemyNormal: new Image(),
            enemyHurt: new Image(),
            enemyAttack: new Image(),
            banana: new Image(),
            poop: new Image(),
            dumbbell: new Image()
        };
        
        this.initControls();
        this.loadResources().then(() => {
            this.init();
            this.gameLoop();
        }).catch(err => {
            console.error("资源加载失败:", err);
            alert(`资源加载错误: ${err.message}\n请检查控制台(◞‸◟ )`);
        });
    }
    
    async loadResources() {
        // 加载图片
        const loadImage = (key, path) => {
            return new Promise((resolve, reject) => {
                this.images[key].onload = resolve;
                this.images[key].onerror = () => 
                    reject(new Error(`加载失败: ${path}`));
                this.images[key].src = this.assetPrefix + path;
            });
        };

        await Promise.all([
            loadImage('playerStand', 'svg/stickman.svg'),
            loadImage('playerThrow', 'svg/throw.svg'),
            loadImage('playerFallen', 'svg/fallen.svg'),
            loadImage('enemyNormal', 'images/c.png'),
            loadImage('enemyHurt', 'images/e.png'),
            loadImage('enemyAttack', 'images/f.png'),
            loadImage('banana', 'svg/banana.svg'),
            loadImage('poop', 'svg/poop.svg'),
            loadImage('dumbbell', 'svg/dumbbell.svg')
        ]);

        console.log("所有资源加载完成！(๑•̀ㅂ•́)و✧");
    }
    
    init() {
        // 重置游戏状态
        this.score = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        this.isPlayerStunned = false;
        this.projectiles = [];
        this.enemyProjectiles = [];
        
        ui.updateScore(this.score);
        
        // 地板初始化（确保y坐标正确）
        this.floor = {
            x: 0,
            y: this.height - 50,
            width: this.width,
            height: 20
        };
        
        // 玩家初始化（居中显示）
        this.player = {
            x: this.width / 2 - 25,
            y: this.floor.y - 60,
            width: 50,
            height: 60,
            speed: 5,
            jumpPower: 12,
            velocityY: 0,
            isJumping: false,
            state: 'stand',
            direction: 'right',
            image: this.images.playerStand // 直接绑定图像
        };
        
        // 敌人初始化（右上角）
        this.enemy = {
            x: this.width - 100,
            y: 50,
            width: 80,
            height: 100,
            speed: 3,
            velocityX: Utils.randomFloat(-3, 3),
            velocityY: Utils.randomFloat(-1, 1),
            state: 'normal',
            hurtTimer: 0,
            behavior: this.getRandomBehavior(),
            behaviorTimer: Utils.randomInt(60, 180),
            image: this.images.enemyNormal // 直接绑定图像
        };

        console.log("游戏初始化完成！玩家位置:", this.player.x, this.player.y);
    }

    /* 后续所有方法保持不变（包括update、draw等） */
    // ...（保留原有游戏逻辑代码）...
}

// 添加调试快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'd' && e.ctrlKey) {
        console.log("=== 调试模式 ===");
        console.log("玩家:", game.player);
        console.log("大根:", game.enemy);
        game.ctx.fillStyle = 'rgba(0,255,0,0.3)';
        game.ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
        game.ctx.fillStyle = 'rgba(255,0,0,0.3)';
        game.ctx.fillRect(game.enemy.x, game.enemy.y, game.enemy.width, game.enemy.height);
    }
});
