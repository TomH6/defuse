import { makePuzzle } from './puzzle.js';
import { t, setLang, LANG, colorName, stmtText } from './i18n.js';
import { sfx, fx, unlock } from './sound.js';
import * as net from './net.js';

const SITE='https://tomh6.github.io/defuse/';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const dateStr=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const EPOCH=new Date(2026,10,9);
const dayNum=d=>Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-EPOCH)/864e5)+1;
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

/* ---------- settings ---------- */
setLang(store.get('defuse-lang')||'en');
Object.assign(fx,store.get('defuse-fx')||{});
const myName=()=>store.get('defuse-name')||'';
const myGroups=()=>store.get('defuse-groups')||[];

/* ---------- state ---------- */
let G=null,timerId=null,view='game',boardTab='today',lastSec=null,installEvt=null,newGroupOpen=false;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e});

const params=new URLSearchParams(location.search);
const VS=params.get('vs')?{uid:params.get('vs'),date:params.get('d')||'',name:null,score:undefined}:null;
const JOIN=params.get('g');
if(params.toString())history.replaceState(null,'',location.pathname);

function wireName(i){const n=colorName(G.wires[i].n);return LANG==='he'?'ה'+n:n}
function chip(i){const w=G.wires[i];return`<span class="chip" style="background:${w.h};color:${w.dark?'#222':'#fff'}">${wireName(i)}</span>`}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}

function newGame(mode){
  clearInterval(timerId);
  const d=new Date(),date=dateStr(d);
  const seed=mode==='daily'?'defuse-'+date:'practice-'+Math.random();
  G={mode,date,num:dayNum(d),dow:d.getDay(),...makePuzzle(seed,4),phase:'ready',sel:null,cutIdx:null,used:0,limit:120};
  if(mode==='daily'){
    const sv=store.get('defuse-'+date);
    if(sv){G.phase=sv.result;G.used=sv.time;G.cutIdx=sv.cut;G.reason=sv.reason;G.posted=!!sv.posted}
    else{const st=store.get('defuse-started');if(st&&st.date===date){G.t0=st.t0;G.phase='playing';runClock()}}
  }
  view='game';render();
  if(G.phase==='won'||G.phase==='lost')afterGame();
}
function start(){
  unlock();sfx.start();
  G.phase='playing';G.t0=Date.now();
  if(G.mode==='daily')store.set('defuse-started',{date:G.date,t0:G.t0});
  runClock();render();
}
function runClock(){lastSec=null;clearInterval(timerId);timerId=setInterval(tick,100);setTimeout(tick,0)}
const left=()=>Math.max(0,G.limit-(Date.now()-G.t0)/1000);
function tick(){
  if(G.phase!=='playing')return;
  const l=left(),sec=Math.ceil(l),el=$('#timer');
  if(el){el.textContent=fmt(sec);el.classList.toggle('low',l<=20)}
  if(sec!==lastSec){if(lastSec!==null&&sec>0)sfx.tick(sec<=10);lastSec=sec}
  if(l<=0)finish(false,'time');
}
function select(i){if(G.phase!=='playing')return;G.sel=i;sfx.select();render()}
function cut(){
  if(G.phase!=='playing'||G.sel===null)return;
  const i=G.sel;G.phase='cutting';G.cutIdx=i;clearInterval(timerId);
  G.used=(Date.now()-G.t0)/1000;sfx.snip();
  const w=document.querySelector(`.wire[data-i="${i}"]`);
  if(w){w.classList.remove('sel');w.classList.add('cut');const m=w.querySelector('.mark');if(m)m.remove()}
  const b=$('#cutBtn');if(b){b.disabled=true;b.textContent='✂ ✂ ✂'}
  setTimeout(()=>finish(i===G.answer,'wire'),900);
}
function finish(won,reason){
  clearInterval(timerId);
  if(G.phase==='won'||G.phase==='lost')return;
  if(reason==='time')G.used=G.limit;
  G.phase=won?'won':'lost';G.reason=reason;G.sel=null;
  if(G.mode==='daily'){
    store.set('defuse-'+G.date,{result:G.phase,time:G.used,cut:G.cutIdx,reason});
    store.del('defuse-started');
    const st=store.get('defuse-stats')||{played:0,wins:0,streak:0,best:0,last:null};
    const y=new Date();y.setDate(y.getDate()-1);
    st.played++;
    if(won){st.wins++;st.streak=st.last===dateStr(y)?st.streak+1:1;st.best=Math.max(st.best,st.streak);st.last=G.date}
    else{st.streak=0;st.last=G.date}
    store.set('defuse-stats',st);
  }
  won?sfx.win():sfx.boom();
  render();
  if(!won){const f=$('#flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');const b=$('.bomb');if(b)b.classList.add('shake')}
  afterGame();
}

