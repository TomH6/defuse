// Puzzle generation: every bomb is checked to have exactly one consistent answer.
export const COLORS=[
 {n:'red',h:'#e53935',warm:1},{n:'orange',h:'#fb8c00',warm:1,dark:1},{n:'yellow',h:'#fdd835',warm:1,dark:1},
 {n:'green',h:'#43a047',warm:0},{n:'blue',h:'#1e88e5',warm:0},{n:'purple',h:'#8e24aa',warm:0}];

export function hashStr(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0}
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(arr,rng){for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}

const TYPES=[['is',2],['not',2],['next',2],['left',1.5],['right',1.5],['end',1],['notEnd',1],['warm',1],['cool',1],['lies',3],['truth',2]];
const TOT=TYPES.reduce((a,b)=>a+b[1],0);
function randStmt(rng,n,i){
  let r=rng()*TOT,type='is';
  for(const [k,w] of TYPES){if((r-=w)<0){type=k;break}}
  let c=null;
  if(type==='is'||type==='not'||type==='next')c=Math.floor(rng()*n);
  if(type==='left')c=1+Math.floor(rng()*(n-1));
  if(type==='right')c=Math.floor(rng()*(n-1));
  if(type==='lies'||type==='truth'){c=Math.floor(rng()*(n-1));if(c>=i)c++}
  return{type,c};
}
function evalStmt(t,s,truth,wires,n){
  switch(t.type){
    case'is':return s===t.c; case'not':return s!==t.c;
    case'next':return Math.abs(s-t.c)===1;
    case'left':return s<t.c; case'right':return s>t.c;
    case'end':return s===0||s===n-1; case'notEnd':return s!==0&&s!==n-1;
    case'warm':return!!wires[s].warm; case'cool':return!wires[s].warm;
    case'lies':return!truth(t.c); case'truth':return truth(t.c);
    case'between':return s>t.c&&s<t.d;
    case'twoAway':return Math.abs(s-t.c)===2;
    case'sameTemp':return!!wires[s].warm===!!wires[t.c].warm;
    case'xor':return truth(t.c)!==truth(t.d);
  }
}
export function solve(p){
  const n=p.wires.length,worlds=[];
  for(let s=0;s<n;s++)for(let m=0;m<(1<<n);m++){
    const truth=i=>!!((m>>i)&1);let ok=true;
    for(let i=0;i<n;i++){if(evalStmt(p.tags[i],s,truth,p.wires,n)!==truth(i)){ok=false;break}}
    if(!ok)continue;
    let cnt=0;for(let i=0;i<n;i++)cnt+=(m>>i)&1;
    if((p.rule==='oneTrue'&&cnt===1)||(p.rule==='oneLie'&&cnt===n-1))worlds.push({s,m});
  }
  return worlds;
}
// From this date on, "only one tag is lying" bombs use only indirect clues (no "X is safe"),
// so they're about as tricky as "only one tag tells the truth" bombs.
export const HARD_LIE_FROM='2026-11-11';
const HARD=[['not',.5],['next',1.5],['left',1],['right',1],['end',.7],['notEnd',.7],['warm',.7],['cool',.7],
  ['lies',2],['truth',2],['between',2],['twoAway',2],['sameTemp',1.5],['xor',2.5]];
const HTOT=HARD.reduce((a,b)=>a+b[1],0);
function pick2(rng,n,i){const o=[];for(let k=0;k<n;k++)if(k!==i)o.push(k);
  const a=o.splice(Math.floor(rng()*o.length),1)[0],b=o[Math.floor(rng()*o.length)];return a<b?[a,b]:[b,a]}
function hardStmt(rng,n,i){
  let r=rng()*HTOT,type='lies';
  for(const [k,w] of HARD){if((r-=w)<0){type=k;break}}
  let c=null,d=null;
  if(type==='not'||type==='next'||type==='twoAway'||type==='sameTemp')c=Math.floor(rng()*n);
  if(type==='left')c=1+Math.floor(rng()*(n-1));
  if(type==='right')c=Math.floor(rng()*(n-1));
  if(type==='lies'||type==='truth'){c=Math.floor(rng()*(n-1));if(c>=i)c++}
  if(type==='between'){c=Math.floor(rng()*(n-2));d=c+2+Math.floor(rng()*(n-c-2))}
  if(type==='xor')[c,d]=pick2(rng,n,i);
  return{type,c,d};
}
function hardDay(seed){const m=/(\d{4}-\d{2}-\d{2})$/.exec(seed);return m?m[1]>=HARD_LIE_FROM:true}
const OBSCURE=new Set(['between','twoAway','sameTemp','xor']);
function makeHardLie(rng,n){
  for(let tries=0;tries<50000;tries++){
    const wires=shuffle(COLORS.slice(),rng).slice(0,n);
    const tags=[];for(let i=0;i<n;i++)tags.push(hardStmt(rng,n,i));
    if(new Set(tags.map(t=>t.type+t.c+'-'+t.d)).size<n)continue;
    if(!tags.some(t=>OBSCURE.has(t.type)))continue;
    if(!tags.some(t=>t.type==='lies'||t.type==='truth'||t.type==='xor'))continue;
    const p={wires,rule:'oneLie',tags};
    const w=solve(p);
    if(w.length===1)return{...p,answer:w[0].s,mask:w[0].m,n};
  }
}

export function makePuzzle(seed,n=4){
  const rng=mulberry32(hashStr(seed));
  // new days: pick the rule once (50/50), so both kinds come up equally often
  const hard=hardDay(seed),dayRule=hard?(rng()<.5?'oneTrue':'oneLie'):null;
  if(dayRule==='oneLie')return makeHardLie(rng,n);
  for(let tries=0;tries<50000;tries++){
    const wires=shuffle(COLORS.slice(),rng).slice(0,n);
    const r0=rng()<.5?'oneTrue':'oneLie',rule=dayRule||r0;
    const tags=[];for(let i=0;i<n;i++)tags.push(randStmt(rng,n,i));
    if(new Set(tags.map(t=>t.type+t.c)).size<n)continue;
    const hasRef=tags.some(t=>t.type==='lies'||t.type==='truth');
    if(!hasRef&&rng()<.7)continue;
    const w=solve({wires,rule,tags});
    if(w.length===1)return{wires,rule,tags,answer:w[0].s,mask:w[0].m,n};
  }
}
