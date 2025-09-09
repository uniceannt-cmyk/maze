const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const rows = 15;
const cols = 15;
const cellSize = 30;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let maze = [];
let player = { r: 0, c: 0 };
let goal = { r: rows - 1, c: cols - 1 };

// Cell constructor
function Cell(r, c) {
  this.r = r;
  this.c = c;
  this.visited = false;
  this.walls = { top: true, right: true, bottom: true, left: true };
}

// Maze generation: Recursive Backtracker
function generateMaze() {
  maze = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => new Cell(r, c))
  );

  let stack = [];
  let current = maze[0][0];
  current.visited = true;
  stack.push(current);

  while (stack.length > 0) {
    current = stack.pop();
    const neighbors = getUnvisitedNeighbors(current);

    if (neighbors.length > 0) {
      stack.push(current);
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    }
  }

  player = { r: 0, c: 0 };
  drawMaze();
}

function getUnvisitedNeighbors(cell) {
  const { r, c } = cell;
  const neighbors = [];

  if (r > 0 && !maze[r - 1][c].visited) neighbors.push(maze[r - 1][c]);
  if (c < cols - 1 && !maze[r][c + 1].visited) neighbors.push(maze[r][c + 1]);
  if (r < rows - 1 && !maze[r + 1][c].visited) neighbors.push(maze[r + 1][c]);
  if (c > 0 && !maze[r][c - 1].visited) neighbors.push(maze[r][c - 1]);

  return neighbors;
}

function removeWalls(a, b) {
  if (a.r === b.r) {
    if (a.c > b.c) {
      a.walls.left = false;
      b.walls.right = false;
    } else {
      a.walls.right = false;
      b.walls.left = false;
    }
  } else if (a.c === b.c) {
    if (a.r > b.r) {
      a.walls.top = false;
      b.walls.bottom = false;
    } else {
      a.walls.bottom = false;
      b.walls.top = false;
    }
  }
}

// Draw maze and player
function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = maze[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      if (cell.walls.top) drawWall(x, y, x + cellSize, y);
      if (cell.walls.right) drawWall(x + cellSize, y, x + cellSize, y + cellSize);
      if (cell.walls.bottom) drawWall(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.walls.left) drawWall(x, y, x, y + cellSize);
    }
  }

  // Goal
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(goal.c * cellSize + 4, goal.r * cellSize + 4, cellSize - 8, cellSize - 8);

  // Player
  ctx.fillStyle = "dodgerblue";
  ctx.fillRect(player.c * cellSize + 6, player.r * cellSize + 6, cellSize - 12, cellSize - 12);
}

function drawWall(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Movement
function movePlayer(dr, dc) {
  const cell = maze[player.r][player.c];
  if (dr === -1 && !cell.walls.top) player.r--;
  if (dr === 1 && !cell.walls.bottom) player.r++;
  if (dc === -1 && !cell.walls.left) player.c--;
  if (dc === 1 && !cell.walls.right) player.c++;

  drawMaze();

  if (player.r === goal.r && player.c === goal.c) {
    setTimeout(() => alert("🎉 You reached the goal!"), 50);
  }
}

// --- Keyboard Controls ---
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "w") movePlayer(-1, 0);
  if (e.key === "ArrowDown" || e.key === "s") movePlayer(1, 0);
  if (e.key === "ArrowLeft" || e.key === "a") movePlayer(0, -1);
  if (e.key === "ArrowRight" || e.key === "d") movePlayer(0, 1);
});

// --- Touch Controls (Swipe) ---
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchend", (e) => {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) movePlayer(0, 1); // right
    if (dx < -30) movePlayer(0, -1); // left
  } else {
    if (dy > 30) movePlayer(1, 0); // down
    if (dy < -30) movePlayer(-1, 0); // up
  }
});

// --- On-screen Buttons ---
document.getElementById("upBtn").onclick = () => movePlayer(-1, 0);
document.getElementById("downBtn").onclick = () => movePlayer(1, 0);
document.getElementById("leftBtn").onclick = () => movePlayer(0, -1);
document.getElementById("rightBtn").onclick = () => movePlayer(0, 1);

// Initialize
generateMaze();
