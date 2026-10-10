const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreText = document.getElementById("finalScore");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND = 330;

let state = "ready";
let score = 0;
let best = Number(localStorage.getItem("pixelJumpBest") || 0);
let speed = 5;
let frame = 0;
let obstacles = [];
let clouds = [];
let animationId = null;

const player = {
  x: 90,
  y: GROUND - 30,
  width: 30,
  height: 30,
  vy: 0,
  jumpPower: 12,
  gravity: 0.55,
  grounded: true,
};

function setBest(value) {
  best = value;
  localStorage.setItem("pixelJumpBest", String(best));
  if (bestText) {
    bestText.textContent = `BEST: ${best}`;
  }
}

function updateScoreboard() {
  if (scoreText) {
    scoreText.textContent = `SCORE: ${score}`;
  }
  if (bestText) {
    bestText.textContent = `BEST: ${best}`;
  }
}

function makeClouds() {
  clouds = [
    { x: 100, y: 65 },
    { x: 390, y: 105 },
    { x: 650, y: 55 },
  ];
}

function resetGame() {
  state = "playing";
  score = 0;
  speed = 5;
  frame = 0;
  obstacles = [];
  player.y = GROUND - player.height;
  player.vy = 0;
  player.grounded = true;
  makeClouds();
  updateScoreboard();
}

function startGame() {
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  resetGame();
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  state = "gameover";
  if (score > best) {
    setBest(score);
  }
  finalScoreText.textContent = `Your score: ${score}`;
  gameOverScreen.classList.remove("hidden");
}

function jump() {
  if (state === "ready") {
    startGame();
    return;
  }

  if (state === "gameover") {
    startGame();
    return;
  }

  if (player.grounded) {
    player.vy = -player.jumpPower;
    player.grounded = false;
  }
}

function spawnObstacle() {
  const width = 28 + Math.random() * 26;
  const height = 26 + Math.random() * 50;
  obstacles.push({
    x: WIDTH + 30,
    y: GROUND - height,
    width,
    height,
  });
}

function update() {
  frame += 1;
  score = Math.floor(frame / 10);
  speed = 5 + Math.min(score * 0.08, 8);

  if (frame % 90 === 0) {
    spawnObstacle();
  }

  clouds.forEach((cloud) => {
    cloud.x -= speed * 0.4;
    if (cloud.x < -80) {
      cloud.x = WIDTH + 40;
      cloud.y = 35 + Math.random() * 100;
    }
  });

  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y + player.height >= GROUND) {
    player.y = GROUND - player.height;
    player.vy = 0;
    player.grounded = true;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= speed;

    if (obstacle.x + obstacle.width < 0) {
      obstacle.hit = true;
    }

    const playerRect = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
    };

    const obstacleRect = {
      x: obstacle.x,
      y: obstacle.y,
      width: obstacle.width,
      height: obstacle.height,
    };

    if (
      playerRect.x < obstacleRect.x + obstacleRect.width &&
      playerRect.x + playerRect.width > obstacleRect.x &&
      playerRect.y < obstacleRect.y + obstacleRect.height &&
      playerRect.y + playerRect.height > obstacleRect.y
    ) {
      endGame();
      return;
    }
  }

  obstacles = obstacles.filter((obstacle) => !obstacle.hit);
  updateScoreboard();
}

function drawGround() {
  ctx.fillStyle = "#63b86c";
  ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);

  ctx.fillStyle = "#d9f99d";
  for (let i = 0; i < WIDTH; i += 24) {
    ctx.fillRect(i + (frame % 24), GROUND + 14, 14, 6);
  }
}

function drawCloud(cloud) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, 18, 0, Math.PI * 2);
  ctx.arc(cloud.x + 24, cloud.y - 4, 16, 0, Math.PI * 2);
  ctx.arc(cloud.x + 48, cloud.y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  ctx.fillStyle = "#facc15";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#111827";
  ctx.fillRect(player.x + 7, player.y + 8, 5, 5);
  ctx.fillRect(player.x + 18, player.y + 8, 5, 5);
  ctx.fillRect(player.x + 8, player.y + 19, 14, 4);
}

function drawObstacles() {
  ctx.fillStyle = "#ef4444";
  for (const obstacle of obstacles) {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  }
}

function drawScene() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#7bdff2";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#a7f3d0";
  ctx.fillRect(0, 250, WIDTH, 80);

  clouds.forEach(drawCloud);
  drawGround();
  drawObstacles();
  drawPlayer();
}

function gameLoop() {
  if (state === "playing") {
    update();
  }
  drawScene();

  if (state === "playing") {
    animationId = requestAnimationFrame(gameLoop);
  } else if (state === "gameover") {
    animationId = null;
  }
}

window.addEventListener("keydown", (event) => {
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

makeClouds();
updateScoreboard();
drawScene();