/* ---------- online bits after a daily game ---------- */
async function afterGame(){
  if(G.mode!=='daily')return;
  await tryPost();
  fillMini();
}
async function tryPost(){
  const rec=store.get('defuse-'+G.date);if(!rec||rec.posted||!myName())return;
  try{
    await net.postScore(G.date,{name:myName(),t:rec.time*1000,won:rec.result==='won'});
    rec.posted=true;store.set('defuse-'+G.date,rec);G.posted=true;
  }catch(e){
    // write-once rule: if a score already exists for this player today, treat it as posted
    const mine=await net.getScore(G.date,net.myUid()).catch(()=>null);
    if(mine){rec.posted=true;store.set('defuse-'+G.date,rec);G.posted=true}
  }
}
async function fillMini(){
  const box=$('#mini');if(!box)return;
  const list=await net.getBoard(G.date).catch(()=>null);
  if(!$('#mini'))return;
  if(!list){box.innerHTML=`<div class="muted">${t('boardOff')}</div>`;return}
  const me=net.myUid();const idx=list.findIndex(r=>r.uid===me);
  let rows=list.slice(0,5);if(idx>=5)rows.push(list[idx]);
  box.innerHTML=`<div class="minihead"><span>${t('board')} · ${t('todayBoard')}</span>${idx>=0&&list[idx].won?`<b>${t('rankX',idx+1)}</b>`:''}</div>`+
    (rows.length?boardRows(rows,list):`<div class="muted">${t('boardEmpty')}</div>`)+
    `<button class="link" id="fullBoard">${t('board')} ›</button>`;
  $('#fullBoard').onclick=()=>openBoard('today');
}
function boardRows(rows,full){
  const me=net.myUid();
  return`<div class="rows">${rows.map(r=>{
    const rank=full?full.indexOf(r)+1:0;
    const right=r.pending?'<span class="muted">—</span>':r.won?fmt(r.t/1000):t('boomed');
    return`<div class="row ${r.uid===me?'me':''}"><span class="rk">${r.pending||!r.won?'·':rank}</span><span class="nm">${esc(r.name)}${r.uid===me?` <small>(${t('you')})</small>`:''}</span><span class="tm">${right}</span></div>`}).join('')}</div>`;
}

/* ---------- challenge ---------- */
async function loadVs(){
  if(!VS)return;
  await net.initNet();
  if(VS.uid===net.myUid()){VS.self=true;return}
  VS.score=await net.getScore(VS.date,VS.uid).catch(()=>null);
  if(view==='game')render();
}
function vsBanner(){
  if(!VS||VS.self||VS.score===undefined)return'';
  if(!VS.score)return'';
  const nm=esc(VS.score.name);
  if(VS.date!==G.date)return`<div class="banner">${t('vsOld',nm)}</div>`;
  return`<div class="banner">${VS.score.won?t('vsBanner',nm,fmt(VS.score.t/1000)):t('vsBannerLost',nm)}</div>`;
}
function vsResult(){
  if(!VS||VS.self||!VS.score||VS.date!==G.date||G.mode!=='daily')return'';
  const nm=esc(VS.score.name),me=G.phase==='won',them=VS.score.won;
  let s;
  if(me&&them)s=G.used*1000<=VS.score.t?t('vsWin',nm,fmt(G.used),fmt(VS.score.t/1000)):t('vsLose',nm,fmt(G.used),fmt(VS.score.t/1000));
  else if(me)s=t('vsOnlyThem',nm);else if(them)s=t('vsOnlyYou',nm);else s=t('vsBothBoom');
  return`<div class="banner vs">⚔️ ${s}</div>`;
}

