// UI交互逻辑
class UI {
    constructor() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.winScreen = document.getElementById('win-screen');
        this.loseScreen = document.getElementById('lose-screen');
        this.instructions = document.getElementById('instructions');
        this.volumeToggle = document.getElementById('volume-toggle');
        this.bgmMenu = document.getElementById('bgm-menu');
        this.bgmGame = document.getElementById('bgm-game');
        this.bgmWin = document.getElementById('bgm-win');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.returnBtn = document.getElementById('return-btn');
        this.retryBtn = document.getElementById('retry-btn');
        this.backBtn = document.getElementById('back-btn');
        
        this.isMuted = false;
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 主菜单点击开始游戏
        this.mainMenu.addEventListener('click', () => {
            this.showInstructions();
        });
        
        // 音量开关
        this.volumeToggle.addEventListener('click', () => {
            this.toggleMute();
        });
        
        // 关闭说明弹窗
        this.instructions.addEventListener('click', () => {
            this.hideInstructions();
            this.startGame();
        });
        
        // 游戏结束按钮
        this.playAgainBtn.addEventListener('click', () => {
            this.restartGame(false);
        });
        
        this.returnBtn.addEventListener('click', () => {
            this.returnToMenu();
        });
        
        this.retryBtn.addEventListener('click', () => {
            this.restartGame(false);
        });
        
        this.backBtn.addEventListener('click', () => {
            this.returnToMenu();
        });
    }
    
    showInstructions() {
        this.instructions.classList.remove('hidden');
        this.bgmMenu.pause();
    }
    
    hideInstructions() {
        this.instructions.classList.add('hidden');
    }
    
    startGame() {
        this.mainMenu.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.bgmGame.currentTime = 0;
        this.bgmGame.play();
    }
    
    showWinScreen() {
        this.gameScreen.classList.add('hidden');
        this.winScreen.classList.remove('hidden');
        this.bgmGame.pause();
        this.bgmWin.currentTime = 0;
        this.bgmWin.play();
    }
    
    showLoseScreen() {
        this.gameScreen.classList.add('hidden');
        this.loseScreen.classList.remove('hidden');
        this.bgmGame.pause();
    }
    
    restartGame(showInstructions) {
        this.winScreen.classList.add('hidden');
        this.loseScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.bgmGame.currentTime = 0;
        this.bgmGame.play();
        
        if (showInstructions) {
            this.showInstructions();
        } else {
            game.init();
        }
    }
    
    returnToMenu() {
        this.winScreen.classList.add('hidden');
        this.loseScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.mainMenu.classList.remove('hidden');
        this.bgmGame.pause();
        this.bgmWin.pause();
        this.bgmMenu.currentTime = 0;
        this.bgmMenu.play();
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.bgmMenu.muted = this.isMuted;
        this.bgmGame.muted = this.isMuted;
        this.bgmWin.muted = this.isMuted;
        this.volumeToggle.textContent = this.isMuted ? '🔇' : '🔊';
    }
    
    updateScore(score) {
        const scoreDisplay = document.getElementById('score-display');
        scoreDisplay.textContent = `得分: ${score}`;
    }
}

const ui = new UI();
