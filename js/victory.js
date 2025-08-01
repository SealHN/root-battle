// 胜利页面逻辑
document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.5;
    bgMusic.play().catch(e => console.log("自动播放被阻止，请用户交互后播放"));
});

function restartGame() {
    // 直接跳转到游戏页面，不显示说明
    window.location.href = 'game.html';
}

function returnToMain() {
    window.location.href = 'index.html';
}