/* ---------- sharing ---------- */
function shareText(){
  const uid=net.myUid();
  const link=uid?`${SITE}?vs=${uid}&d=${G.date}`:SITE;
  const head=G.phase==='won'?t('shareWon',G.num,fmt(G.used)):t('shareLost',G.num,G.reason==='time'?t('shareTime'):'');
  return`${head}\n\n${G.phase==='won'?t('dareWon'):t('dareLost')}\n▶ ${link}`;
}
function copyText(txt){
  try{navigator.clipboard.writeText(txt).then(()=>toast(t('copied')),()=>toast(t('copyFail')))}catch(e){toast(t('copyFail'))}
}
const waLink=txt=>'https://wa.me/?text='+encodeURIComponent(txt);

/* ---------- name prompt ---------- */
function askName(msg){
  return new Promise(res=>{
    const m=$('#modal');
    m.innerHTML=`<div class="sheet"><div class="h">${esc(msg||t('yourName'))}</div>
      <input id="nameIn" maxlength="16" placeholder="${t('namePh')}" value="${esc(myName())}" autocomplete="nickname">
      <div class="two"><button class="btn sec" id="nmCancel">${t('close')}</button><button class="btn go" id="nmOk">${t('save')}</button></div></div>`;
    m.classList.add('open');
    const inp=$('#nameIn');setTimeout(()=>inp.focus(),50);
    const done=v=>{m.classList.remove('open');m.innerHTML='';res(v)};
    $('#nmCancel').onclick=()=>done(null);
    const ok=()=>{const v=inp.value.trim().slice(0,16);if(!v){inp.focus();return}
      store.set('defuse-name',v);net.renameEverywhere(myGroups().map(g=>g.gid),v);done(v)};
    $('#nmOk').onclick=ok;inp.onkeydown=e=>{if(e.key==='Enter')ok()};
  });
}

/* ---------- groups ---------- */
async function handleJoin(gid){
  const info=await net.groupInfo(gid).catch(()=>null);
  if(!info){toast(t('groupGone'));return}
  if(!myName()){const n=await askName(`${t('yourName')} — "${info.name}"`);if(!n)return}
  try{await net.joinGroup(gid,myName())}catch(e){toast(t('boardOff'));return}
  const gs=myGroups().filter(g=>g.gid!==gid);gs.push({gid,name:info.name});store.set('defuse-groups',gs);
  toast(t('joined',info.name));
  openBoard(gid);
}
async function makeGroup(){
  const inp=$('#gName');const gname=inp&&inp.value.trim();
  if(!gname){inp&&inp.focus();return}
  if(!myName()){const n=await askName();if(!n)return}
  try{
    const gid=await net.createGroup(gname,myName());
    const gs=myGroups();gs.push({gid,name:gname.slice(0,30)});store.set('defuse-groups',gs);
    newGroupOpen=false;openBoard(gid);
  }catch(e){toast(t('boardOff'))}
}

/* ---------- views ---------- */
function openBoard(tab){view='board';boardTab=tab||'today';render();loadBoard()}
async function loadBoard(){
  const box=$('#boardList');if(!box)return;
  box.innerHTML=`<div class="muted">${t('boardLoading')}</div>`;
  const date=dateStr(new Date());
  const tab=boardTab;
  const list=tab==='today'?await net.getBoard(date).catch(()=>null):await net.groupBoard(tab,date).catch(()=>null);
  if(view!=='board'||boardTab!==tab||!$('#boardList'))return;
  if(!list){box.innerHTML=`<div class="muted">${t('boardOff')}</div>`;return}
  const cnt=$('#memberCount');if(cnt)cnt.textContent=t('members',list.length);
  box.innerHTML=list.length?boardRows(list,list.filter(r=>!r.pending)):`<div class="muted">${t('boardEmpty')}</div>`;
}

