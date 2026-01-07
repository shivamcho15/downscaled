// Shared JS for both game and review pages

// Detect which page we're on
const isGamePage = document.getElementById("game") !== null;
const isReviewPage = document.getElementById("review-summary") !== null;

let rounds = [];
let maxRounds = 10;

if (isGamePage) {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const offscreen = document.createElement("canvas");
  const offCtx = offscreen.getContext("2d");
  offCtx.imageSmoothingEnabled = false;

  const roundEl = document.getElementById("round");
  const resolutionEl = document.getElementById("resolution");
  const guessesEl = document.getElementById("guesses");
  const nextBtn = document.getElementById("next");
  const submitBtn = document.getElementById("submit");
  const guessInput = document.getElementById("guess");
  const messageContainer = document.getElementById("message-container");

  let img = new Image();
  let answer = "";
  let pixels = 4;
  let maxPixels = 0;
  let round = 1;
  let guessesThisRound = 0;
  let gameOver = false;

  async function loadPokemon() {
    pixels = 4;
    guessesThisRound = 0;
    gameOver = false;
    guessInput.value = "";
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
    roundEl.textContent = `Round: ${round} / ${maxRounds}`;
    resolutionEl.textContent = `Resolution: ${pixels}px`;
    guessesEl.textContent = `Guesses: ${guessesThisRound}`;
  }

  function draw() {
    pixels = Math.min(pixels, maxPixels);
    updateHUD();

    offscreen.width = pixels;
    offscreen.height = pixels;
    offCtx.clearRect(0,0,pixels,pixels);
    offCtx.drawImage(img, 0,0,pixels,pixels);

    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(offscreen,0,0,canvas.width, canvas.height);

    if (pixels >= maxPixels && !gameOver) {
      gameOver = true;
      rounds.push({ correct: false, guesses: guessesThisRound });
      showMessage(`Out of reveals! It was ${answer.toUpperCase()}.`, "error");
      nextRound();
    }
  }

  nextBtn.onclick = () => {
    if (gameOver) return;
    if (pixels < maxPixels) {
      pixels *= 2;
      draw();
    }
  };

  submitBtn.onclick = () => {
    if (gameOver) return;
    const guess = guessInput.value.trim().toLowerCase();
    if (!guess) return;

    guessesThisRound++;
    if (guess === answer) {
      showMessage(`Correct! It was ${answer.toUpperCase()} 🎉`, "success");
      rounds.push({ correct: true, guesses: guessesThisRound });
      gameOver = true;
      nextRound();
    } else {
      showMessage("Nope, try again!", "error");
    }
    draw();
  };

  function nextRound() {
    if (round < maxRounds) {
      round++;
      loadPokemon();
    } else {
      // Save scores in localStorage and go to review page
      localStorage.setItem("rounds", JSON.stringify(rounds));
      window.location.href = "review.html";
    }
  }

  function showMessage(text, type="success") {
    const message = document.createElement("div");
    message.classList.add("message", type);
    message.textContent = text;
    messageContainer.appendChild(message);
    setTimeout(()=>{ if (messageContainer.contains(message)) messageContainer.removeChild(message); },3000);
    message.addEventListener("click",()=>{ if(messageContainer.contains(message)) messageContainer.removeChild(message); });
  }

  loadPokemon();

}

// Review page logic
if (isReviewPage) {
  const correctEl = document.getElementById("correct");
  const totalGuessesEl = document.getElementById("total-guesses");
  const avgGuessesEl = document.getElementById("avg-guesses");
  const playAgainBtn = document.getElementById("play-again");

  const rounds = JSON.parse(localStorage.getItem("rounds")) || [];
  const totalCorrect = rounds.filter(r => r.correct).length;
  const totalGuesses = rounds.reduce((sum,r)=>sum+r.guesses,0);
  const avgGuesses = rounds.length ? (totalGuesses/rounds.length).toFixed(2) : 0;

  correctEl.textContent = totalCorrect;
  totalGuessesEl.textContent = totalGuesses;
  avgGuessesEl.textContent = avgGuesses;

  playAgainBtn.onclick = () => {
    localStorage.removeItem("rounds");
    window.location.href = "game.html";
  };
}
