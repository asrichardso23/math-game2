const problemEl = document.getElementById("problem");
const answerEl  = document.getElementById("answer");
const feedback  = document.getElementById("feedback");
const submitBtn = document.getElementById("submit");
const ding      = document.getElementById("correctSound");
const buzz      = document.getElementById("wrongSound");
const confetti  = new JSConfetti();

let a, b, op, correct;
let questionCount = 0, score = 0;

function randomInt(max){ return Math.floor(Math.random()*max); }

function newProblem(){
  // flip a coin: 0 = addition, 1 = subtraction
  if(Math.random()<0.5){
    op = "+";
    // sum ≤ 20
    a = randomInt(21);            // 0‑20
    b = randomInt(21 - a);        // keeps a+b ≤ 20
    correct = a + b;
  }else{
    op = "−";
    // result ≥ 0
    a = randomInt(21);            // 0‑20
    b = randomInt(a + 1);         // 0‑a
    correct = a - b;
  }
  problemEl.textContent = `${a} ${op} ${b} = ?`;
  answerEl.value = "";
  answerEl.focus();
}

function check(){
  const guess = Number(answerEl.value);
  submitBtn.disabled = true;      // avoid double‑click
  if(guess === correct){
    feedback.textContent = "✔️ Great job!";
    ding.play();
    score++;
  }else{
    feedback.textContent = `❌ Oops, it was ${correct}`;
    buzz.play();
  }
  questionCount++;
  setTimeout(()=>{
    feedback.textContent = "";
    submitBtn.disabled=false;
    if(questionCount === 10) endRound();
    else newProblem();
  }, 1200);
}

function endRound(){
  problemEl.textContent = `You scored ${score}/10! 🎉`;
  answerEl.style.display = submitBtn.style.display = "none";
  confetti.addConfetti({
    emojis:["🎈","✨","🦄","🎉","🥳","⭐️","🍭"]
  });
}

submitBtn.addEventListener("click", check);
answerEl.addEventListener("keydown", e => e.key === "Enter" && check());

newProblem();