function header(){
  const back=view!=='game';
  return`<header>
    ${back?`<button class="ico" id="goBack">${t('back')}</button>`:`<h1>DEF<span>U</span>SE</h1>`}
    <div class="hbtns">
      ${view!=='board'?`<button class="ico" id="goBoard" aria-label="${t('board')}">🏆</button>`:''}
      ${view!=='settings'?`<button class="ico" id="goSettings" aria-label="${t('settings')}">⚙</button>`:''}
    </div></header>`;
}
function bindHeader(){
  const b=$('#goBack');if(b)b.onclick=()=>{view='game';render();if(G.phase==='won'||G.phase==='lost')fillMini()};
  const o=$('#goBoard');if(o)o.onclick=()=>openBoard(boardTab);
  const s=$('#goSettings');if(s)s.onclick=()=>{view='settings';render()};
}

function render(){
  document.title=LANG==='he'?'DEFUSE — פצצה יומית':'DEFUSE — daily bomb puzzle';
  const app=$('#app');
  if(view==='board')app.innerHTML=header()+renderBoard();
  else if(view==='settings')app.innerHTML=header()+renderSettings();
  else app.innerHTML=header()+renderGame();
  bindHeader();
  if(view==='board')bindBoard();else if(view==='settings')bindSettings();else bindGame();
}

function renderBoard(){
  const gs=myGroups();
  const tabs=[{id:'today',name:'🌍 '+t('todayBoard')},...gs.map(g=>({id:g.gid,name:'👥 '+esc(g.name)}))];
  const g=gs.find(x=>x.gid===boardTab);
  const inviteTxt=g?t('inviteText',g.name,`${SITE}?g=${g.gid}`):'';
  return`<div class="panel">
    <div class="ptitle">🏆 ${t('board')} <small>· ${t('bomb')} #${String(dayNum(new Date())).padStart(3,'0')}</small></div>
    <div class="tabs">${tabs.map(x=>`<button class="tab ${x.id===boardTab?'on':''}" data-tab="${x.id}">${x.name}</button>`).join('')}
      <button class="tab add" id="addGroup">${t('newGroup')}</button></div>
    ${newGroupOpen?`<div class="newg"><input id="gName" maxlength="30" placeholder="${t('groupNamePh')}"><button class="btn go small" id="mkGroup">${t('create')}</button></div>`:''}
    ${g?`<div class="ginfo"><span id="memberCount"></span><button class="link danger" id="leaveG">${t('leave')}</button></div>`:''}
    <div id="boardList"></div>
    ${g?`<a class="btn wa" href="${waLink(inviteTxt)}" target="_blank" rel="noopener">${waIcon()} ${t('inviteWA')}</a>
         <button class="btn sec" id="copyInvite">⧉ ${t('copy').replace('⧉ ','')}</button>`:''}
  </div>`;
}
function bindBoard(){
  document.querySelectorAll('.tab[data-tab]').forEach(b=>b.onclick=()=>{boardTab=b.dataset.tab;newGroupOpen=false;render();loadBoard()});
  $('#addGroup').onclick=()=>{newGroupOpen=!newGroupOpen;render();loadBoard();const i=$('#gName');if(i)i.focus()};
  const mk=$('#mkGroup');if(mk)mk.onclick=makeGroup;
  const gi=$('#gName');if(gi)gi.onkeydown=e=>{if(e.key==='Enter')makeGroup()};
  const lv=$('#leaveG');if(lv)lv.onclick=async()=>{await net.leaveGroup(boardTab);store.set('defuse-groups',myGroups().filter(g=>g.gid!==boardTab));boardTab='today';render();loadBoard()};
  const ci=$('#copyInvite');if(ci)ci.onclick=()=>{const g=myGroups().find(x=>x.gid===boardTab);copyText(t('inviteText',g.name,`${SITE}?g=${g.gid}`))};
}

