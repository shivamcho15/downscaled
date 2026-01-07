const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const offscreen = document.createElement("canvas");
const offCtx = offscreen.getContext("2d");
offCtx.imageSmoothingEnabled = false;

let img = new Image();
let answer = "";
let pixels = 4;
let maxPixels = 0;

async function loadPokemon() {
  pixels = 4;

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

function draw() {
  pixels = Math.min(pixels, maxPixels);

  offscreen.width = pixels;
  offscreen.height = pixels;

  offCtx.clearRect(0, 0, pixels, pixels);
  offCtx.drawImage(img, 0, 0, pixels, pixels);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
}

document.getElementById("next").onclick = () => {
  if (pixels < maxPixels) {
    pixels *= 2;
    draw();
  }
};

//handling guesses
document.getElementById("submit").onclick = () => {
  const guess = document
    .getElementById("guess")
    .value
    .trim()
    .toLowerCase();

  if (!guess) return;

  if (guess === answer) {
    alert(`Correct! It was ${answer.toUpperCase()}`);
    loadPokemon();
    document.getElementById("guess").value = "";
  } else {
    alert("Wrong, Try Again");
  }
};

loadPokemon();
