// 主页面逻辑
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("自动播放被阻止，请用户交互后播放"));
});

function toggleVolume() {
    const bgMusic = document.getElementById('bgMusic');
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (bgMusic.paused) {
        bgMusic.play();
        volumeIcon.textContent = '🔊';
    } else {
        bgMusic.pause();
        volumeIcon.textContent = '🔇';
    }
}

function startGame() {
    // 显示游戏说明
    const modal = document.getElementById('instructionModal');
    modal.style.display = 'flex';
    
    // 点击任意处关闭说明并开始游戏
    modal.addEventListener('click', () => {
        modal.style.display = 'none';
        // 跳转到游戏页面
        window.location.href = 'game.html';
    });
}
