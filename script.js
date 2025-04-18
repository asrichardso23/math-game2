/******** DOM refs ********/
const problemEl  = document.getElementById("problem");
const answerEl   = document.getElementById("answer");
const feedback   = document.getElementById("feedback");
const submitBtn  = document.getElementById("submit");
const startBtn   = document.getElementById("startBtn");
const modeSel    = document.getElementById("mode");
const digitsSel  = document.getElementById("digits");
const themeSel   = document.getElementById("theme");
const progressEl = document.getElementById("progress");
const timerEl    = document.getElementById("timer");
const bestScoreEl= document.getElementById("bestScore");
const bestTimeEl = document.getElementById("bestTime");
const ding       = document.getElementById("correctSound");
const buzz       = document.getElementById("wrongSound");
const confetti   = new JSConfetti();

/* avatar builder */
const avatarDisplay   = document.getElementById("avatarDisplay");
const editAvatarBtn   = document.getElementById("editAvatarBtn");
const avatarModal     = document.getElementById("avatarModal");
const avatarChoices   = document.getElementById("avatarChoices");
const closeAvatarBtn  = document.getElementById("closeAvatarBtn");

/******** game state ********/
let a, b, op, correct;
let questionCount, score;
let timerInt, startTime;

/******** helpers ********/
const rand = (min,max) => Math.floor(Math.random()*(max-min+1))+min;  // inclusive
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const loadJSON = key => JSON.parse(localStorage.getItem(key)||"{}");
const saveJSON = (key,obj) => localStorage.setItem(key,JSON.stringify(obj));

/******** avatar handling ********/
function initAvatar(){
  const stored = localStorage.getItem("quickMathAvatar") || "🤖";
  avatarDisplay.textContent = stored;
}
function openAvatarModal(){ avatarModal.style.display="flex"; }
function closeAvatarModal(){ avatarModal.style.display="none"; }
function chooseAvatar(e){
  if(!e.target.classList.contains("avatar-option")) return;
  const emoji = e.target.textContent;
  avatarDisplay.textContent = emoji;
  localStorage.setItem("quickMathAvatar", emoji);
  closeAvatarModal();
}

/******** UI helpers ********/
function setTheme(theme){
  document.body.classList.remove("unicorn","space","dino");
  document.body.classList.add(theme);
}

/******** Problem generator ********/
function newProblem(){
  const digits = +digitsSel.value;             // 1 or 2
  const max = digits===1 ? 9 : 99;
  const mode = modeSel.value;
  let modes = ["add","sub","mul","div"];
  op = mode==="mixed" ? pick(modes) : mode;

  switch(op){
    case "add":
      a = rand(0,max);
      b = rand(0,max-a);               // keep sum ≤ max
      correct = a + b;
      problemEl.textContent = `${a} + ${b} = ?`;
      break;
    case "sub":
      a = rand(0,max);
      b = rand(0,a);                   // keep result ≥ 0
      correct = a - b;
      problemEl.textContent = `${a} − ${b} = ?`;
      break;
    case "mul":
      a = rand(0,digits===1?9:12);     // cap size so products aren’t enormous
      b = rand(0,digits===1?9:12);
      correct = a * b;
      problemEl.textContent = `${a} × ${b} = ?`;
      break;
    case "div":
      b = rand(1,digits===1?9:12);     // divisor
      correct = rand(0,digits===1?9:12);
      a = correct * b;                 // ensures whole‑number answer
      problemEl.textContent = `${a} ÷ ${b} = ?`;
      break;
  }
  answerEl.value = "";
  answerEl.focus();
}

/******** round control ********/
function startRound(){
  setTheme(themeSel.value);
  questionCount = 0;
  score = 0;
  feedback.textContent = "";
  progressEl.value = 0;
  progressEl.max = 10;
  startBtn.disabled = true;
  submitBtn.disabled = false;
  answerEl.style.display = submitBtn.style.display = "inline-block";
  timerEl.textContent = "0.0 s";
  startTime = Date.now();
  timerInt = setInterval(()=>{
    const t = (Date.now()-startTime)/1000;
    timerEl.textContent = t.toFixed(1)+" s";
  },100);
  newProblem();
}

function endRound(){
  clearInterval(timerInt);
  const elapsed = ((Date.now()-startTime)/1000).toFixed(1);
  problemEl.textContent = `${avatarDisplay.textContent} scored ${score}/10 in ${elapsed}s 🎉`;
  answerEl.style.display = submitBtn.style.display = "none";
  startBtn.disabled = false;
  confetti.addConfetti({emojis:["🎉","🦄","🚀","🦕","✨","⭐️"]});

  /* ----- high‑score ----- */
  const best = loadJSON("quickMathBest");
  let updated = false;
  if(!best.score || score>best.score){
    best.score = score; updated=true;
  }
  if(score===best.score){
    if(!best.time || elapsed<best.time){
      best.time = elapsed; updated=true;
    }
  }
  if(updated) saveJSON("quickMathBest",best);
  showBest();
}

/******** submit handling ********/
function check(){
  if(submitBtn.disabled) return;
  const guess = Number(answerEl.value);
  submitBtn.disabled=true;
  if(guess===correct){
    feedback.textContent="✔️ Great job!";
    ding.play();
    score++;
  }else{
    feedback.textContent=`❌ It was ${correct}`;
    buzz.play();
  }
  questionCount++;
  progressEl.value = questionCount;
  setTimeout(()=>{
    feedback.textContent="";
    submitBtn.disabled=false;
    if(questionCount===10) endRound();
    else newProblem();
  },1000);
}

/******** best score display ********/
function showBest(){
  const {score,time} = loadJSON("quickMathBest");
  bestScoreEl.textContent = score ?? "–";
  bestTimeEl.textContent  = time  ?? "–";
}

/******** event listeners ********/
submitBtn.addEventListener("click", check);
answerEl.addEventListener("keydown", e=>e.key==="Enter" && check());
startBtn.addEventListener("click", startRound);
themeSel.addEventListener("change", ()=>setTheme(themeSel.value));
editAvatarBtn.addEventListener("click", openAvatarModal);
closeAvatarBtn.addEventListener("click", closeAvatarModal);
avatarModal.addEventListener("click", e=>{ if(e.target===avatarModal) closeAvatarModal(); });
avatarChoices.addEventListener("click", chooseAvatar);

/******** init ********/
showBest();
setTheme(themeSel.value);
initAvatar();
submitBtn.disabled = true;          // hide until Start!
answerEl.style.display = submitBtn.style.display = "none";
