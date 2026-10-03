import {roadCenter} from './endless.js';
import {drawChase} from './chase.js';
import {maps,headingAt,pointAt} from './maps.js';
import {vehicles} from './vehicles.js';
const TAU=Math.PI*2;
const palette={ice:{ground:'#b5dfe9',road:'#6eafc9',edge:'#f1ffff',paint:'#f3feff',dark:'#73a6bd'},beach:{ground:'#edcd8e',road:'#79776c',edge:'#fff2c7',paint:'#ffedbb',dark:'#d5ae70'},volcano:{ground:'#30272b',road:'#554851',edge:'#ffb473',paint:'#ffd6a2',dark:'#241f26'},city:{ground:'#152a29',road:'#333e49',edge:'#d6d8d0',paint:'#d9e3d0',dark:'#11201f'},canyon:{ground:'#c89965',road:'#6d6660',edge:'#f9d990',paint:'#efdcb4',dark:'#a8774f'},space:{ground:'#101629',road:'#303452',edge:'#be9bff',paint:'#b6b4d5',dark:'#151d35'}};
function rr(c,x,y,w,h,r,fill){c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function line(c,points,color,width,close=true){c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++)c.lineTo(...points[i]);if(close)c.closePath();c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function rand(i){return (Math.sin(i*127.1+311.7)*43758.5453)%1;}
export function drawVehicle(c,p,{scale=1,time=0,preview=false}={}){
  const v=vehicles[p.vehicle]||vehicles.car,color=p.color||v.color;c.save();c.translate(p.x,p.y);c.rotate(p.angle||0);c.scale(scale,scale);
  // Vehicles face right. Shadows and highlights make the small silhouettes readable.
  c.save();c.translate(-2,5);rr(c,-v.length/2-2,-v.width/2-2,v.length+4,v.width+4,7,'#0005');c.restore();
  if(p.vehicle==='ship'){
    const fire=preview||Math.hypot(p.vx||0,p.vy||0)>40;c.fillStyle='#3c2867';c.beginPath();c.moveTo(22,0);c.lineTo(-17,-20);c.lineTo(-10,0);c.lineTo(-17,20);c.closePath();c.fill();
    if(fire){c.fillStyle=p.input?.boost?'#a4ff58':'#74deff';c.beginPath();c.moveTo(-17,-5);c.lineTo(-27-Math.sin(time*40)*7,0);c.lineTo(-17,5);c.fill();}
    c.fillStyle=color;c.beginPath();c.moveTo(25,0);c.lineTo(-12,-12);c.lineTo(-6,0);c.lineTo(-12,12);c.closePath();c.fill();rr(c,-3,-5,13,10,4,'#233744');rr(c,0,-3,5,6,2,'#8ceaff');rr(c,-14,-19,7,5,2,color);rr(c,-14,14,7,5,2,color);
  }else if(p.vehicle==='bike'){
    rr(c,-20,-5,11,10,3,'#10131d');rr(c,9,-5,11,10,3,'#10131d');rr(c,-13,-6,28,12,4,color);rr(c,-6,-5,12,10,3,'#1b2430');c.fillStyle='#f3e4c8';c.beginPath();c.arc(0,0,5,0,TAU);c.fill();c.fillStyle='#192635';c.fillRect(1,-4,4,8);c.fillStyle=color;c.fillRect(9,-11,3,22);c.fillStyle='#fff3be';c.fillRect(15,-3,3,6);
  }else{
    for(const x of p.vehicle==='bus'?[-22,17]:[-12,11]){rr(c,x-4,-v.width/2-4,9,7,2,'#11151c');rr(c,x-4,v.width/2-3,9,7,2,'#11151c');}
    rr(c,-v.length/2,-v.width/2,v.length,v.width,6,color);rr(c,-v.length/2+3,-v.width/2+2,v.length-6,3,2,'#ffffff55');
    if(p.vehicle==='bus'){
      rr(c,20,-12,7,24,2,'#273749');for(const x of [-23,-12,-1,10]){rr(c,x,-13,8,6,2,'#39445b');rr(c,x,7,8,6,2,'#39445b');}rr(c,-22,-5,35,10,2,'#e6ad3d');c.fillStyle='#333448';c.font='bold 6px sans-serif';c.textAlign='center';c.fillText('BONK',-4,2);
    }else{rr(c,-9,-10,21,20,5,'#273749');rr(c,6,-9,7,18,2,'#75b7ca');rr(c,-11,-8,5,16,2,'#58727e');rr(c,-3,-8,8,16,2,color);c.fillStyle='#ffffff88';c.fillRect(-2,-7,2,14);}
    c.fillStyle='#fff8c9';c.fillRect(v.length/2-4,-v.width/2+3,3,5);c.fillRect(v.length/2-4,v.width/2-8,3,5);c.fillStyle='#ff6d8c';c.fillRect(-v.length/2+1,-v.width/2+3,2,5);c.fillRect(-v.length/2+1,v.width/2-8,2,5);
  }
  c.restore();
}
export function drawMap(c,map,time=0){
  const p=palette[map.theme];c.fillStyle=p.ground;c.fillRect(0,0,map.width,map.height);
  // Deterministic scenery: it stays fixed rather than popping around each frame.
  if(map.theme==='city'){
    for(let i=0;i<32;i++){const x=280+(i%8)*135,y=325+Math.floor(i/8)*108;c.fillStyle=i%3?'#213e3b':'#284943';c.fillRect(x,y,95,70);c.fillStyle='#102b29';c.fillRect(x+8,y+8,79,54);c.fillStyle=i%2?'#b1ec6f44':'#7e9dd444';for(let w=0;w<4;w++)c.fillRect(x+17+w*16,y+18,7,14);}
    for(let i=0;i<30;i++){const x=Math.abs(rand(i))*map.width,y=Math.abs(rand(i+70))*map.height;c.fillStyle='#2f5c42';c.beginPath();c.arc(x,y,18+(i%3)*6,0,TAU);c.fill();c.fillStyle='#244a37';c.beginPath();c.arc(x-4,y-4,12,0,TAU);c.fill();}
  }else if(map.theme==='canyon'){
    for(let i=0;i<65;i++){const x=Math.abs(rand(i))*map.width,y=Math.abs(rand(i+100))*map.height;c.strokeStyle='#e3b681';c.lineWidth=2;c.beginPath();c.arc(x,y,12+(i%4)*8,.1,2.9);c.stroke();}
    for(let i=0;i<24;i++){const x=Math.abs(rand(i+32))*map.width,y=Math.abs(rand(i+78))*map.height;rr(c,x-4,y-18,8,36,4,'#3c7153');rr(c,x-14,y-5,13,6,3,'#3c7153');rr(c,x-14,y-14,5,14,2,'#3c7153');rr(c,x+3,y+2,12,6,3,'#3c7153');rr(c,x+11,y-7,5,15,2,'#3c7153');}
    c.fillStyle='#ae764e';c.beginPath();c.ellipse(700,480,190,95,-.15,0,TAU);c.fill();c.fillStyle='#bd895a';c.beginPath();c.ellipse(695,465,170,70,-.15,0,TAU);c.fill();
  }else if(map.theme==='ice'){
    for(let i=0;i<55;i++){const x=Math.abs(rand(i))*map.width,y=Math.abs(rand(i+79))*map.height;c.fillStyle=i%2?'#e9fbff':'#8fc8dc';c.beginPath();c.ellipse(x,y,24+i%5*9,10+i%4*8,-.3,0,TAU);c.fill();c.strokeStyle='#ffffff66';c.lineWidth=2;c.beginPath();c.moveTo(x-20,y);c.lineTo(x,y+9);c.lineTo(x+24,y-9);c.stroke();}
    c.fillStyle='#75b6ce';c.beginPath();c.ellipse(800,520,200,100,.2,0,TAU);c.fill();c.strokeStyle='#c2efff';c.lineWidth=5;c.beginPath();c.moveTo(655,500);c.lineTo(755,540);c.lineTo(820,470);c.lineTo(925,540);c.stroke();
  }else if(map.theme==='beach'){
    c.fillStyle='#45bbc1';c.beginPath();c.ellipse(800,500,230,115,-.12,0,TAU);c.fill();c.strokeStyle='#b4fff3';c.lineWidth=12;c.stroke();
    for(let i=0;i<34;i++){const x=Math.abs(rand(i+45))*map.width,y=Math.abs(rand(i+83))*map.height;c.strokeStyle='#bd8b54';c.lineWidth=7;c.beginPath();c.moveTo(x+7,y+18);c.lineTo(x,y);c.stroke();c.strokeStyle=i%2?'#348b61':'#267d5a';c.lineWidth=8;for(let j=0;j<5;j++){const a=j*TAU/5;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*20,y+Math.sin(a)*20-10,x+Math.cos(a)*33,y+Math.sin(a)*33);c.stroke();}}
    for(let i=0;i<50;i++){c.fillStyle='#fff0c555';c.fillRect(Math.abs(rand(i+14))*map.width,Math.abs(rand(i+214))*map.height,5,3);}
  }else if(map.theme==='volcano'){
    for(let i=0;i<45;i++){const x=Math.abs(rand(i))*map.width,y=Math.abs(rand(i+131))*map.height;c.strokeStyle='#a54c39';c.lineWidth=6;c.beginPath();c.moveTo(x-23,y-18);c.lineTo(x,y);c.lineTo(x+18,y-9);c.lineTo(x+28,y+25);c.stroke();c.strokeStyle='#ff8f4855';c.lineWidth=2;c.stroke();}
    c.fillStyle='#1d1b26';c.beginPath();c.ellipse(800,475,200,115,0,0,TAU);c.fill();c.fillStyle='#e95838';c.beginPath();c.ellipse(800,475,133,65,0,0,TAU);c.fill();c.fillStyle='#ffbd61';c.beginPath();c.ellipse(800,470,93,36,0,0,TAU);c.fill();
  }else{
    for(let i=0;i<250;i++){c.fillStyle=i%3?'#a2b1de66':'#eef4ff';const x=Math.abs(rand(i))*map.width,y=Math.abs(rand(i+321))*map.height;c.fillRect(x,y,i%7?1.8:3,i%7?1.8:3);}
    const g=c.createRadialGradient(680,520,10,680,520,170);g.addColorStop(0,'#c795ff33');g.addColorStop(1,'#24164100');c.fillStyle=g;c.fillRect(490,330,380,380);c.fillStyle='#473c7c';c.beginPath();c.arc(720,480,75,0,TAU);c.fill();c.strokeStyle='#aa94de';c.lineWidth=10;c.beginPath();c.ellipse(720,480,135,23,-.4,0,TAU);c.stroke();
  }
  line(c,map.points,'#0003',map.roadWidth+28);line(c,map.points,p.edge,map.roadWidth+12);line(c,map.points,p.road,map.roadWidth);c.setLineDash([20,25]);line(c,map.points,p.paint+'77',2);c.setLineDash([]);
  // Red/white kerbs outline the route, especially useful on a small phone.
  c.setLineDash([13,13]);line(c,map.points,map.theme==='space'?'#8152c7':'#e66461',map.roadWidth+7);line(c,map.points,p.road,map.roadWidth-4);c.setLineDash([]);c.setLineDash([19,24]);line(c,map.points,p.paint+'99',2);c.setLineDash([]);
  const start=map.points[0],a=headingAt(map,0);c.save();c.translate(start[0],start[1]);c.rotate(a);for(let x=-8;x<8;x+=8)for(let y=-map.roadWidth/2+8;y<map.roadWidth/2-8;y+=8){c.fillStyle=((x/8+Math.floor(y/8))%2===0)?'#f9f9eb':'#1b202d';c.fillRect(x,y,8,8);}c.restore();
  c.save();c.translate(760,570);c.rotate(-.12);c.textAlign='center';c.fillStyle=map.theme==='canyon'?'#774b3044':'#ffffff12';c.font='900 84px sans-serif';c.fillText('BUMPER',0,0);c.fillText('BRIGADE',0,85);c.font='bold 14px sans-serif';c.fillText('ALL VEHICLES WELCOME. COMMON SENSE OPTIONAL.',0,117);c.restore();
  for(const o of map.obstacles){c.save();c.translate(o.x,o.y);c.fillStyle='#0003';c.beginPath();c.ellipse(4,8,o.r+4,o.r-4,0,0,TAU);c.fill();if(o.type==='cone'){c.fillStyle='#ff8a46';c.beginPath();c.moveTo(0,-o.r);c.lineTo(o.r,o.r);c.lineTo(-o.r,o.r);c.fill();c.fillStyle='#ffe9ad';c.fillRect(-o.r*.55,0,o.r*1.1,5);}else if(o.type==='tires'){c.fillStyle='#17202c';c.beginPath();c.arc(0,0,o.r,0,TAU);c.fill();c.strokeStyle='#596271';c.lineWidth=5;c.beginPath();c.arc(0,0,o.r*.6,0,TAU);c.stroke();}else if(o.type==='barrel'){rr(c,-o.r,-o.r,o.r*2,o.r*2,6,'#b84e69');c.fillStyle='#efc56c';c.fillRect(-o.r,-8,o.r*2,5);c.fillRect(-o.r,7,o.r*2,5);}else{c.fillStyle=o.type==='ice'?'#b9f4ff':o.type==='lava'?'#bc5638':o.type==='asteroid'?'#767599':'#8c644c';c.beginPath();for(let i=0;i<8;i++){const r=o.r*(.85+(i%3)*.1);const x=Math.cos(i*TAU/8)*r,y=Math.sin(i*TAU/8)*r;if(!i)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fill();c.fillStyle='#ffffff22';c.beginPath();c.arc(-5,-5,8,0,TAU);c.fill();}c.restore();}
  // Direction arrows follow the course.
  for(let i=1;i<map.points.length;i+=2){const a=pointAt(map,i),b=pointAt(map,i+1),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);c.save();c.translate((a[0]+b[0])/2,(a[1]+b[1])/2);c.rotate(angle);c.strokeStyle=p.paint+'55';c.lineWidth=5;c.beginPath();c.moveTo(-10,-12);c.lineTo(4,0);c.lineTo(-10,12);c.stroke();c.restore();}
}
export class Renderer{
  constructor(canvas,{createCanvas=null}={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.mapCanvas=null;this.cachedMap=null;this.createCanvas=createCanvas||(()=>document.createElement('canvas'));this.camera={x:800,y:550,zoom:1};this.particles=[];this.trails=[];this.seen=0;this.shake=0;this.flash=0;this.lastTime=0;this.positions=new Map();}
  reset(){this.seen=0;this.particles=[];this.trails=[];this.positions.clear();this.cachedMap=null;this.lastTime=0;}
  mapImage(map){if(this.cachedMap!==map.id){this.mapCanvas=this.createCanvas(map.width,map.height);this.mapCanvas.width=map.width;this.mapCanvas.height=map.height;drawMap(this.mapCanvas.getContext('2d'),map);this.cachedMap=map.id;}return this.mapCanvas;}
  draw(s,me,{overview=false,chase=false,camera={},dt=1/60,smooth=false}={}){
    const c=this.ctx,w=this.canvas.width,h=this.canvas.height,map=maps[s.mapId],mine=s.players.find(p=>p.id===me)||s.players[0];if(!mine)return;
    if(chase&&!overview){const angle=mine.angle+(camera.angle||0)*Math.PI/180,behind=camera.distance||125;this.chaseCamera={x:mine.x-Math.cos(angle)*behind,y:mine.y-Math.sin(angle)*behind,angle,height:camera.height||82,zoom:camera.zoom||1};drawChase(c,s,mine,w,h,this.chaseCamera);return;}
    this.shake=Math.max(0,this.shake-dt*26);this.flash=Math.max(0,this.flash-dt*4);
    for(const e of s.events){if(e.id<=this.seen)continue;this.seen=Math.max(this.seen,e.id);if(e.type==='explode'||e.type==='bonk'||e.type==='rocket'||e.type==='hit'||e.type==='pulse'||e.type==='respawn'){
      const n=e.type==='explode'?36:e.type==='pulse'?24:9;for(let i=0;i<n;i++){const a=i*TAU/n,v=e.type==='explode'?80+i%7*25:60+i%5*18;this.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:e.type==='explode'?.85:.45,max:e.type==='explode'?.85:.45,color:i%3?e.color:'#fff5d6',size:e.type==='explode'?3+i%5:3});}
      if(Math.hypot(mine.x-e.x,mine.y-e.y)<260){this.shake=e.type==='explode'?11:4;if(e.type==='explode')this.flash=.55;}}
    }
    if(this.particles.length>300)this.particles.splice(0,this.particles.length-300);
    for(const p of s.players){if(p.deadUntil)continue;let pos=this.positions.get(p.id);if(!pos)this.positions.set(p.id,pos={x:p.x,y:p.y,angle:p.angle});if(Math.hypot(p.x-pos.x,p.y-pos.y)>180){pos.x=p.x;pos.y=p.y;pos.angle=p.angle;}const mix=smooth?Math.min(1,dt*17):1;pos.x+=(p.x-pos.x)*mix;pos.y+=(p.y-pos.y)*mix;pos.angle+=Math.atan2(Math.sin(p.angle-pos.angle),Math.cos(p.angle-pos.angle))*mix;if(Math.hypot(p.vx,p.vy)>120&&p.input?.drift){this.trails.push({x:p.x,y:p.y,angle:p.angle,time:s.time});}}
    this.trails=this.trails.filter(t=>s.time-t.time<3).slice(-160);
    const pos=this.positions.get(mine.id)||mine,ratio=w/h;const zoom=overview?Math.min(w/map.width,h/map.height)*.94:Math.min(w/(ratio<.9?570:950),h/760);
    const targetX=overview?map.width/2:pos.x+Math.cos(pos.angle)*85,targetY=overview?map.height/2:pos.y+Math.sin(pos.angle)*85;
    const halfW=w/zoom/2,halfH=h/zoom/2,tx=overview||halfW>=map.width/2?map.width/2:Math.max(halfW,Math.min(map.width-halfW,targetX)),ty=overview||halfH>=map.height/2?map.height/2:Math.max(halfH,Math.min(map.height-halfH,targetY));
    if(!this.lastTime||overview){this.camera.x=tx;this.camera.y=ty;}else{const mix=1-Math.exp(-dt*7);this.camera.x+=(tx-this.camera.x)*mix;this.camera.y+=(ty-this.camera.y)*mix;}this.camera.zoom=zoom;this.lastTime=s.time;
    c.fillStyle='#10151d';c.fillRect(0,0,w,h);c.save();c.translate(w/2+(overview?0:Math.sin(s.time*99)*this.shake),h/2+(overview?0:Math.cos(s.time*111)*this.shake));c.scale(zoom,zoom);c.translate(-this.camera.x,-this.camera.y);c.drawImage(this.mapImage(map),0,0);
    for(const t of this.trails){c.save();c.translate(t.x,t.y);c.rotate(t.angle);c.globalAlpha=.35*(1-(s.time-t.time)/3);c.fillStyle='#070b14';c.fillRect(-15,-13,12,3);c.fillRect(-15,10,12,3);c.restore();}
    // Highlight the player's next checkpoint, never all gates at once.
    if(!overview&&mine.finishedAt===null){const g=pointAt(map,mine.next),a=headingAt(map,mine.next);c.save();c.translate(g[0],g[1]);c.rotate(a);c.fillStyle='#c5ff7322';c.fillRect(-8,-map.roadWidth/2,16,map.roadWidth);c.strokeStyle='#c5ff73';c.lineWidth=2;c.setLineDash([5,5]);c.strokeRect(-8,-map.roadWidth/2,16,map.roadWidth);c.setLineDash([]);c.restore();}
    for(const item of s.pickups){if(s.time<item.readyAt)continue;c.save();c.translate(item.x,item.y);const bob=Math.sin(s.time*3+item.id)*3;c.translate(0,bob);c.rotate(Math.PI/4);rr(c,-14,-14,28,28,5,item.type==='repair'?'#75eaba':item.type==='boost'?'#a4ff58':'#ff91bb');c.rotate(-Math.PI/4);c.fillStyle='#1c2530';c.textAlign='center';c.font='bold 18px sans-serif';c.fillText(item.type==='repair'?'+':item.type==='boost'?'»':'?',0,6);c.restore();}
    for(const peel of s.peels){c.save();c.translate(peel.x,peel.y);c.strokeStyle='#ffdf57';c.lineWidth=5;c.beginPath();c.arc(0,-4,11,.4,2.7);c.stroke();c.restore();}
    for(const shot of s.shots){c.save();c.translate(shot.x,shot.y);c.rotate(Math.atan2(shot.vy,shot.vx));c.strokeStyle='#ffe77d88';c.lineWidth=5;c.beginPath();c.moveTo(-27,0);c.lineTo(-8,0);c.stroke();rr(c,-10,-5,20,10,5,'#fff0ae');c.fillStyle='#f46799';c.beginPath();c.moveTo(10,-5);c.lineTo(17,0);c.lineTo(10,5);c.fill();c.restore();}
    for(const p of s.players){if(p.deadUntil){const remain=Math.max(0,p.deadUntil-s.time);c.fillStyle='#10151dc0';c.beginPath();c.arc(p.x,p.y,30,0,TAU);c.fill();c.strokeStyle=p.color;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,32,-Math.PI/2,-Math.PI/2+TAU*remain/3);c.stroke();c.fillStyle='#fff';c.textAlign='center';c.font='bold 20px sans-serif';c.fillText(String(Math.ceil(remain)),p.x,p.y+7);continue;}
      const pos=this.positions.get(p.id)||p;c.save();if(s.time<p.invulnerableUntil)c.globalAlpha=.65+Math.sin(s.time*20)*.2;
      drawVehicle(c,{...p,x:pos.x,y:pos.y,angle:pos.angle},{time:s.time});c.restore();
      if(!overview){const len=vehicles[p.vehicle].length;c.fillStyle='#10151dce';c.textAlign='center';c.font='bold 11px sans-serif';const name=p.id===me?'YOU':p.name;const width=c.measureText(name).width+12;rr(c,pos.x-width/2,pos.y-len/2-25,width,17,4,'#10151de0');c.fillStyle=p.color;c.fillText(name,pos.x,pos.y-len/2-13);if(p.hp<vehicles[p.vehicle].hp){rr(c,pos.x-18,pos.y+len/2+9,36,4,2,'#10151d');rr(c,pos.x-18,pos.y+len/2+9,36*Math.max(0,p.hp)/vehicles[p.vehicle].hp,4,2,p.hp<30?'#ff718f':'#a4ff58');}}
      if(p.id===me&&!overview){c.strokeStyle=p.color+'55';c.lineWidth=2;c.beginPath();c.arc(pos.x,pos.y,vehicles[p.vehicle].radius+8,0,TAU);c.stroke();}
    }
    for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size,0,TAU);c.fill();}c.globalAlpha=1;this.particles=this.particles.filter(p=>p.life>0);
    for(const e of s.events){const age=s.time-e.time;if(e.type==='explode'&&age<.7){c.fillStyle='#ffd65a';c.font='900 24px sans-serif';c.textAlign='center';c.save();c.translate(e.x,e.y-45-age*30);c.rotate(-.13);c.fillText('KABONK!',0,0);c.restore();}else if((e.type==='points'||e.type==='pickup'||e.type==='lap')&&age<1.2){c.globalAlpha=1-age/1.2;c.fillStyle=e.color;c.textAlign='center';c.font='bold 14px sans-serif';c.fillText(e.text,e.x,e.y-42-age*30);c.globalAlpha=1;}else if(e.type==='pulse'&&age<.45){c.globalAlpha=1-age/.45;c.strokeStyle=e.color;c.lineWidth=7;c.beginPath();c.arc(e.x,e.y,145*age/.45,0,TAU);c.stroke();c.globalAlpha=1;}}
    c.restore();if(this.flash&&!overview){c.fillStyle=`rgba(255,216,142,${this.flash*.22})`;c.fillRect(0,0,w,h);}
  }
}
export function drawMinimap(c,s,me,width=160,height=106){if(s.mode==='endless'){c.clearRect(0,0,width,height);const mine=s.players.find(p=>p.id===me)||s.players[0];c.fillStyle='#708085';c.fillRect(width/2-15,0,30,height);for(const p of s.players){c.fillStyle=p.id===me?'#fff':p.color;c.beginPath();c.arc(width/2+(p.y-roadCenter(p.x))*.25,height*.7-(p.x-mine.x)*.06,4,0,Math.PI*2);c.fill();}return;}const map=maps[s.mapId];c.clearRect(0,0,width,height);const scale=Math.min((width-10)/map.width,(height-10)/map.height);c.save();c.translate(5,5);c.scale(scale,scale);line(c,map.points,'#708085',60);for(const p of s.players){if(p.deadUntil)continue;c.fillStyle=p.id===me?'#ffffff':p.color;c.beginPath();c.arc(p.x,p.y,p.id===me?27:19,0,TAU);c.fill();}c.restore();}
