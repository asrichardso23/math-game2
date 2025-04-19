/***** DOM *****/
const gameArea  = document.getElementById("gameArea");
const answerEl  = document.getElementById("answer");
const submitBtn = document.getElementById("submit");
const livesEl   = document.getElementById("lives");
const scoreEl   = document.getElementById("scoreBoard");
const gun       = document.getElementById("gun");
const flash     = document.getElementById("flash");
const gunSound  = document.getElementById("gunSound");
const hurtSound = document.getElementById("hurtSound");

/***** STATE *****/
let lives, score, zombie, currentAns, stepInt;

/***** HELPERS *****/
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const modes=["add","sub","mul","div"];
function problem(){
  const op=modes[rand(0,3)];
  let a,b,txt,ans;
  switch(op){
    case"add": a=rand(0,20); b=rand(0,20-a); ans=a+b; txt=`${a}+${b}`; break;
    case"sub": a=rand(0,20); b=rand(0,a);   ans=a-b; txt=`${a}‑${b}`; break;
    case"mul": a=rand(0,9);  b=rand(0,9);   ans=a*b; txt=`${a}×${b}`; break;
    case"div": b=rand(1,9);  ans=rand(0,9); a=ans*b; txt=`${a}÷${b}`; break;
  }
  return{txt,ans};
}

/***** GAME FLOW *****/
function newZombie(){
  const {txt,ans}=problem(); currentAns=ans;
  zombie=document.createElement("div");
  zombie.className="zombie";
  zombie.innerHTML=`<span class="problem">${txt}</span>🧟`;
  gameArea.appendChild(zombie);
  let scale=.3;
  stepInt=setInterval(()=>{
    scale+=.012;
    zombie.style.transform=`translateX(-50%) scale(${scale})`;
    if(scale>1.4) hitPlayer();
  },30);
}

function fire(){
  const guess=Number(answerEl.value.trim());
  if(guess!==currentAns) return;
  clearInterval(stepInt);
  gun.classList.add("fire"); flash.classList.add("show");
  gunSound.currentTime=0; gunSound.play();
  zombie.classList.add("dead");
  setTimeout(()=>{gun.classList.remove("fire");flash.classList.remove("show");},120);
  setTimeout(()=>{zombie.remove(); nextKill();},600);
}

function nextKill(){
  score++; scoreEl.textContent=`Score ${score}`;
  answerEl.value=""; answerEl.focus(); newZombie();
}

function hitPlayer(){
  clearInterval(stepInt); zombie.remove(); lives--;
  hurtSound.currentTime=0; hurtSound.play();
  livesEl.textContent="❤️".repeat(lives);
  if(lives<=0) gameOver(); else newZombie();
}

function gameOver(){
  answerEl.disabled=true; submitBtn.disabled=true;
  scoreEl.textContent=`GAME OVER – Score ${score}`;
}

function start(){
  score=0; lives=3;
  answerEl.disabled=false; submitBtn.disabled=false;
  livesEl.textContent="❤️".repeat(lives);
  scoreEl.textContent="Score 0";
  answerEl.value=""; answerEl.focus();
  gameArea.innerHTML=""; newZombie();
}

/***** EVENTS *****/
submitBtn.addEventListener("click",fire);
answerEl.addEventListener("keydown",e=>{if(e.key==="Enter")fire();});
window.addEventListener("load",start);
