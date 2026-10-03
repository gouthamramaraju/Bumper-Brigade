// One thumb steers and controls the pedals. Pointer capture keeps drags reliable.
export function joystickAxes(dx,dy,radius){
 const distance=Math.hypot(dx,dy),scale=distance>radius?radius/distance:1;
 const x=dx*scale/radius,y=dy*scale/radius;
 const axis=v=>Math.abs(v)<.12?0:Math.sign(v)*(Math.abs(v)-.12)/.88;
 return {x:dx*scale,y:dy*scale,steer:axis(x),throttle:-axis(y)};
}
export function mountJoystick(element,knob){
 const state={active:false,steer:0,throttle:0};let pointer=null;
 const reset=()=>{pointer=null;state.active=false;state.steer=state.throttle=0;knob.style.transform='translate(0px, 0px)';element.classList.remove('pressed');};
 const move=e=>{if(e.pointerId!==pointer)return;e.preventDefault();const r=element.getBoundingClientRect(),a=joystickAxes(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,r.width*.34);state.steer=a.steer;state.throttle=a.throttle;knob.style.transform=`translate(${a.x}px, ${a.y}px)`;};
 element.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();pointer=e.pointerId;state.active=true;element.setPointerCapture(pointer);element.classList.add('pressed');move(e);});
 element.addEventListener('pointermove',move);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(event,e=>{if(e.pointerId===pointer)reset();});
 return {state,reset};
}
