import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,loadSettings,actionForKey,validDuration} from '../public/settings.js';
import {projectPoint} from '../public/chase.js';
test('Preferences recover from bad storage and clamp camera values',()=>{assert.deepEqual(loadSettings({getItem:()=>'{'}),defaults);const p=loadSettings({getItem:()=>JSON.stringify({height:999,distance:-1,duration:45})});assert.equal(p.height,130);assert.equal(p.distance,90);assert.equal(p.duration,45);});
test('Custom bindings take priority and duplicate stored bindings are rejected',()=>{const p={...defaults,keys:{...defaults.keys,fire:'f'}};assert.equal(actionForKey('F',p),'fire');assert.equal(actionForKey('ArrowLeft',p),'left');assert.equal(actionForKey(' ',p),undefined);assert.deepEqual(loadSettings({getItem:()=>JSON.stringify({...p,keys:{...p.keys,fire:'w'}})}).keys,defaults.keys);});
test('Time limit bounds and perspective near-plane work',()=>{for(const n of [30,120,1800])assert.ok(validDuration(n));for(const n of [0,29,1801,30.5,'120',NaN])assert.ok(!validDuration(n));const camera={x:0,y:0,angle:0,height:82};assert.equal(projectPoint(-50,0,camera,800,600),null);const near=projectPoint(100,20,camera,800,600),far=projectPoint(800,20,camera,800,600);assert.ok(near.y>far.y);assert.ok(near.scale>far.scale);});
