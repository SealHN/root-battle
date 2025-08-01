// 游戏主逻辑
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("自动播放被阻止，请用户交互后播放"));
    
    // 游戏状态
    const gameState = {
        score: 0,
        isGameOver: false,
        isStickmanDown: false,
        lastShotTime: 0,
        projectiles: [],
        daikon: {
            element: document.getElementById('daikon'),
            x: window.innerWidth - 100,
            y: 20,
            width: 80,
            height: 80,
            speedX: 2,
            speedY: 0,
            state: 'normal', // normal, hurt, angry
            behaviorChangeTime: 0,
            currentBehavior: 'right',
            throwCooldown: 0
        },
        stickman: {
            element: document.getElementById('stickman'),
            x: window.innerWidth / 2 - 25,
            y: window.innerHeight - 120,
            width: 50,
            height: 100,
            speedX: 0,
            speedY: 0,
            isJumping: false,
            state: 'stand' // stand, throw, down
        },
        floor: {
            element: document.getElementById('floor'),
            y: window.innerHeight - 20,
            height: 20
        },
        controls: {
            left: false,
            right: false,
            jump: false
        }
    };
    
    // 初始化控制按钮
    document.getElementById('leftBtn').addEventListener('touchstart', () => gameState.controls.left = true);
    document.getElementById('leftBtn').addEventListener('touchend', () => gameState.controls.left = false);
    document.getElementById('rightBtn').addEventListener('touchstart', () => gameState.controls.right = true);
    document.getElementById('rightBtn').addEventListener('touchend', () => gameState.controls.right = false);
    document.getElementById('jumpBtn').addEventListener('touchstart', () => {
        if (!gameState.isStickmanDown && !gameState.stickman.isJumping) {
            gameState.stickman.speedY = -15;
            gameState.stickman.isJumping = true;
        }
    });
    
    // 鼠标/触摸控制
    document.addEventListener('click', (e) => {
        if (gameState.isGameOver || gameState.isStickmanDown) return;
        
        // 检查是否点击了控制按钮
        const controls = document.querySelector('.controls');
        if (controls.contains(e.target)) return;
        
        // 发射投射物
        const currentTime = Date.now();
        if (currentTime - gameState.lastShotTime > 2000) { // 2秒冷却
            shootProjectile(e.clientX, e.clientY);
            gameState.lastShotTime = currentTime;
            
            // 播放投掷动画
            gameState.stickman.element.classList.remove('throw');
            void gameState.stickman.element.offsetWidth; // 触发重绘
            gameState.stickman.element.classList.add('throw');
            
            setTimeout(() => {
                gameState.stickman.element.classList.remove('throw');
            }, 300);
        }
    });
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (gameState.isGameOver || gameState.isStickmanDown) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                gameState.controls.left = true;
                break;
            case 'ArrowRight':
                gameState.controls.right = true;
                break;
            case 'ArrowUp':
                if (!gameState.stickman.isJumping) {
                    gameState.stickman.speedY = -15;
                    gameState.stickman.isJumping = true;
                }
                break;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                gameState.controls.left = false;
                break;
            case 'ArrowRight':
                gameState.controls.right = false;
                break;
        }
    });
    
    // 发射投射物
    function shootProjectile(targetX, targetY) {
        // 确定发射位置
        const startX = gameState.stickman.x + gameState.stickman.width / 2;
        const startY = gameState.stickman.y + gameState.stickman.height / 2;
        
        // 计算方向
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 10;
        const velocityX = (dx / distance) * speed;
        const velocityY = (dy / distance) * speed;
        
        // 创建投射物
        const projectile = document.createElement('div');
        projectile.className = 'projectile';
        
        // 决定投射物类型 (95% 香蕉, 5% 大便)
        const isPoop = Math.random() < 0.05;
        if (isPoop) {
            projectile.classList.add('poop');
        } else {
            projectile.classList.add('banana');
        }
        
        projectile.style.left = `${startX}px`;
        projectile.style.top = `${startY}px`;
        
        document.querySelector('.game-container').appendChild(projectile);
        
        gameState.projectiles.push({
            element: projectile,
            x: startX,
            y: startY,
            velocityX: velocityX,
            velocityY: velocityY,
            type: isPoop ? 'poop' : 'banana',
            bounceCount: 0
        });
    }
    
    // 大根投掷哑铃
    function daikonThrowDumbbell() {
        if (gameState.daikon.throwCooldown > 0 || Math.random() > 0.2) return;
        
        const startX = gameState.daikon.x + gameState.daikon.width / 2;
        const startY = gameState.daikon.y + gameState.daikon.height / 2;
        
        // 目标为火柴人
        const targetX = gameState.stickman.x + gameState.stickman.width / 2;
        const targetY = gameState.stickman.y + gameState.stickman.height / 2;
        
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 8;
        const velocityX = (dx / distance) * speed;
        const velocityY = (dy / distance) * speed;
        
        const projectile = document.createElement('div');
        projectile.className = 'projectile dumbbell';
        projectile.style.left = `${startX}px`;
        projectile.style.top = `${startY}px`;
        
        document.querySelector('.game-container').appendChild(projectile);
        
        gameState.projectiles.push({
            element: projectile,
            x: startX,
            y: startY,
            velocityX: velocityX,
            velocityY: velocityY,
            type: 'dumbbell',
            bounceCount: 0,
            isDaikonProjectile: true
        });
        
        gameState.daikon.throwCooldown = 100 + Math.floor(Math.random() * 100); // 冷却时间
    }
    
    // 更新大根行为
    function updateDaikonBehavior() {
        if (gameState.isGameOver) return;
        
        // 行为改变逻辑
        if (gameState.daikon.behaviorChangeTime <= 0) {
            const r = Math.random();
            if (r < 0.6) {
                gameState.daikon.currentBehavior = 'right'; // 60% 左右移动
                gameState.daikon.speedX = Math.random() * 3 + 1;
                gameState.daikon.speedY = 0;
            } else if (r < 0.95) {
                gameState.daikon.currentBehavior = 'random'; // 35% 随机移动
                gameState.daikon.speedX = (Math.random() - 0.5) * 4;
                gameState.daikon.speedY = (Math.random() - 0.5) * 2;
            } else if (r < 0.99) {
                gameState.daikon.currentBehavior = 'updown'; // 4% 上下移动
                gameState.daikon.speedX = 0;
                gameState.daikon.speedY = Math.random() * 2 + 1;
            } else {
                gameState.daikon.currentBehavior = 'idle'; // 1% 不动
                gameState.daikon.speedX = 0;
                gameState.daikon.speedY = 0;
            }
            
            gameState.daikon.behaviorChangeTime = 60 + Math.floor(Math.random() * 120); // 1-3秒改变行为
        } else {
            gameState.daikon.behaviorChangeTime--;
        }
        
        // 更新位置
        gameState.daikon.x += gameState.daikon.speedX;
        gameState.daikon.y += gameState.daikon.speedY;
        
        // 边界检查
        if (gameState.daikon.x < 0) {
            gameState.daikon.x = 0;
            gameState.daikon.speedX *= -1;
        }
        if (gameState.daikon.x > window.innerWidth - gameState.daikon.width) {
            gameState.daikon.x = window.innerWidth - gameState.daikon.width;
            gameState.daikon.speedX *= -1;
        }
        if (gameState.daikon.y < 20) {
            gameState.daikon.y = 20;
            gameState.daikon.speedY *= -1;
        }
        if (gameState.daikon.y > window.innerHeight / 2) {
            gameState.daikon.y = window.innerHeight / 2;
            gameState.daikon.speedY *= -1;
        }
        
        // 更新元素位置
        gameState.daikon.element.style.left = `${gameState.daikon.x}px`;
        gameState.daikon.element.style.top = `${gameState.daikon.y}px`;
        
        // 投掷哑铃冷却
        if (gameState.daikon.throwCooldown > 0) {
            gameState.daikon.throwCooldown--;
        }
        
        // 尝试投掷哑铃
        daikonThrowDumbbell();
    }
    
    // 更新火柴人位置
    function updateStickman() {
        if (gameState.isGameOver || gameState.isStickmanDown) return;
        
        // 水平移动
        if (gameState.controls.left) {
            gameState.stickman.speedX = -8;
        } else if (gameState.controls.right) {
            gameState.stickman.speedX = 8;
        } else {
            gameState.stickman.speedX = 0;
        }
        
        // 更新位置
        gameState.stickman.x += gameState.stickman.speedX;
        gameState.stickman.y += gameState.stickman.speedY;
        
        // 重力
        gameState.stickman.speedY += 0.8;
        
        // 边界检查
        if (gameState.stickman.x < 0) {
            gameState.stickman.x = 0;
        }
        if (gameState.stickman.x > window.innerWidth - gameState.stickman.width) {
            gameState.stickman.x = window.innerWidth - gameState.stickman.width;
        }
        
        // 地板碰撞
        if (gameState.stickman.y + gameState.stickman.height > gameState.floor.y) {
            gameState.stickman.y = gameState.floor.y - gameState.stickman.height;
            gameState.stickman.speedY = 0;
            gameState.stickman.isJumping = false;
        }
        
        // 更新元素位置
        gameState.stickman.element.style.left = `${gameState.stickman.x}px`;
        gameState.stickman.element.style.top = `${gameState.stickman.y}px`;
    }
    
    // 更新投射物
    function updateProjectiles() {
        for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
            const p = gameState.projectiles[i];
            
            // 更新位置
            p.x += p.velocityX;
            p.y += p.velocityY;
            
            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;
            
            // 边界碰撞检测
            if (p.x < 0 || p.x > window.innerWidth - 30 || 
                p.y < 0 || p.y > window.innerHeight - 30) {
                
                p.bounceCount++;
                
                if (p.bounceCount > 3) {
                    // 超过3次反弹，移除投射物
                    p.element.remove();
                    gameState.projectiles.splice(i, 1);
                    
                    // 如果是香蕉消失且游戏未结束，触发大根狂暴化
                    if (p.type === 'banana' && !gameState.isGameOver) {
                        triggerGameOver('banana_disappeared');
                    }
                    continue;
                }
                
                // 反弹
                if (p.x < 0 || p.x > window.innerWidth - 30) {
                    p.velocityX *= -0.8;
                }
                if (p.y < 0 || p.y > window.innerHeight - 30) {
                    p.velocityY *= -0.8;
                }
                
                // 确保投射物不会卡在边界外
                p.x = Math.max(0, Math.min(p.x, window.innerWidth - 30));
                p.y = Math.max(0, Math.min(p.y, window.innerHeight - 30));
            }
            
            // 投射物与大根碰撞检测
            if (!p.isDaikonProjectile && 
                p.x + 30 > gameState.daikon.x && 
                p.x < gameState.daikon.x + gameState.daikon.width &&
                p.y + 30 > gameState.daikon.y && 
                p.y < gameState.daikon.y + gameState.daikon.height) {
                
                // 击中大根
                p.element.remove();
                gameState.projectiles.splice(i, 1);
                
                // 根据投射物类型更新分数
                if (p.type === 'banana') {
                    gameState.score++;
                    document.getElementById('score').textContent = gameState.score;
                    
                    // 检查胜利条件
                    if (gameState.score >= 13) {
                        triggerVictory();
                        return;
                    }
                } else if (p.type === 'poop') {
                    gameState.score -= 2;
                    document.getElementById('score').textContent = gameState.score;
                    
                    // 检查失败条件
                    if (gameState.score < 0) {
                        triggerGameOver('score_below_zero');
                        return;
                    }
                }
                
                // 大根受伤状态
                gameState.daikon.state = 'hurt';
                gameState.daikon.element.style.backgroundImage = 'url("assets/images/e.png")';
                
                setTimeout(() => {
                    if (gameState.daikon.state === 'hurt') {
                        gameState.daikon.state = 'normal';
                        gameState.daikon.element.style.backgroundImage = 'url("assets/images/c.png")';
                    }
                }, 500);
            }
            
            // 投射物与火柴人碰撞检测 (仅限哑铃)
            if (p.isDaikonProjectile && p.type === 'dumbbell' &&
                p.x + 30 > gameState.stickman.x && 
                p.x < gameState.stickman.x + gameState.stickman.width &&
                p.y + 30 > gameState.stickman.y && 
                p.y < gameState.stickman.y + gameState.stickman.height) {
                
                // 哑铃击中火柴人
                p.element.remove();
                gameState.projectiles.splice(i, 1);
                
                gameState.score--;
                document.getElementById('score').textContent = gameState.score;
                
                // 火柴人倒下3秒
                stickmanDown(3000);
                
                // 检查失败条件
                if (gameState.score < 0) {
                    triggerGameOver('score_below_zero');
                    return;
                }
            }
        }
    }
    
    // 火柴人与大根碰撞检测
    function checkStickmanDaikonCollision() {
        if (gameState.isGameOver || gameState.isStickmanDown) return;
        
        if (gameState.stickman.x + gameState.stickman.width > gameState.daikon.x &&
            gameState.stickman.x < gameState.daikon.x + gameState.daikon.width &&
            gameState.stickman.y + gameState.stickman.height > gameState.daikon.y &&
            gameState.stickman.y < gameState.daikon.y + gameState.daikon.height) {
            
            // 火柴人倒下5秒
            stickmanDown(5000);
        }
    }
    
    // 火柴人倒下
    function stickmanDown(duration) {
        gameState.isStickmanDown = true;
        gameState.stickman.element.classList.add('down');
        
        setTimeout(() => {
            gameState.isStickmanDown = false;
            gameState.stickman.element.classList.remove('down');
        }, duration);
    }
    
    // 触发胜利
    function triggerVictory() {
        gameState.isGameOver = true;
        setTimeout(() => {
            window.location.href = 'victory.html';
        }, 1000);
    }
    
    // 触发游戏结束
    function triggerGameOver(reason) {
        gameState.isGameOver = true;
        
        // 大根狂暴化
        gameState.daikon.state = 'angry';
        gameState.daikon.element.style.backgroundImage = 'url("assets/images/f.png")';
        
        // 大根冲向火柴人
        const daikonAttack = setInterval(() => {
            const dx = gameState.stickman.x - gameState.daikon.x;
            const dy = (gameState.stickman.y - gameState.daikon.y) * 0.5;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            gameState.daikon.x += (dx / distance) * 10;
            gameState.daikon.y += (dy / distance) * 10;
            
            gameState.daikon.element.style.left = `${gameState.daikon.x}px`;
            gameState.daikon.element.style.top = `${gameState.daikon.y}px`;
            
            // 检查是否击中火柴人
            if (distance < 30) {
                clearInterval(daikonAttack);
                
                // 火柴人消失
                gameState.stickman.element.style.opacity = '0';
                
                // 跳转到游戏结束页面
                setTimeout(() => {
                    window.location.href = 'gameover.html';
                }, 500);
            }
        }, 30);
    }
    
    // 游戏主循环
    function gameLoop() {
        if (!gameState.isGameOver) {
            updateStickman();
            updateDaikonBehavior();
            updateProjectiles();
            checkStickmanDaikonCollision();
        }
        requestAnimationFrame(gameLoop);
    }
    
    // 开始游戏循环
    gameLoop();
    
    // 窗口大小调整
    window.addEventListener('resize', () => {
        gameState.floor.y = window.innerHeight - 20;
        gameState.floor.element.style.height = '20px';
        gameState.floor.element.style.bottom = '0';
        
        gameState.stickman.y = window.innerHeight - 120;
    });
});
