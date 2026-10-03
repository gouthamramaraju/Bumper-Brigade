import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {joystickAxes,mountJoystick} from '../public/joystick.js';
test('Circular control clamps diagonal drags and has a centre dead zone',()=>{
 assert.equal(joystickAxes(100,0,40).steer,1);assert.equal(joystickAxes(0,-100,40).throttle,1);assert.equal(joystickAxes(0,100,40).throttle,-1);
 const a=joystickAxes(100,100,40);assert.ok(Math.hypot(a.x,a.y)<=40.00001);assert.ok(a.steer>0&&a.throttle<0);assert.equal(joystickAxes(2,2,40).steer,0);
});
test('Captured pointer steers, ignores a second thumb and releases on cancellation',()=>{
 const win=new Window(),el=win.document.createElement('div'),knob=win.document.createElement('span');el.getBoundingClientRect=()=>({left:0,top:0,width:128,height:128});el.setPointerCapture=()=>{};
 const j=mountJoystick(el,knob),send=(type,id,x,y)=>el.dispatchEvent(new win.PointerEvent(type,{pointerId:id,clientX:x,clientY:y,cancelable:true}));
 send('pointerdown',1,108,20);assert.ok(j.state.steer>0&&j.state.throttle>0);send('pointerdown',2,20,108);assert.ok(j.state.steer>0);send('pointermove',1,20,108);assert.ok(j.state.steer<0&&j.state.throttle<0);
 send('pointercancel',2,0,0);assert.equal(j.state.active,true);send('lostpointercapture',1,0,0);assert.deepEqual(j.state,{active:false,steer:0,throttle:0});
 send('pointerdown',3,108,20);j.reset();assert.equal(j.state.active,false);assert.equal(knob.style.transform,'translate(0px, 0px)');
});
