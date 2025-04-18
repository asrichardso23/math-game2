/***** DOM REFS *****/
const gameArea = document.getElementById("gameArea");
const answerEl = document.getElementById("answer");
const submitBtn = document.getElementById("submit");
const feedback  = document.getElementById("feedback");
const startBtn  = document.getElementById("startBtn");
const livesEl   = document.getElementById("lives");
const scoreBoard= document.getElementById("scoreBoard");
const modeSel   = document.getElementById("mode");
const digitsSel = document.getElementById("digits");
const themeSel  = document.getElementById("theme");
const avatarDisplay = document.getElementById("avatarDisplay");
const editAvatarBtn = document.getElementById("editAvatarBtn");
const avatarModal   = document.getElementById("avatarModal");
const avatarChoices = document.getElementById("avatarChoices");
const closeAvatarBtn= document.getElementById("closeAvatarBtn");
const ding   = document.getElementById("correctSound");
const buzz   = document.getElementById("wrongSound");
const oof    = document.getElementById("loseLifeSound");
const confetti = new JSConfetti();

/***** GAME STATE *****/
let lives, score, currentAnswer, zombieTimer, speed;

/***** UTILS *****/
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick = arr=>arr[Math.floor(Math.random()*arr.length)];

/***** MATH PROBLEM GENERATOR *****/
function makeProblem(){
  const digits = +digitsSel.value;
  const max = digits===1?9:99;
  const mode = modeSel.value==="mixed"?pick(["add","sub","mul","div"]):modeSel.value;
  let a,b,txt,ans;

  switch(mode){
    case "add":
      a=rand(0,max); b=rand(0,max-a); ans=a+b; txt=`${a}+${b}`;
      break;
    case "sub":
      a=rand(0,max); b=rand(0,a); ans=a-b; txt=`${a}‑${b}`;
      break;
    case "mul":
      a=rand(0,digits===1?9:12); b=rand(0,digits===1?9:12); ans=a*b; txt=`${a}×${b}`;
      break;
    case "div":
      b=rand(1,digits===1?9:12); ans=rand(0,digits===1?9:12); a=ans*b; txt=`${a}÷${b}`;
      break;
  }
  return {txt, ans};
}

/***** ZOMBIE CREATION *****/
function spawnZombie(){
  const {txt, ans} = makeProblem();
  currentAnswer = ans;

  const z = document.createElement("div");
  z.className="zombie";
  z.style.left = gameArea.offsetWidth + "px";
  z.innerHTML = `<span class="problem">${txt}</span>🧟`;
  gameArea.appendChild(z);

  // random speed -> duration (px / s)
  speed = rand(80,140);     // pixels/sec
  const interval = 16;      // ~60fps
  function step(){
    const x = parseFloat(z.style.left);
    z.style.left = (x - speed*interval/1000) + "px";
    if(z.classList.contains("dead")) return;           // already killed
    if(x < -60){                                      // reached player
      loseLife(z);
      return;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/***** START / RESTART *****/
function startGame(){
  // theme
  document.body.className = themeSel.value;
  answerEl.value=""; feedback.textContent="";
  lives=3; score=0;
  updateHUD();
  clearZombies();
  spawnZombie();
  answerEl.focus();
}

/***** HUD *****/
function updateHUD(){
  livesEl.textContent = "❤️".repeat(lives);
  scoreBoard.textContent = `Score ${score}`;
}

/***** CLEAR *****/
function clearZombies(){ gameArea.innerHTML=""; }

/***** KILL / MISS *****/
function checkAnswer(){
  const guess = Number(answerEl.value.trim());
  if(!answerEl.value) return;
  if(guess===currentAnswer){
    // kill first zombie
    const z = gameArea.querySelector(".zombie");
    if(z){ z.classList.add("dead"); setTimeout(()=>z.remove(),600); }
    ding.play(); score++; feedback.textContent="💥";
    confetti.addConfetti({emojis:["💥","✨"]});
    spawnZombie();
  }else{
    buzz.play(); feedback.textContent="❌";
  }
  answerEl.value="";
  updateHUD();
}

function loseLife(z){
  lives--; updateHUD(); oof.play();
  z.remove();
  feedback.textContent="🩸";
  if(lives<=0){
    gameOver();
  }else{
    spawnZombie();
  }
}

function gameOver(){
  clearZombies();
  feedback.textContent=`Game Over! Final score ${score}`;
}

/***** AVATAR BUILDER *****/
function initAvatar(){
  avatarDisplay.textContent = localStorage.getItem("avatar")||"🧑‍🚀";
}
function openAvatar(){ avatarModal.style.display="flex"; }
function closeAvatar(){ avatarModal.style.display="none"; }
avatarChoices.addEventListener("click", e=>{
  if(!e.target.classList.contains("avatar-option")) return;
  const emoji = e.target.textContent;
  avatarDisplay.textContent = emoji;
  localStorage.setItem("avatar",emoji);
  closeAvatar();
});

/***** EVENTS *****/
submitBtn.addEventListener("click", checkAnswer);
answerEl.addEventListener("keydown",e=>e.key==="Enter"&&checkAnswer());
startBtn.addEventListener("click", startGame);
editAvatarBtn.addEventListener("click", openAvatar);
closeAvatarBtn.addEventListener("click", closeAvatar);
avatarModal.addEventListener("click", e=>{ if(e.target===avatarModal) closeAvatar(); });

/***** INIT *****/
initAvatar();
answerEl.disabled=false;
