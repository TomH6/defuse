// Synthesized sounds (no audio files) + vibration. Both can be switched off in settings.
let ctx=null;
export const fx={sound:true,vibrate:true};
function ac(){
  if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  return ctx;
}
export function unlock(){if(fx.sound)ac()}
function tone(freq,dur,{type='square',vol=.08,when=0,slide=null}={}){
  const c=ac();if(!c)return;
  const t0=c.currentTime+when,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+dur+.02);
}
function noise(dur,{vol=.5,freq=1200,q=.7,decay=true}={}){
  const c=ac();if(!c)return;
  const len=Math.floor(c.sampleRate*dur),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t0=c.currentTime;
  src.buffer=buf;f.type='lowpass';f.frequency.setValueAtTime(freq,t0);f.Q.value=q;
  if(decay)f.frequency.exponentialRampToValueAtTime(60,t0+dur);
  g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  src.connect(f).connect(g).connect(c.destination);src.start(t0);
}
const buzz=p=>{if(fx.vibrate&&navigator.vibrate){try{navigator.vibrate(p)}catch(e){}}};

export const sfx={
  tick(urgent){if(!fx.sound)return;tone(urgent?1500:1000,.04,{vol:urgent?.07:.035});if(urgent)buzz(15)},
  select(){if(fx.sound)tone(660,.05,{type:'triangle',vol:.06});buzz(10)},
  start(){if(fx.sound){tone(440,.08,{vol:.05});tone(880,.12,{vol:.05,when:.09})}buzz(20)},
  snip(){if(fx.sound){noise(.12,{vol:.35,freq:6000,decay:false});tone(2400,.06,{type:'sawtooth',vol:.04})}buzz(40)},
  boom(){if(fx.sound){noise(1.6,{vol:.9,freq:900});tone(90,1.1,{type:'sine',vol:.5,slide:30})}buzz([300,80,500])},
  win(){if(fx.sound)[523,659,784,1047].forEach((f,i)=>tone(f,.18,{type:'triangle',vol:.08,when:i*.1}));buzz([30,60,30])}
};
