const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const roundEl = document.getElementById("round");
const resolutionEl = document.getElementById("resolution");

const offscreen = document.createElement("canvas");
const offCtx = offscreen.getContext("2d");
offCtx.imageSmoothingEnabled = false;

let img = new Image();
let answer = "";

let pixels = 4;
let maxPixels = 0;

let round = 1;
let gameOver = false;

async function loadPokemon() {
  pixels = 4;
  gameOver = false;

  updateHUD();

  const id = Math.floor(Math.random() * 151) + 1;
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  answer = data.name.toLowerCase();

  img = new Image();
  img.crossOrigin = "anonymous";
  img.src = data.sprites.other["official-artwork"].front_default;

  img.onload = () => {
    maxPixels = Math.min(img.width, img.height);
    draw();
  };
}

function updateHUD() {
  roundEl.textContent = `Round: ${round}`;
  resolutionEl.textContent = `Resolution: ${pixels}px x ${pixels}px`;
}

function draw() {
  pixels = Math.min(pixels, maxPixels);
  updateHUD();

  offscreen.width = pixels;
  offscreen.height = pixels;

  offCtx.clearRect(0, 0, pixels, pixels);
  offCtx.drawImage(img, 0, 0, pixels, pixels);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

  if (pixels >= maxPixels && !gameOver) {
    gameOver = true;
    setTimeout(() => {
    showMessage(`Out of reveals! It was ${answer.toUpperCase()}.`, "error");
      round++;
      loadPokemon();
    }, 200);
  }
}

document.getElementById("next").onclick = () => {
  if (gameOver) return;
  if (pixels < maxPixels) {
    pixels *= 2;
    draw();
  }
};

document.getElementById("submit").onclick = () => {
  if (gameOver) return;

  const guess = document
    .getElementById("guess")
    .value
    .trim()
    .toLowerCase();

  if (!guess) return;

  if (guess === answer) {
showMessage(`Correct! It was ${answer.toUpperCase()}`, "success");
    round++;
    document.getElementById("guess").value = "";
    loadPokemon();
  } else {
showMessage(`Wrong guess: ${guess.toUpperCase()}`, "error");
  }
};

function showMessage(text, type = "success") {
  const container = document.getElementById("message-container");
  const message = document.createElement("div");
  message.classList.add("message", type);
  message.textContent = text;
  container.appendChild(message);

  setTimeout(() => {
    container.removeChild(message);
  }, 3000);

  message.addEventListener("click", () => {
    if (container.contains(message)) container.removeChild(message);
  });
}


// Start game
loadPokemon();
