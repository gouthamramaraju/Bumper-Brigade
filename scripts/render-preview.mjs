// Real game drawings rendered outside a browser; these are not store screenshots.
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {createMatch,step,explode} from '../public/physics.js';
import {Renderer,drawVehicle} from '../public/render.js';
import {vehicles} from '../public/vehicles.js';
GlobalFonts.loadSystemFonts();
await mkdir(new URL('../docs/previews/',import.meta.url),{recursive:true});
const create=(w,h)=>createCanvas(w||1600,h||1100);
for(const map of ['city','canyon','space','ice','beach','volcano']){
 const s=createMatch(map,['car','bike','bus','ship'].map((vehicle,i)=>({id:String(i),name:vehicles[vehicle].name,vehicle,bot:true})),42);
 for(let i=0;i<480;i++)step(s,1/60);
 const canvas=createCanvas(1400,950),r=new Renderer(canvas,{createCanvas:create});r.draw(s,'0',{overview:true});await writeFile(new URL(`../docs/previews/${map}.png`,import.meta.url),canvas.toBuffer('image/png'));
 const action=createCanvas(1280,800),follow=new Renderer(action,{createCanvas:create});follow.draw(s,'0');await writeFile(new URL(`../docs/previews/${map}-follow.png`,import.meta.url),action.toBuffer('image/png'));
}
const garage=createCanvas(1200,540),c=garage.getContext('2d');c.fillStyle='#f4f0e4';c.fillRect(0,0,1200,540);c.fillStyle='#6752d6';c.font='bold 42px sans-serif';c.fillText('CHOOSE YOUR CHAOS.',42,65);c.fillStyle='#77766f';c.font='16px sans-serif';c.fillText('Four original vehicles. One very questionable racing league.',42,96);
Object.values(vehicles).forEach((v,i)=>{const x=42+i*282;c.fillStyle=i===0?'#e8e3f7':'#eae7dd';c.beginPath();c.roundRect(x,135,258,350,14);c.fill();c.fillStyle='#77766f';c.font='bold 12px sans-serif';c.fillText(v.tag,x+18,165);drawVehicle(c,{vehicle:v.id,x:x+130,y:265,angle:-.18,color:v.color},{scale:3.6,preview:true});c.fillStyle='#232332';c.font='bold 23px sans-serif';c.fillText(v.name,x+18,365);c.fillStyle='#6752d6';c.font='bold 12px sans-serif';c.fillText(v.kind,x+18,393);c.fillStyle='#77766f';c.font='12px sans-serif';c.fillText(`Top pace ${v.maxSpeed} · Armour ${v.hp}`,x+18,433);});await writeFile(new URL('../docs/previews/vehicles.png',import.meta.url),garage.toBuffer('image/png'));
const s=createMatch('city',[{id:'0',name:'You',vehicle:'car'},{id:'1',name:'Bonk bus',vehicle:'bus'}]);s.players[0].score=80;explode(s,s.players[0],'1');const boom=createCanvas(1280,800),r=new Renderer(boom,{createCanvas:create});r.draw(s,'0');for(let i=0;i<15;i++){step(s,1/60);r.draw(s,'0',{dt:1/60});}await writeFile(new URL('../docs/previews/explosion.png',import.meta.url),boom.toBuffer('image/png'));
console.log('Rendered six maps, follow-camera views, vehicle artwork and explosion.');
