const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// HUD
const roundEl = document.getElementById("round");
const resolutionEl = document.getElementById("resolution");

// Offscreen canvas
const offscreen = document.createElement("canvas");
const offCtx = offscreen.getContext("2d");
offCtx.imageSmoothingEnabled = false;

let img = new Image();
let answer = "";

let pixels = 4;
let maxPixels = 0;

let round = 1;
let gameOver = false;

// Fetch random Pokémon
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
  resolutionEl.textContent = `Resolution: ${pixels}px`;
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

  // Lose condition: fully revealed
  if (pixels >= maxPixels && !gameOver) {
    gameOver = true;
    setTimeout(() => {
      alert(`Out of reveals! The Pokémon was ${answer.toUpperCase()}.`);
      round++;
      loadPokemon();
    }, 200);
  }
}

// Reveal more pixels
document.getElementById("next").onclick = () => {
  if (gameOver) return;
  if (pixels < maxPixels) {
    pixels *= 2;
    draw();
  }
};

// Guess handling
document.getElementById("submit").onclick = () => {
  if (gameOver) return;

  const guess = document
    .getElementById("guess")
    .value
    .trim()
    .toLowerCase();

  if (!guess) return;

  if (guess === answer) {
    alert(`Correct! It was ${answer.toUpperCase()} 🎉`);
    round++;
    document.getElementById("guess").value = "";
    loadPokemon();
  } else {
    alert("Nope, try again!");
  }
};

// Start game
loadPokemon();