function renderSettings(){
  const tog=(id,on)=>`<button class="tog ${on?'on':''}" id="${id}">${on?t('on'):t('off')}</button>`;
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  return`<div class="panel">
    <div class="ptitle">⚙ ${t('settings')}</div>
    <div class="set"><span>${t('lang')}</span><div class="seg"><button class="${LANG==='en'?'on':''}" data-lang="en">English</button><button class="${LANG==='he'?'on':''}" data-lang="he">עברית</button></div></div>
    <div class="set"><span>🔊 ${t('sound')}</span>${tog('tSound',fx.sound)}</div>
    <div class="set"><span>📳 ${t('vibrate')}</span>${tog('tVib',fx.vibrate)}</div>
    <div class="set"><span>${t('name')}</span><button class="tog" id="editName">${esc(myName())||'—'} ✎</button></div>
    ${standalone?'':`<div class="set col"><span>📲 ${t('install')}</span>${installEvt?`<button class="btn go" id="doInstall">${t('installBtn')}</button>`:`<div class="muted">${t('installHow')}</div>`}</div>`}
  </div>`;
}
function bindSettings(){
  document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{setLang(b.dataset.lang);store.set('defuse-lang',LANG);render()});
  const save=()=>store.set('defuse-fx',{sound:fx.sound,vibrate:fx.vibrate});
  $('#tSound').onclick=()=>{fx.sound=!fx.sound;save();if(fx.sound){unlock();sfx.select()}render()};
  $('#tVib').onclick=()=>{fx.vibrate=!fx.vibrate;save();if(fx.vibrate&&navigator.vibrate)navigator.vibrate(30);render()};
  $('#editName').onclick=async()=>{await askName();render()};
  const ib=$('#doInstall');if(ib)ib.onclick=async()=>{installEvt.prompt();await installEvt.userChoice.catch(()=>{});installEvt=null;render()};
}

const waIcon=()=>`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>`;

