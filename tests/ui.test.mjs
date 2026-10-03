// DOM checks exercise the real app handlers. Canvas calls are checked, not visually rendered.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Window} from 'happy-dom';
import {WebSocket as RealWebSocket} from 'ws';
import {createArcadeServer} from '../server.mjs';
async function until(check,timeout=6000){const started=Date.now();while(!check()){if(Date.now()-started>timeout)throw new Error('UI condition timed out');await new Promise(r=>setTimeout(r,25));}}
test('Real UI handlers: solo rounds, touch/keyboard, results, rooms and replay',async()=>{
  const app=createArcadeServer();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${app.server.address().port}`;
  const win=new Window({url});win.document.write(await readFile(new URL('../public/index.html',import.meta.url),'utf8'));
  const doc=win.document,$=id=>doc.getElementById(id);let pendingFrames=[];let now=performance.now();const intervals=[],timeouts=[];let drawingCalls=0;
  const context=new Proxy({},{get:(target,key)=>key in target?target[key]:(...args)=>{drawingCalls++;},set:(target,key,value)=>{target[key]=value;return true;}});
  win.HTMLCanvasElement.prototype.getContext=()=>context;win.HTMLElement.prototype.setPointerCapture=()=>{};context.createRadialGradient=()=>({addColorStop(){}});context.createLinearGradient=()=>({addColorStop(){}});context.measureText=text=>({width:String(text).length*7});
  Object.defineProperty(doc,'hidden',{get:()=>false});
  const originals={};const inject=(k,v)=>{originals[k]=Object.getOwnPropertyDescriptor(globalThis,k);Object.defineProperty(globalThis,k,{value:v,writable:true,configurable:true});};
  class BrowserSocket extends RealWebSocket{constructor(address){super(address,{origin:url});}}
  for(const [k,v] of Object.entries({window:win,document:doc,navigator:win.navigator,location:win.location,localStorage:win.localStorage,devicePixelRatio:1,WebSocket:BrowserSocket,Event:win.Event,requestAnimationFrame:fn=>{pendingFrames.push(fn);return 1;}}))inject(k,v);
  const originalSetInterval=globalThis.setInterval;inject('setInterval',(...args)=>{const timer=originalSetInterval(...args);intervals.push(timer);return timer;});
  const originalSetTimeout=globalThis.setTimeout;inject('setTimeout',(...args)=>{const timer=originalSetTimeout(...args);timeouts.push(timer);return timer;});
  win.scrollTo=()=>{};
  const frame=()=>{now+=50;const callbacks=pendingFrames;pendingFrames=[];for(const callback of callbacks)callback(now);};
  try{
    await import('../public/app.js?ui-test');
    for(const vehicle of ['car','bike','bus','ship']){doc.querySelector(`[data-vehicle="${vehicle}"]`).click();assert.equal(doc.querySelector(`[data-vehicle="${vehicle}"]`).getAttribute('aria-pressed'),'true');}
    for(const id of ['ice','beach','volcano']){doc.querySelector(`[data-map="${id}"]`).click();assert.equal(doc.querySelector(`[data-map="${id}"]`).getAttribute('aria-pressed'),'true');assert.ok([...$('lobbyMap').options].some(o=>o.value===id));}
    doc.querySelector('[data-map="ice"]').click();$('solo').click();assert.equal($('race').hidden,false);frame();assert.equal($('raceOverlay').hidden,false);
    await new Promise(r=>setTimeout(r,3100));frame();assert.equal($('raceOverlay').hidden,true);
    win.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));for(let i=0;i<20;i++)frame();win.dispatchEvent(new win.KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true}));
    const button=doc.querySelector('[data-control="fire"]');button.dispatchEvent(new win.PointerEvent('pointerdown',{pointerId:1,bubbles:true}));frame();assert.ok(button.classList.contains('pressed'));button.dispatchEvent(new win.PointerEvent('pointerup',{pointerId:1,bubbles:true}));assert.ok(!button.classList.contains('pressed'));
    $('pause').click();frame();assert.equal($('overlayNumber').textContent,'PAUSED');$('resume').click();frame();assert.equal($('raceOverlay').hidden,true);
    $('raceAuto').click();assert.equal($('autoDrive').checked,false);$('raceAuto').click();
    for(let i=0;i<2500;i++)frame();assert.equal($('results').hidden,false);assert.match($('resultSummary').textContent,/points/);$('resultGarage').click();assert.equal($('garage').hidden,false);assert.ok(drawingCalls>1000);
    $('nickname').value='<img src=x>';$('create').click();await until(()=>!$('lobby').hidden);const code=$('roomCode').textContent;assert.match(code,/^[0-9A-F]{6}$/);assert.equal($('players').querySelector('img'),null);assert.match($('players').textContent,/<img src=x>/);
    $('lobbyVehicle').value='bus';$('lobbyVehicle').dispatchEvent(new win.Event('change'));await until(()=>app.rooms.get(code)?.members.values().next().value.vehicle==='bus');
    $('start').click();await until(()=>app.rooms.get(code)?.status==='playing');await until(()=>!$('race').hidden);await until(()=>{frame();return $('raceOverlay').hidden;});
    app.rooms.get(code).match.time=119.98;await until(()=>!$('results').hidden);$('again').click();assert.equal($('lobby').hidden,false);$('leaveLobby').click();await until(()=>app.rooms.size===0);
  }finally{
    for(const timer of intervals)clearInterval(timer);await app.close();await win.happyDOM.abort();for(const timer of timeouts)clearTimeout(timer);
    for(const [k,descriptor] of Object.entries(originals)){if(descriptor)Object.defineProperty(globalThis,k,descriptor);else delete globalThis[k];}
  }
});
