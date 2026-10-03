import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createMatch,step,explode} from '../public/physics.js';
import {Renderer} from '../public/render.js';
test('Actual canvas draws every map and mixed vehicles in portrait and landscape, including wreck effects',()=>{
 for(const map of ['city','canyon','space','ice','beach','volcano'])for(const [w,h] of [[390,844],[1280,800]]){
  const s=createMatch(map,['car','bike','bus','ship'].map((vehicle,i)=>({id:String(i),name:vehicle,vehicle,bot:true})),17);
  for(let i=0;i<480;i++)step(s,1/60);
  const canvas=createCanvas(w,h),renderer=new Renderer(canvas,{createCanvas:(w=1600,h=1100)=>createCanvas(w,h)});
  renderer.draw(s,'0');explode(s,s.players[0],'1');
  for(let i=0;i<15;i++){step(s,1/60);renderer.draw(s,'0',{dt:1/60});}
  assert.ok(canvas.toBuffer('image/png').length>10000);
  renderer.draw(s,'0',{overview:true});assert.ok(canvas.toBuffer('image/png').length>10000);
 }
});