function renderGame(){
  const sub=G.mode==='daily'?`${t('bomb')} #${String(G.num).padStart(3,'0')} · ${t('days')[G.dow]}`:t('practice');
  if(G.phase==='ready'){
    return`<div class="sub">${sub}</div>${G.mode==='daily'?vsBanner():''}<div class="bomb">
      <div class="topbar"><div class="status"><div class="led"></div>${t('armed')}</div><div class="timer">${fmt(G.limit)}</div></div>
      <div class="intro"><p>&gt; ${t('intro1')}</p><p>&gt; ${t('intro2')}</p><p>&gt; ${t('intro3')}</p></div>
      <button class="btn go" id="startBtn">${t('start')}</button></div>`;
  }
  const over=G.phase==='won'||G.phase==='lost';
  const timeTxt=over?fmt(G.phase==='won'?G.limit-G.used:0):fmt(Math.ceil(G.phase==='playing'?left():G.limit-G.used));
  const wires=G.wires.map((w,i)=>`<div class="wire ${G.sel===i?'sel':''} ${G.cutIdx===i?'cut':''}" data-i="${i}">
      <div class="seg a" style="background:${w.h}"></div><div class="gap"></div><div class="seg b" style="background:${w.h}"></div>
      ${!over&&G.sel===i?`<div class="mark">${t('cutMark')}</div>`:''}${over&&i===G.answer?`<div class="ok">${t('safeMark')}</div>`:''}</div>`).join('');
  const tags=G.tags.map((tg,i)=>{const tr=(G.mask>>i)&1;return`<div class="tag ${!over&&G.sel===i?'sel':''}" data-i="${i}" style="border-inline-start-color:${G.wires[i].h}">
      <div><div class="who">${t('tagLbl',i+1,colorName(G.wires[i].n))}</div><div class="stmt">${LANG==='he'?stmtText(tg,chip):`“${stmtText(tg,chip)}”`}</div></div>
      ${over?`<span class="verdict ${tr?'v-true':'v-lie'}">${tr?t('vTrue'):t('vLie')}</span>`:''}</div>`}).join('');
  const usesTemp=G.tags.some(x=>x.type==='warm'||x.type==='cool');
  let bottom='';
  if(!over){
    const nm=G.sel===null?'':(LANG==='he'?wireName(G.sel):wireName(G.sel).toUpperCase());
    bottom=`<div class="cutbar"><button class="btn" id="cutBtn" ${G.sel===null?'disabled':''}>${G.sel===null?t('tapWire'):`<span>${t('cutX',nm)}</span>`}</button></div>`;
  }else{
    let odd=0;for(let i=0;i<4;i++)if(((G.mask>>i)&1)===(G.rule==='oneTrue'?1:0))odd=i;
    const st=store.get('defuse-stats');
    const daily=G.mode==='daily';
    const needPost=daily&&!G.posted&&!myName();
    bottom=`<div class="result ${G.phase==='won'?'win':'lose'}">
        <div class="big">${G.phase==='won'?t('defused'):t('boom')}</div>
        <div class="small">${G.phase==='won'?t('wonSmall',fmt(G.used),fmt(G.limit-G.used)):(G.reason==='time'?t('outOfTime'):t('wrongWire',colorName(G.wires[G.cutIdx].n)))}</div>
      </div>
      ${vsResult()}
      <div class="explain">${G.rule==='oneTrue'?t('whyTrue',chip(odd),chip(G.answer)):t('whyLie',chip(odd),chip(G.answer))}</div>
      ${daily&&st?`<div class="stats"><div><b>${st.played}</b>${t('played')}</div><div><b>${st.wins}</b>${t('wins')}</div><div><b>${st.streak}</b>${t('streak')}</div><div><b>${st.best}</b>${t('best')}</div></div>`:''}
      ${daily?`<a class="btn wa" id="waBtn" href="${waLink(shareText())}" target="_blank" rel="noopener">${waIcon()} ${t('shareWA')}</a>
        <button class="btn sec" id="shareBtn">${t('copy')}</button>
        ${needPost?`<button class="btn go" id="postBtn">🏆 ${t('post')}</button>`:''}
        <div class="mini" id="mini"><div class="muted">${t('boardLoading')}</div></div>
        <div class="legend">${t('tomorrow')}</div>`:''}
      <button class="btn sec" id="practiceBtn">${daily?t('practiceBtn'):t('practiceMore')}</button>
      ${!daily?`<button class="btn sec" id="dailyBtn">${t('today')}</button>`:''}`;
  }
  const stCls=G.phase==='won'?'ok':G.phase==='lost'?'dead':'';
  const stTxt=G.phase==='won'?t('safe'):G.phase==='lost'?t('offline'):t('armed');
  return`<div class="sub">${sub}</div><div class="bomb">
      <div class="topbar"><div class="status ${stCls}"><div class="led"></div>${stTxt}</div><div class="timer ${G.phase==='won'?'ok':''}" id="timer">${timeTxt}</div></div>
      <div class="rule"><div class="h">${t('rule')}</div>${G.rule==='oneTrue'?t('oneTrue'):t('oneLie')}</div>
      <div class="board"><div class="wires" dir="ltr">${wires}</div></div>
      ${!over?`<div class="hint">${G.sel===null?t('hintSel'):t('hintCut')}</div>`:''}
      <div class="tags">${tags}</div>
      ${usesTemp?`<div class="legend">${t('legendTemp')}</div>`:''}
    </div>${bottom}`;
}
function bindGame(){
  const sb=$('#startBtn');if(sb)sb.onclick=start;
  document.querySelectorAll('.wire').forEach(el=>el.onclick=()=>{const i=+el.dataset.i;if(G.phase==='playing'&&G.sel===i)cut();else select(i)});
  document.querySelectorAll('.tag').forEach(el=>el.onclick=()=>select(+el.dataset.i));
  const c=$('#cutBtn');if(c)c.onclick=cut;
  const s=$('#shareBtn');if(s)s.onclick=()=>copyText(shareText());
  const p=$('#practiceBtn');if(p)p.onclick=()=>newGame('practice');
  const d=$('#dailyBtn');if(d)d.onclick=()=>newGame('daily');
  const pb=$('#postBtn');if(pb)pb.onclick=async()=>{const n=await askName();if(!n)return;await tryPost();render();fillMini();if(G.posted)toast(t('posted'))};
  const wa=$('#waBtn');if(wa)wa.onclick=()=>{wa.href=waLink(shareText())};
}

/* ---------- boot ---------- */
newGame('daily');
net.initNet().then(()=>{
  if(view==='game'&&(G.phase==='won'||G.phase==='lost')){render();afterGame()}
});
loadVs();
if(JOIN)handleJoin(JOIN);
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
// new day while the app stays open
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&G.mode==='daily'&&G.date!==dateStr(new Date())&&G.phase!=='playing')newGame('daily')});
