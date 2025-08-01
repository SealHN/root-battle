// 主游戏逻辑
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
        
        // 资源
        this.images = {};
        this.audios = {};
        
        this.initControls();
        this.loadResources().then(() => this.init());
    }
    
    async loadResources() {
        try {
            // 加载图片
            this.images.playerStand = await Utils.loadImage('assets/svg/stickman.svg');
            this.images.playerThrow = await Utils.loadImage('assets/svg/throw.svg');
            this.images.playerFallen = await Utils.loadImage('assets/svg/fallen.svg');
            this.images.enemyNormal = await Utils.loadImage('assets/images/c.png');
            this.images.enemyHurt = await Utils.loadImage('assets/images/e.png');
            this.images.enemyAttack = await Utils.loadImage('assets/images/f.png');
            this.images.banana = await Utils.loadImage('assets/svg/banana.svg');
            this.images.poop = await Utils.loadImage('assets/svg/poop.svg');
            this.images.dumbbell = await Utils.loadImage('assets/svg/dumbbell.svg');
            
            // 加载音频
            this.audios.throw = new Audio();
            this.audios.hit = new Audio();
            this.audios.hurt = new Audio();
        } catch (error) {
            console.error('资源加载失败:', error);
        }
    }
    
    init() {
        this.score = 0;
        this.isGameOver = false;
        this.isGameWon = false;
        this.isPlayerStunned = false;
        this.stunTimer = 0;
        this.projectileCooldown = 0;
        this.projectiles = [];
        this.enemyProjectiles = [];
        
        ui.updateScore(this.score);
        
        // 初始化地板
        this.floor = {
            x: 0,
            y: this.height - 50,
            width: this.width,
            height: 20
        };
        
        // 初始化玩家
        this.player = {
            x: this.width / 2 - 25,
            y: this.floor.y - 60,
            width: 50,
            height: 60,
            speed: 5,
            jumpPower: 12,
            velocityY: 0,
            isJumping: false,
            state: 'stand', // stand, throw, fallen
            direction: 'right'
        };
        
        // 初始化敌人
        this.enemy = {
            x: this.width - 100,
            y: 50,
            width: 80,
            height: 100,
            speed: 3,
            velocityX: Utils.randomFloat(-3, 3),
            velocityY: Utils.randomFloat(-1, 1),
            state: 'normal', // normal, hurt, attack
            hurtTimer: 0,
            attackTimer: 0,
            behavior: this.getRandomBehavior(),
            behaviorTimer: 0,
            throwTimer: 0
        };
        
        this.gameLoop();
    }
    
    initControls() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.isPlayerStunned) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = true;
                    this.player.direction = 'left';
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    this.player.direction = 'right';
                    break;
                case 'ArrowUp':
                case ' ':
                    if (!this.player.isJumping) {
                        this.keys.jump = true;
                        this.player.velocityY = -this.player.jumpPower;
                        this.player.isJumping = true;
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case ' ':
                    this.keys.jump = false;
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('left-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.left = true;
            this.player.direction = 'left';
        });
        
        document.getElementById('left-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.left = false;
        });
        
        document.getElementById('right-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.keys.right = true;
            this.player.direction = 'right';
        });
        
        document.getElementById('right-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.right = false;
        });
        
        document.getElementById('jump-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.player.isJumping && !this.isPlayerStunned) {
                this.keys.jump = true;
                this.player.velocityY = -this.player.jumpPower;
                this.player.isJumping = true;
            }
        });
        
        document.getElementById('jump-btn').addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys.jump = false;
        });
        
        // 点击发射
        this.canvas.addEventListener('click', (e) => {
            if (this.isGameOver || this.isPlayerStunned || this.projectileCooldown > 0) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            this.throwProjectile(clickX, clickY);
        });
        
        // 触摸发射
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isGameOver || this.isPlayerStunned || this.projectileCooldown > 0) return;
            
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            this.throwProjectile(touchX, touchY);
        });
    }
    
    throwProjectile(targetX, targetY) {
        if (this.projectileCooldown > 0) return;
        
        this.projectileCooldown = 40; // 2秒冷却 (60帧/秒)
        this.player.state = 'throw';
        
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;
        
        // 计算方向
        const dx = targetX - playerCenterX;
        const dy = targetY - playerCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocityX = (dx / distance) * 10;
        const velocityY = (dy / distance) * 10;
        
        // 决定发射什么 (95%香蕉, 5%大便)
        const isPoop = Math.random() < 0.05;
        const type = isPoop ? 'poop' : 'banana';
        
        this.projectiles.push({
            x: playerCenterX - 15,
            y: playerCenterY - 15,
            width: 30,
            height: 30,
            velocityX,
            velocityY,
            type,
            bounces: 0,
            image: isPoop ? this.images.poop : this.images.banana
        });
    }
    
    getRandomBehavior() {
        const rand = Math.random() * 100;
        
        if (rand < 60) {
            return 'leftRight'; // 60% 左右移动
        } else if (rand < 95) {
            return 'random';   // 35% 随机移动
        } else if (rand < 99) {
            return 'upDown';  // 4% 上下移动
        } else {
            return 'idle';     // 1% 不动
        }
    }
    
    updateEnemyBehavior() {
        this.enemy.behaviorTimer--;
        
        if (this.enemy.behaviorTimer <= 0) {
            this.enemy.behavior = this.getRandomBehavior();
            this.enemy.behaviorTimer = Utils.randomInt(60, 180); // 1-3秒
            
            // 根据行为设置速度
            switch(this.enemy.behavior) {
                case 'leftRight':
                    this.enemy.velocityX = Utils.randomFloat(-3, 3);
                    this.enemy.velocityY = 0;
                    break;
                case 'random':
                    this.enemy.velocityX = Utils.randomFloat(-3, 3);
                    this.enemy.velocityY = Utils.randomFloat(-3, 3);
                    break;
                case 'upDown':
                    this.enemy.velocityX = 0;
                    this.enemy.velocityY = Utils.randomFloat(-2, 2);
                    break;
                case 'idle':
                    this.enemy.velocityX = 0;
                    this.enemy.velocityY = 0;
                    break;
            }
        }
    }
    
    updateEnemy() {
        // 更新行为
        this.updateEnemyBehavior();
        
        // 受伤状态处理
        if (this.enemy.state === 'hurt') {
            this.enemy.hurtTimer--;
            
            if (this.enemy.hurtTimer <= 0) {
                this.enemy.state = 'normal';
            }
        }
        
        // 攻击状态处理 (游戏结束时)
        if (this.enemy.state === 'attack') {
            // 直线冲向玩家
            const dx = this.player.x - this.enemy.x;
            const dy = (this.player.y - 30) - this.enemy.y; // 瞄准玩家上方一点
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            this.enemy.velocityX = (dx / distance) * 8;
            this.enemy.velocityY = (dy / distance) * 8;
        }
        
        // 投掷哑铃
        if (this.enemy.state !== 'attack' && this.enemy.throwTimer <= 0 && Math.random() < 0.003) {
            this.throwDumbbell();
            this.enemy.throwTimer = Utils.randomInt(120, 300); // 2-5秒冷却
        } else {
            this.enemy.throwTimer--;
        }
        
        // 更新位置
        this.enemy.x += this.enemy.velocityX;
        this.enemy.y += this.enemy.velocityY;
        
        // 边界检查
        if (this.enemy.x < 0) {
            this.enemy.x = 0;
            this.enemy.velocityX *= -1;
        } else if (this.enemy.x + this.enemy.width > this.width) {
            this.enemy.x = this.width - this.enemy.width;
            this.enemy.velocityX *= -1;
        }
        
        if (this.enemy.y < 0) {
            this.enemy.y = 0;
            this.enemy.velocityY *= -1;
        } else if (this.enemy.y + this.enemy.height > this.floor.y) {
            this.enemy.y = this.floor.y - this.enemy.height;
            this.enemy.velocityY *= -1;
        }
    }
    
    throwDumbbell() {
        const enemyCenterX = this.enemy.x + this.enemy.width / 2;
        const enemyCenterY = this.enemy.y + this.enemy.height / 2;
        
        // 计算朝向玩家的方向
        const dx = this.player.x - enemyCenterX;
        const dy = this.player.y - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocityX = (dx / distance) * 6;
        const velocityY = (dy / distance) * 6;
        
        this.enemyProjectiles.push({
            x: enemyCenterX - 15,
            y: enemyCenterY - 15,
            width: 30,
            height: 30,
            velocityX,
            velocityY,
            type: 'dumbbell',
            image: this.images.dumbbell
        });
    }
    
    updatePlayer() {
        if (this.isPlayerStunned) {
            this.stunTimer--;
            
            if (this.stunTimer <= 0) {
                this.isPlayerStunned = false;
                this.player.state = 'stand';
            }
            return;
        }
        
        // 左右移动
        if (this.keys.left) {
            this.player.x -= this.player.speed;
            this.player.direction = 'left';
        }
        if (this.keys.right) {
            this.player.x += this.player.speed;
            this.player.direction = 'right';
        }
        
        // 跳跃和重力
        this.player.y += this.player.velocityY;
        this.player.velocityY += 0.5; // 重力
        
        // 地板碰撞检测
        if (this.player.y + this.player.height > this.floor.y) {
            this.player.y = this.floor.y - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // 边界检查
        if (this.player.x < 0) {
            this.player.x = 0;
        } else if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width;
        }
        
        // 投掷动画恢复
        if (this.player.state === 'throw' && this.projectileCooldown < 30) {
            this.player.state = 'stand';
        }
    }
    
    updateProjectiles() {
        // 更新冷却时间
        if (this.projectileCooldown > 0) {
            this.projectileCooldown--;
        }
        
        // 更新玩家发射的投射物
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // 更新位置
            proj.x += proj.velocityX;
            proj.y += proj.velocityY;
            
            // 边界碰撞检测
            if (proj.x < 0 || proj.x + proj.width > this.width || 
                proj.y < 0 || proj.y + proj.height > this.floor.y) {
                
                proj.velocityX *= -0.8;
                proj.velocityY *= -0.8;
                proj.bounces++;
                
                // 香蕉和大便反弹3次后消失
                if ((proj.type === 'banana' || proj.type === 'poop') && proj.bounces >= 3) {
                    this.projectiles.splice(i, 1);
                    
                    // 香蕉消失导致游戏结束
                    if (proj.type === 'banana') {
                        this.gameOver();
                    }
                    continue;
                }
            }
            
            // 检测与敌人的碰撞
            if (Utils.checkCollision(proj, this.enemy) && this.enemy.state !== 'attack') {
                this.projectiles.splice(i, 1);
                
                // 击中敌人
                this.enemy.state = 'hurt';
                this.enemy.hurtTimer = 30; // 0.5秒受伤状态
                
                if (proj.type === 'banana') {
                    this.score++;
                    ui.updateScore(this.score);
                    
                    if (this.score >= 13) {
                        this.gameWon();
                    }
                } else if (proj.type === 'poop') {
                    this.score -= 2;
                    ui.updateScore(this.score);
                    
                    if (this.score < 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        // 更新敌人发射的投射物
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            
            // 更新位置
            proj.x += proj.velocityX;
            proj.y += proj.velocityY;
            
            // 边界碰撞检测
            if (proj.x < 0 || proj.x + proj.width > this.width || 
                proj.y < 0 || proj.y + proj.height > this.floor.y) {
                this.enemyProjectiles.splice(i, 1);
                continue;
            }
            
            // 检测与玩家的碰撞
            if (Utils.checkCollision(proj, this.player) {
                this.enemyProjectiles.splice(i, 1);
                
                // 被哑铃击中
                if (!this.isPlayerStunned) {
                    this.isPlayerStunned = true;
                    this.stunTimer = 180; // 3秒眩晕
                    this.player.state = 'fallen';
                    this.score--;
                    ui.updateScore(this.score);
                    
                    if (this.score < 0) {
                        this.gameOver();
                    }
                }
            }
        }
    }
    
    checkPlayerEnemyCollision() {
        if (Utils.checkCollision(this.player, this.enemy) && !this.isPlayerStunned) {
            this.isPlayerStunned = true;
            this.stunTimer = 300; // 5秒眩晕
            this.player.state = 'fallen';
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.enemy.state = 'attack';
        this.enemy.attackTimer = 9999;
    }
    
    gameWon() {
        this.isGameWon = true;
        ui.showWinScreen();
    }
    
    update() {
        if (this.isGameOver) {
            // 等待敌人撞击玩家
            if (Utils.checkCollision(this.player, this.enemy)) {
                this.player.state = 'fallen';
                ui.showLoseScreen();
            }
            return;
        }
        
        if (this.isGameWon) return;
        
        this.updatePlayer();
        this.updateEnemy();
        this.updateProjectiles();
        this.checkPlayerEnemyCollision();
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制地板
        this.ctx.fillStyle = 'rgba(100, 70, 30, 0.7)';
        this.ctx.fillRect(this.floor.x, this.floor.y, this.floor.width, this.floor.height);
        
        // 绘制玩家
        let playerImage;
        switch(this.player.state) {
            case 'stand':
                playerImage = this.images.playerStand;
                break;
            case 'throw':
                playerImage = this.images.playerThrow;
                break;
            case 'fallen':
                playerImage = this.images.playerFallen;
                break;
        }
        
        // 根据方向翻转图像
        this.ctx.save();
        if (this.player.direction === 'left') {
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(
                playerImage, 
                -this.player.x - this.player.width, 
                this.player.y, 
                this.player.width, 
                this.player.height
            );
        } else {
            this.ctx.drawImage(
                playerImage, 
                this.player.x, 
                this.player.y, 
                this.player.width, 
                this.player.height
            );
        }
        this.ctx.restore();
        
        // 绘制敌人
        let enemyImage;
        switch(this.enemy.state) {
            case 'normal':
                enemyImage = this.images.enemyNormal;
                break;
            case 'hurt':
                enemyImage = this.images.enemyHurt;
                break;
            case 'attack':
                enemyImage = this.images.enemyAttack;
                break;
        }
        this.ctx.drawImage(enemyImage, this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height);
        
        // 绘制投射物
        this.projectiles.forEach(proj => {
            this.ctx.drawImage(proj.image, proj.x, proj.y, proj.width, proj.height);
        });
        
        // 绘制敌人投射物
        this.enemyProjectiles.forEach(proj => {
            this.ctx.drawImage(proj.image, proj.x, proj.y, proj.width, proj.height);
        });
        
        // 游戏结束时的红色覆盖层
        if (this.isGameOver && Utils.checkCollision(this.player, this.enemy)) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        
        if (!this.isGameWon) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

const game = new Game();
