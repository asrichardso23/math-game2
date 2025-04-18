/***** DOM REFERENCES *****/
const gameArea      = document.getElementById("gameArea");
const answerEl      = document.getElementById("answer");
const submitBtn     = document.getElementById("submit");
const feedback      = document.getElementById("feedback");
const startBtn      = document.getElementById("startBtn");
const livesEl       = document.getElementById("lives");
const scoreBoard    = document.getElementById("scoreBoard");
const modeSel       = document.getElementById("mode");
const digitsSel     = document.getElementById("digits");
const themeSel      = document.getElementById("theme");
const digitPad      = document.getElementById("digitPad");
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
let lives, score, currentAnswer;

/***** HELPERS *****/
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick = arr=>arr[Math.floor(Math.random()*arr.length)];

/***** BUILD DIGIT PAD *****/
digitPad.innerHTML="";
["1","2","3","4","5","6","7","8","9","0","⌫"].forEach(t=>{
  const b=document.createElement("button");
  b.textContent=t;
  if(t==="⌫") b.classList.add("back");
  digitPad.appendChild(b);
});
digitPad.addEventListener("click",e=>{
  if(e.target.tagName!=="BUTTON") return;
  const v=e.target.textContent;
  if(v==="⌫"){ answerEl.value=answerEl.value.slice(0,-1); }
  else      { answerEl.value+=v; }
  answerEl.focus();           // maintain caret & keyboard support
});

/***** PROBLEM GENERATOR *****/
function makeProblem(){
  const digits=+digitsSel.value,max=digits===1?9:99;
  const mode=modeSel.value==="mixed"?pick(["add","sub","mul","div"]):modeSel.value;
  let a,b,txt,ans;
  switch(mode){
    case"add": a=rand(0,max); b=rand(0,max-a); ans=a+b; txt=`${a}+${b}`; break;
    case"sub": a=rand(0,max); b=rand(0,a);     ans=a-b; txt=`${a}‑${b}`; break;
    case"mul": a=rand(0,digits===1?9:12); b=rand(0,digits===1?9:12); ans=a*b; txt=`${a}×${b}`; break;
    case"div": b=rand(1,digits===1?9:12); ans=rand(0,digits===1?9:12); a=ans*b; txt=`${a}÷${b}`; break;
  }
  return{txt,ans};
}

/***** ZOMBIE SPAWN *****/
function spawnZombie(){
  const{txt,ans}=makeProblem(); currentAnswer=ans;
  const z=document.createElement("div"); z.className="zombie";
  z.style.left=gameArea.offsetWidth+"px";
  z.innerHTML=`<span class="problem">${txt}</span>🧟`;
  gameArea.appendChild(z);
  const speed=rand(80,140);        // px/sec
  function step(){
    if(z.classList.contains("dead")) return;
    const x=parseFloat(z.style.left); z.style.left=(x-speed/60)+"px";
    if(x<-60){ loseLife(z); return; }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/***** START / RESET *****/
function startGame(){
  lives=3; score=0; updateHUD();
  document.body.className=themeSel.value;
  feedback.textContent=""; gameArea.innerHTML="";
  spawnZombie(); answerEl.value=""; answerEl.focus();
}

/***** HUD *****/
function updateHUD(){
  livesEl.textContent="❤️".repeat(lives);
  scoreBoard.textContent=`Score ${score}`;
}

/***** CHECK ANSWER *****/
function checkAnswer(){
  if(!answerEl.value) return;
  const guess=Number(answerEl.value);
  if(guess===currentAnswer){
    const z=gameArea.querySelector(".zombie");
    if(z){ z.classList.add("dead"); setTimeout(()=>z.remove(),600); }
    ding.play(); confetti.addConfetti({emojis:["💥","✨"]});
    score++; feedback.textContent="💥"; spawnZombie();
  }else{ buzz.play(); feedback.textContent="❌"; }
  answerEl.value=""; updateHUD();
}

/***** LIFE LOSS & GAME OVER *****/
function loseLife(z){
  lives--; updateHUD(); oof.play(); z.remove(); feedback.textContent="🩸";
  if(lives<=0){ feedback.textContent=`Game Over! Final score ${score}`; }
  else{ spawnZombie(); }
}

/***** AVATAR BUILDER *****/
function initAvatar(){ avatarDisplay.textContent=localStorage.getItem("avatar")||"🧑‍🚀"; }
function openAvatar(){ avatarModal.style.display="flex"; }
function closeAvatar(){ avatarModal.style.display="none"; }
avatarChoices.addEventListener("click",e=>{
  if(!e.target.classList.contains("avatar-option")) return;
  const em=e.target.textContent; avatarDisplay.textContent=em; localStorage.setItem("avatar",em); closeAvatar();
});

/***** EVENTS *****/
submitBtn.addEventListener("click",checkAnswer);
answerEl.addEventListener("keydown",e=>e.key==="Enter"&&checkAnswer());
startBtn.addEventListener("click",startGame);
editAvatarBtn.addEventListener("click",openAvatar);
closeAvatarBtn.addEventListener("click",closeAvatar);
avatarModal.addEventListener("click",e=>{ if(e.target===avatarModal) closeAvatar(); });

/***** INIT *****/
initAvatar();
