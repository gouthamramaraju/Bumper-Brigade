import {roadCenter,roadAngle,endlessObstacles,endlessPickups} from './endless.js';
import {maps,nearestRoad,headingAt,pointAt,pickupsFor} from './maps.js';
import {vehicles,playerColors} from './vehicles.js';
export {maps,vehicles};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function random(s){s.seed=(Math.imul(1664525,s.seed)+1013904223)>>>0;return s.seed/4294967296;}
export function createMatch(mapId,roster,seed=98765,{duration=120,laps=3,mode='circuit'}={}){
  if(!maps[mapId])throw new Error('Unknown map');if(roster.length<1||roster.length>10)throw new Error('Need 1–10 racers');
  const map=maps[mapId],s={mapId,mode:mode==='endless'?'endless':'circuit',time:0,duration,laps,status:'playing',seed:seed>>>0,players:[],pickups:pickupsFor(map),shots:[],peels:[],events:[],eventId:0,finishAt:null,pairs:{}};
  s.players=roster.map((r,i)=>{const type=vehicles[r.vehicle]?r.vehicle:'car',v=vehicles[type];return{id:r.id,name:r.name,vehicle:type,bot:Boolean(r.bot),color:playerColors[i],x:0,y:0,angle:0,vx:0,vy:0,hp:v.hp,score:0,lap:0,next:1,lastGate:0,finishedAt:null,deadUntil:0,invulnerableUntil:3,spinUntil:0,stuck:0,touchAt:-10,weapon:['rocket','banana','pulse'][i%3],ammo:2,lastFire:-10,boost:100,input:{steer:0,throttle:0,brake:false,drift:false,boost:false,fire:false}};});
  s.players.forEach((p,i)=>spawn(s,p,i,true));if(s.mode==='endless')s.pickups=endlessPickups(0);return s;
}
function event(s,type,data){s.events.push({id:++s.eventId,type,time:s.time,...data});if(s.events.length>50)s.events.splice(0,s.events.length-50);}
function spawn(s,p,index,initial=false){if(s.mode==='endless'){p.x=initial?240-Math.floor(index/2)*55:Math.max(50,(p.bestDistance||240)-80);p.y=roadCenter(p.x)+(index%2?27:-27);p.angle=roadAngle(p.x);p.vx=p.vy=0;p.hp=vehicles[p.vehicle].hp;p.deadUntil=0;p.invulnerableUntil=s.time+(initial?3:2);p.spinUntil=0;p.stuck=0;return;}const map=maps[s.mapId],a=pointAt(map,p.lastGate),angle=headingAt(map,p.lastGate);const sideways=(index%2?1:-1)*27,back=initial?-220+Math.floor(index/2)*55:22; p.x=a[0]-Math.cos(angle)*back-Math.sin(angle)*sideways;p.y=a[1]-Math.sin(angle)*back+Math.cos(angle)*sideways;p.angle=angle;p.vx=p.vy=0;p.hp=vehicles[p.vehicle].hp;p.deadUntil=0;p.invulnerableUntil=s.time+(initial?3:2);p.spinUntil=0;p.stuck=0;}
export function setInput(s,id,input){const p=s.players.find(p=>p.id===id);if(!p)return;const n=k=>Number.isFinite(input?.[k])?clamp(input[k],-1,1):0;p.input={steer:n('steer'),throttle:n('throttle'),brake:input?.brake===true,drift:input?.drift===true,boost:input?.boost===true,fire:input?.fire===true};}
export function explode(s,p,attacker=null){if(p.deadUntil || p.finishedAt!==null)return;p.deadUntil=s.time+3;p.hp=0;p.vx=p.vy=0;p.score=Math.max(0,p.score-30);p.input.fire=false;p.stuck=0;event(s,'explode',{x:p.x,y:p.y,color:p.color,player:p.id});if(attacker&&attacker!==p.id){const a=s.players.find(q=>q.id===attacker);if(a){a.score+=25;event(s,'points',{x:a.x,y:a.y,text:'+25 BONK',color:a.color});}}}
function damage(s,p,amount,attacker=null){if(p.deadUntil || p.finishedAt!==null || s.time<p.invulnerableUntil)return;p.hp-=amount;event(s,'hit',{x:p.x,y:p.y,color:p.color});if(p.hp<=0)explode(s,p,attacker);}
function botInput(s,p){
 if(s.mode==='endless'){const targetX=p.x+200,desired=Math.atan2(roadCenter(targetX)-p.y,targetX-p.x);let steer=angleDifference(desired,p.angle)*3;for(const o of endlessObstacles(p.x))if(o.x>p.x&&o.x-p.x<230&&Math.abs(o.y-p.y)<55)steer+=(o.y>=p.y?-1:1)*.9;return{steer:clamp(steer,-1,1),throttle:1,boost:Math.abs(steer)<.2&&p.boost>40,fire:random(s)<.005};}
 const map=maps[s.mapId],target=pointAt(map,p.next),speed=Math.hypot(p.vx,p.vy),v=vehicles[p.vehicle];let desired=Math.atan2(target[1]-p.y,target[0]-p.x);
 // Aim around obstacles before reaching them, rather than repeatedly ramming one.
 for(const o of map.obstacles){const dx=o.x-p.x,dy=o.y-p.y,forward=dx*Math.cos(desired)+dy*Math.sin(desired),side=-dx*Math.sin(desired)+dy*Math.cos(desired),look=140+speed*.25;
  if(forward>0&&forward<look&&Math.abs(side)<o.r+v.radius+24){const avoid=side>=0?-1:1,tx=o.x-Math.sin(desired)*avoid*(o.r+v.radius+38),ty=o.y+Math.cos(desired)*avoid*(o.r+v.radius+38);desired=Math.atan2(ty-p.y,tx-p.x);break;}}
 const delta=angleDifference(desired,p.angle),bend=Math.abs(angleDifference(headingAt(map,p.next),desired));
 return{steer:clamp(delta*2.5,-1,1),throttle:Math.abs(delta)>1.5?.45:(Math.abs(delta)>.6||bend>.7?.58:1),brake:Math.abs(delta)>.9&&speed>180,drift:Math.abs(delta)>.45&&speed>220,boost:Math.abs(delta)<.15&&bend<.3&&p.boost>35,fire:s.time-p.lastFire>5&&random(s)<.008};
}
function fire(s,p){if(!p.ammo||s.time-p.lastFire<.7||p.deadUntil||p.finishedAt!==null)return;p.ammo--;p.lastFire=s.time;const a=p.angle;
  if(p.weapon==='rocket'){s.shots.push({id:++s.eventId,x:p.x+Math.cos(a)*35,y:p.y+Math.sin(a)*35,vx:Math.cos(a)*620,vy:Math.sin(a)*620,owner:p.id,life:2.8,color:p.color});event(s,'fire',{x:p.x,y:p.y,color:p.color});}
  if(p.weapon==='banana'){s.peels.push({id:++s.eventId,x:p.x-Math.cos(a)*40,y:p.y-Math.sin(a)*40,owner:p.id,life:14});event(s,'banana',{x:p.x,y:p.y,color:'#ffcc5c'});}
  if(p.weapon==='pulse'){event(s,'pulse',{x:p.x,y:p.y,color:p.color});for(const q of s.players){if(q.id===p.id||q.deadUntil||q.finishedAt!==null)continue;const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<145){const angle=Math.atan2(q.y-p.y,q.x-p.x);q.vx+=Math.cos(angle)*240;q.vy+=Math.sin(angle)*240;damage(s,q,35,p.id);}}}
}
function move(s,p,dt){
  if(p.deadUntil){if(s.time+1e-8>=p.deadUntil){spawn(s,p,s.players.indexOf(p));event(s,'respawn',{x:p.x,y:p.y,color:p.color});}return;}
  if(p.finishedAt!==null){p.vx*=Math.exp(-6*dt);p.vy*=Math.exp(-6*dt);return;}
  if(p.bot)p.input=botInput(s,p);
  const v=vehicles[p.vehicle],map=maps[s.mapId],i=p.input,road=s.mode==='endless'?{distance:Math.abs(p.y-roadCenter(p.x))}:nearestRoad(map,p.x,p.y),onRoad=road.distance<map.roadWidth/2;
  const forward=p.vx*Math.cos(p.angle)+p.vy*Math.sin(p.angle);const moving=Math.min(1,Math.abs(forward)/90);
  p.angle+=i.steer*v.turn*moving*dt*(forward< -15?-1:1)*(i.drift?1.35:1);
  if(s.time<p.spinUntil)p.angle+=9*dt;
  const grip=v.grip*(map.gripMultiplier??(map.theme==='space'?.65:1))*(i.drift?.3:1)*(s.time<p.spinUntil?.15:1);
  const lateral=-p.vx*Math.sin(p.angle)+p.vy*Math.cos(p.angle),damp=1-Math.exp(-grip*dt);p.vx+=Math.sin(p.angle)*lateral*damp;p.vy-=Math.cos(p.angle)*lateral*damp;
  const boosting=i.boost&&p.boost>1&&i.throttle>0&&onRoad;
  p.boost=clamp(p.boost+(boosting?-33:12)*dt,0,100);
  const accel=i.throttle*v.acceleration*(boosting?1.7:1);p.vx+=Math.cos(p.angle)*accel*dt;p.vy+=Math.sin(p.angle)*accel*dt;
  const drag=Math.exp(-(i.brake?4.8:onRoad?.55:2.4)*dt);p.vx*=drag;p.vy*=drag;
  const speed=Math.hypot(p.vx,p.vy),limit=v.maxSpeed*(boosting?1.4:1)*(onRoad?1:.48);if(speed>limit){p.vx*=limit/speed;p.vy*=limit/speed;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  // Off-track terrain slows you down. Outer map bounds are solid barriers.
  if(s.mode!=='endless'&&(p.x<v.radius||p.x>map.width-v.radius)){p.x=clamp(p.x,v.radius,map.width-v.radius);p.vx*= -.3;p.touchAt=s.time;damage(s,p,12);}
  if(s.mode!=='endless'&&(p.y<v.radius||p.y>map.height-v.radius)){p.y=clamp(p.y,v.radius,map.height-v.radius);p.vy*= -.3;p.touchAt=s.time;damage(s,p,12);}
  for(const o of s.mode==='endless'?endlessObstacles(p.x):map.obstacles){const dx=p.x-o.x,dy=p.y-o.y,d=Math.hypot(dx,dy),min=v.radius+o.r;if(d<min){const nx=d>.01?dx/d:1,ny=d>.01?dy/d:0;p.x=o.x+nx*(min+.1);p.y=o.y+ny*(min+.1);const closing=-(p.vx*nx+p.vy*ny);if(closing>0){p.vx+=nx*closing*1.4;p.vy+=ny*closing*1.4;if(s.time-p.touchAt>.25)damage(s,p,Math.min(38,closing*.16));}p.touchAt=s.time;}}
  if(i.throttle>.5&&Math.hypot(p.vx,p.vy)<45&&s.time-p.touchAt<.35)p.stuck+=dt;else p.stuck=Math.max(0,p.stuck-dt*2);
  if(p.stuck>1.35)explode(s,p);
  if(p.deadUntil)return;
  if(i.fire)fire(s,p);
  if(s.mode==='endless'){p.bestDistance=Math.max(p.bestDistance||0,p.x);const gate=Math.floor(p.bestDistance/320);if(gate>(p.distanceGate||0)){p.score+=(gate-(p.distanceGate||0))*10;p.distanceGate=gate;event(s,'gate',{x:p.x,y:p.y,color:p.color});}}
  const target=pointAt(map,p.next);if(s.mode!=='endless'&&(Math.hypot(p.x-target[0],p.y-target[1])<map.roadWidth*.62)){p.lastGate=p.next;p.next=(p.next+1)%map.points.length;p.score+=10;event(s,'gate',{x:p.x,y:p.y,color:p.color});if(p.lastGate===0){p.lap++;p.score+=100;event(s,'lap',{x:p.x,y:p.y,text:`LAP ${p.lap}`,color:p.color});if(p.lap>=s.laps){p.finishedAt=s.time;p.score+=200;if(s.finishAt===null)s.finishAt=Math.min(s.duration,s.time+12);event(s,'finish',{x:p.x,y:p.y,color:p.color});}}}
  for(const item of s.pickups)if(s.time>=item.readyAt&&Math.hypot(p.x-item.x,p.y-item.y)<v.radius+22){item.readyAt=s.time+8;if(item.type==='repair')p.hp=Math.min(v.hp,p.hp+40);else if(item.type==='boost')p.boost=100;else{p.weapon=['rocket','banana','pulse'][Math.floor(random(s)*3)];p.ammo=Math.min(4,p.ammo+2);}event(s,'pickup',{x:p.x,y:p.y,text:item.type.toUpperCase(),color:p.color});}
}
function collide(s,dt){for(let a=0;a<s.players.length;a++)for(let b=a+1;b<s.players.length;b++){
  const p=s.players[a],q=s.players[b];if(p.deadUntil||q.deadUntil||p.finishedAt!==null||q.finishedAt!==null)continue;
  const v=vehicles[p.vehicle],w=vehicles[q.vehicle],dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),min=v.radius+w.radius;if(d>=min)continue;
  const nx=d>.01?dx/d:1,ny=d>.01?dy/d:0,overlap=min-d+.1,weight=v.mass+w.mass;p.x-=nx*overlap*w.mass/weight;p.y-=ny*overlap*w.mass/weight;q.x+=nx*overlap*v.mass/weight;q.y+=ny*overlap*v.mass/weight;
  const closing=(p.vx-q.vx)*nx+(p.vy-q.vy)*ny;
  if(closing>0){const impulse=closing*1.5/(1/v.mass+1/w.mass);p.vx-=nx*impulse/v.mass;p.vy-=ny*impulse/v.mass;q.vx+=nx*impulse/w.mass;q.vy+=ny*impulse/w.mass;
    const key=[p.id,q.id].sort().join(':');if(closing>65&&s.time-(s.pairs[key]??-10)>.35){s.pairs[key]=s.time;damage(s,p,closing*.13*w.mass,p.id===q.id?null:q.id);damage(s,q,closing*.13*v.mass,p.id);event(s,'bonk',{x:(p.x+q.x)/2,y:(p.y+q.y)/2,color:'#ffcc5c'});}}
  p.touchAt=q.touchAt=s.time;
}}
function weapons(s,dt){
  for(const shot of s.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.life-=dt;for(const p of s.players){if(p.id===shot.owner||p.deadUntil||p.finishedAt!==null)continue;if(Math.hypot(p.x-shot.x,p.y-shot.y)<vehicles[p.vehicle].radius+10){shot.life=0;damage(s,p,48,shot.owner);const m=vehicles[p.vehicle].mass;p.vx+=shot.vx*.23/m;p.vy+=shot.vy*.23/m;event(s,'rocket',{x:shot.x,y:shot.y,color:shot.color});break;}}}
  s.shots=s.shots.filter(p=>p.life>0);
  for(const peel of s.peels){peel.life-=dt;for(const p of s.players)if(p.id!==peel.owner&&!p.deadUntil&&p.finishedAt===null&&s.time>=p.invulnerableUntil&&Math.hypot(p.x-peel.x,p.y-peel.y)<vehicles[p.vehicle].radius+12){peel.life=0;p.spinUntil=s.time+1.1;damage(s,p,18,peel.owner);event(s,'slip',{x:p.x,y:p.y,color:'#ffcc5c'});break;}}
  s.peels=s.peels.filter(p=>p.life>0);
}
export function step(s,dt){if(s.status!=='playing')return;if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1/30);s.time=Math.min(s.duration,s.time+dt);if(s.mode==='endless'){const wanted=new Map();for(const p of s.players)for(const item of endlessPickups(p.x))wanted.set(item.id,item);for(const item of s.pickups)if(wanted.has(item.id))wanted.set(item.id,item);s.pickups=[...wanted.values()];}for(const p of s.players)move(s,p,dt);collide(s,dt);weapons(s,dt);s.events=s.events.filter(e=>s.time-e.time<2.6);if(s.time>=s.duration||(s.finishAt!==null&&s.time>=s.finishAt)||s.players.every(p=>p.finishedAt!==null))s.status='finished';}
export function progress(s,p){if(s.mode==='endless')return p.bestDistance||p.x;const map=maps[s.mapId],completed=p.lap*map.points.length+(p.next===0?map.points.length-1:p.next-1),target=pointAt(map,p.next),last=pointAt(map,p.lastGate);return completed+clamp(1-Math.hypot(p.x-target[0],p.y-target[1])/Math.max(1,Math.hypot(last[0]-target[0],last[1]-target[1])),0,.99);}
export function standings(s){return [...s.players].sort((a,b)=>{if(a.finishedAt!==null||b.finishedAt!==null){if(a.finishedAt===null)return 1;if(b.finishedAt===null)return -1;return a.finishedAt-b.finishedAt;}return progress(s,b)-progress(s,a)||b.score-a.score;});}
