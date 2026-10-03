// Perspective camera above and behind the driver. The server still uses the same 2D rules.
import {maps,headingAt,pointAt} from './maps.js';
import {vehicles} from './vehicles.js';
const themes={city:['#183346','#395663','#284039'],canyon:['#edb578','#f5d6ac','#b98a57'],space:['#0b1027','#302850','#191b36'],ice:['#93cde7','#d9f6ff','#b5dfe9'],beach:['#66cddd','#d5f5eb','#e5c28c'],volcano:['#392439','#b16a53','#33252b']};
export function projectPoint(x,y,camera,w,h){const dx=x-camera.x,dy=y-camera.y,z=dx*Math.cos(camera.angle)+dy*Math.sin(camera.angle),side=-dx*Math.sin(camera.angle)+dy*Math.cos(camera.angle);if(z<16||z>1500)return null;const focal=Math.min(w,h)*.92*(camera.zoom||1);return{x:w/2+side*focal/z,y:h*.31+camera.height*focal/z,z,scale:focal/z};}
function polygon(c,points,color){c.fillStyle=color;c.beginPath();c.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))c.lineTo(p.x,p.y);c.closePath();c.fill();}
function box(c,x,y,w,h,color,r=3){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
export function rearVehicle(c,p,x,y,size,time){
 const v=vehicles[p.vehicle],width=size*(p.vehicle==='bike'?.45:p.vehicle==='bus'?1.15:1),height=size*(p.vehicle==='bus'?.85:.55);c.save();c.translate(x,y);
 c.fillStyle='#0005';c.beginPath();c.ellipse(0,2,width*.65,size*.16,0,0,Math.PI*2);c.fill();
 if(p.vehicle==='ship'){polygon(c,[{x:-width*.8,y:0},{x:-width*.2,y:-height},{x:width*.2,y:-height},{x:width*.8,y:0}],p.color);box(c,-width*.18,-height*.8,width*.36,height*.45,'#b9ecff');c.fillStyle=p.input?.boost?'#b4ff64':'#74eaff';c.beginPath();c.ellipse(0,8,width*.13,12+Math.sin(time*33)*5,0,0,Math.PI*2);c.fill();}
 else if(p.vehicle==='bike'){box(c,-width*.23,-height*.6,width*.46,height*.8,'#142030');box(c,-width*.55,-height*.75,width*1.1,height*.35,p.color);c.fillStyle='#f2dbc3';c.beginPath();c.arc(0,-height,width*.3,0,Math.PI*2);c.fill();box(c,-width*.16,-height*.65,width*.32,5,'#ff798d');}
 else{box(c,-width*.6,-height*.25,width*.17,height*.3,'#0d1520');box(c,width*.43,-height*.25,width*.17,height*.3,'#0d1520');polygon(c,[{x:-width*.5,y:0},{x:-width*.43,y:-height*.7},{x:-width*.28,y:-height},{x:width*.28,y:-height},{x:width*.43,y:-height*.7},{x:width*.5,y:0}],p.color);box(c,-width*.29,-height*.83,width*.58,height*.34,'#2b4860');box(c,-width*.46,-height*.25,width*.2,height*.1,'#ff668a');box(c,width*.26,-height*.25,width*.2,height*.1,'#ff668a');box(c,-width*.42,-height*.09,width*.84,height*.06,'#dce5e5');if(p.vehicle==='bus'){c.fillStyle='#253044';c.font=`bold ${size*.12}px sans-serif`;c.textAlign='center';c.fillText('BONK',0,-height*.27);}}
 c.restore();
}
export function drawChase(c,s,mine,w,h,camera){
 const map=maps[s.mapId],t=themes[map.theme],sky=c.createLinearGradient(0,0,0,h*.36);sky.addColorStop(0,t[0]);sky.addColorStop(1,t[1]);c.fillStyle=sky;c.fillRect(0,0,w,h);c.fillStyle=t[2];c.fillRect(0,h*.31,w,h*.69);
 // Distant silhouettes stay beyond the playable road.
 for(let i=0;i<9;i++){const x=(i/8)*w;c.fillStyle=map.theme==='ice'?'#f4ffff':map.theme==='volcano'?'#552c35':'#30485855';polygon(c,[{x:x-w*.13,y:h*.32},{x,y:h*(.17+(i%3)*.025)},{x:x+w*.13,y:h*.32}],c.fillStyle);}
 const quads=[];
 for(let i=0;i<map.points.length;i++){const a=pointAt(map,i),b=pointAt(map,i+1),length=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.ceil(length/18),nx=-(b[1]-a[1])/length,ny=(b[0]-a[0])/length;
 for(let j=0;j<count;j++){let ax=a[0]+(b[0]-a[0])*j/count,ay=a[1]+(b[1]-a[1])*j/count,bx=a[0]+(b[0]-a[0])*(j+1)/count,by=a[1]+(b[1]-a[1])*(j+1)/count;
 const depth=(x,y)=>(x-camera.x)*Math.cos(camera.angle)+(y-camera.y)*Math.sin(camera.angle),za=depth(ax,ay),zb=depth(bx,by);if(za<18&&zb<18)continue;if(za<18){const u=(18-za)/(zb-za);ax+=(bx-ax)*u;ay+=(by-ay)*u;}else if(zb<18){const u=(18-zb)/(za-zb);bx+=(ax-bx)*u;by+=(ay-by)*u;}
 const quad=width=>[projectPoint(ax+nx*width,ay+ny*width,camera,w,h),projectPoint(bx+nx*width,by+ny*width,camera,w,h),projectPoint(bx-nx*width,by-ny*width,camera,w,h),projectPoint(ax-nx*width,ay-ny*width,camera,w,h)];
 const road=quad(map.roadWidth/2);if(road.some(p=>!p))continue;quads.push({z:road.reduce((n,p)=>n+p.z,0)/4,road,edge:quad(map.roadWidth/2+7),paint:quad(1.5),stripe:(i*count+j)%4<2});}}
 quads.sort((a,b)=>b.z-a.z);for(const q of quads){if(q.edge.every(Boolean))polygon(c,q.edge,q.stripe?'#faf1d9':'#e47770');polygon(c,q.road,map.theme==='ice'?'#79bad2':map.theme==='space'?'#343553':'#49525c');if(q.stripe)polygon(c,q.paint,'#e9ead799');}
 const objects=[];for(const o of map.obstacles)objects.push({...o,kind:'obstacle'});for(const p of s.players)if(p.id!==mine.id&&!p.deadUntil)objects.push({...p,kind:'racer'});for(const p of s.pickups)if(s.time>=p.readyAt)objects.push({...p,kind:'pickup'});for(const p of s.shots)objects.push({...p,kind:'shot'});for(const p of s.peels)objects.push({...p,kind:'peel'});
 const gate=pointAt(map,mine.next);objects.push({x:gate[0],y:gate[1],kind:'gate'});
 for(const o of objects.map(o=>({...o,screen:projectPoint(o.x,o.y,camera,w,h)})).filter(o=>o.screen&&o.screen.z>110).sort((a,b)=>b.screen.z-a.screen.z)){
 const p=o.screen;if(p.x< -100||p.x>w+100)continue;c.save();c.translate(p.x,p.y);c.scale(p.scale,p.scale);
 if(o.kind==='racer'){rearVehicle(c,o,0,0,vehicles[o.vehicle].width*1.5,s.time);c.fillStyle='#fff';c.textAlign='center';c.font='bold 12px sans-serif';c.fillText(o.name,0,-55);}
 else if(o.kind==='gate'){c.strokeStyle='#bcff7688';c.lineWidth=3;c.beginPath();c.moveTo(-map.roadWidth/2,0);c.lineTo(-map.roadWidth/2,-55);c.lineTo(map.roadWidth/2,-55);c.lineTo(map.roadWidth/2,0);c.stroke();}
 else if(o.kind==='pickup'){box(c,-13,-30,26,26,o.type==='repair'?'#75eaba':o.type==='boost'?'#b4f560':'#ff91bb');c.fillStyle='#243344';c.font='bold 19px sans-serif';c.textAlign='center';c.fillText(o.type==='repair'?'+':o.type==='boost'?'»':'?',0,-10);}
 else if(o.kind==='shot'||o.kind==='peel'){box(c,-8,-8,16,8,o.kind==='shot'?'#ffedac':'#ffdc55');}
 else{const r=o.r;c.fillStyle=o.type==='ice'?'#b8f6ff':o.type==='lava'?'#cd6344':o.type==='cone'?'#ff9856':o.type==='barrel'?'#b7567f':'#3e4655';polygon(c,[{x:-r,y:0},{x:-r*.8,y:-r*1.1},{x:0,y:-r*1.8},{x:r*.8,y:-r*1.1},{x:r,y:0}],c.fillStyle);box(c,-r*.6,-r*.8,r*1.2,5,'#ffffff55');}c.restore();}
 const size=Math.min(w*.18,h*.15),egoY=h*.81;c.save();if(mine.deadUntil){c.fillStyle='#ffae58';c.textAlign='center';c.font=`bold ${size*.35}px sans-serif`;c.fillText('KABONK!',w/2,egoY-30);}else{if(s.time<mine.invulnerableUntil)c.globalAlpha=.7;rearVehicle(c,mine,w/2,egoY,size,s.time);}c.restore();
 const target=pointAt(map,mine.next),turn=Math.atan2(Math.sin(Math.atan2(target[1]-mine.y,target[0]-mine.x)-mine.angle),Math.cos(Math.atan2(target[1]-mine.y,target[0]-mine.x)-mine.angle));c.fillStyle='#eff9e9';c.textAlign='center';c.font=`bold ${Math.max(14,w*.025)}px sans-serif`;c.fillText(Math.abs(turn)<.35?'↑ FOLLOW THE TRACK':turn>0?'TURN RIGHT →':'← TURN LEFT',w/2,h*.16);
 for(const e of s.events){const age=s.time-e.time;if(e.type==='explode'&&age<.8){const p=projectPoint(e.x,e.y,camera,w,h);if(p){c.fillStyle='#ffb451';for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.arc(p.x+Math.cos(a)*age*140*p.scale,p.y-30*p.scale+Math.sin(a)*age*80*p.scale,Math.max(2,(1-age)*8*p.scale),0,Math.PI*2);c.fill();}}}else if(e.type==='pulse'&&age<.45){const p=projectPoint(e.x,e.y,camera,w,h);if(p){c.strokeStyle=e.color;c.lineWidth=4;c.beginPath();c.ellipse(p.x,p.y,145*age/.45*p.scale,35*age/.45*p.scale,0,0,Math.PI*2);c.stroke();}}}
}
