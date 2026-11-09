// Leaderboard + groups on Firebase Realtime Database (same project as Trivia Deck).
// If Firebase can't load (offline, blocked), every call fails quietly and the game still works.
import { firebaseConfig } from './config.js';
const V='10.12.2';
let db=null,uid=null,F=null,ready=null;

export function initNet(){
  if(ready)return ready;
  ready=(async()=>{
    try{
      const [appM,authM,dbM]=await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`)]);
      F=dbM;
      const app=appM.initializeApp(firebaseConfig,'defuse');
      const auth=authM.getAuth(app);
      db=dbM.getDatabase(app);
      const cred=await authM.signInAnonymously(auth);
      uid=cred.user.uid;
      return uid;
    }catch(e){console.warn('Leaderboard offline',e);db=null;return null}
  })();
  return ready;
}
export const myUid=()=>uid;
const R=p=>F.ref(db,p);

export async function postScore(date,{name,t,won}){
  if(!await initNet())throw new Error('offline');
  const k=won?Math.round(t):1e9+Math.round(t);
  await F.set(R(`defuse/days/${date}/scores/${uid}`),{name,t:Math.round(t),won:!!won,k,at:Date.now()});
}
export async function getScore(date,who){
  if(!await initNet())return null;
  const s=await F.get(R(`defuse/days/${date}/scores/${who}`));
  return s.exists()?s.val():null;
}
export async function getBoard(date,limit=100){
  if(!await initNet())return null;
  const q=F.query(R(`defuse/days/${date}/scores`),F.orderByChild('k'),F.limitToFirst(limit));
  const s=await F.get(q);const out=[];
  s.forEach(c=>{out.push({uid:c.key,...c.val()})});
  out.sort((a,b)=>a.k-b.k);
  return out;
}
const GID_CH='abcdefghjkmnpqrstuvwxyz23456789';
export async function createGroup(gname,myName){
  if(!await initNet())throw new Error('offline');
  let gid='';for(let i=0;i<7;i++)gid+=GID_CH[Math.floor(Math.random()*GID_CH.length)];
  await F.set(R(`defuse/groups/${gid}/info`),{name:gname.slice(0,30),by:uid,at:Date.now()});
  await F.set(R(`defuse/groups/${gid}/members/${uid}`),myName);
  return gid;
}
export async function groupInfo(gid){
  if(!await initNet())return null;
  const s=await F.get(R(`defuse/groups/${gid}/info`));
  return s.exists()?s.val():null;
}
export async function joinGroup(gid,myName){
  if(!await initNet())throw new Error('offline');
  await F.set(R(`defuse/groups/${gid}/members/${uid}`),myName);
}
export async function leaveGroup(gid){
  if(!await initNet())return;
  await F.remove(R(`defuse/groups/${gid}/members/${uid}`));
}
export async function renameEverywhere(gids,myName){
  if(!await initNet())return;
  await Promise.all(gids.map(g=>F.set(R(`defuse/groups/${g}/members/${uid}`),myName).catch(()=>{})));
}
export async function groupBoard(gid,date){
  if(!await initNet())return null;
  const m=await F.get(R(`defuse/groups/${gid}/members`));
  if(!m.exists())return[];
  const members=Object.entries(m.val());
  const scores=await Promise.all(members.map(([u])=>getScore(date,u).catch(()=>null)));
  return members.map(([u,name],i)=>scores[i]?{uid:u,...scores[i],name:scores[i].name||name}:{uid:u,name,k:2e9,pending:true})
    .sort((a,b)=>a.k-b.k);
}
