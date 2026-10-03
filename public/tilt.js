// Phone sensors only produce the same -1..1 steering value as the joystick.
export function screenTilt(beta,gamma,angle=0){const a=angle*Math.PI/180;return gamma*Math.cos(a)+beta*Math.sin(a);}
export function tiltAxis(value,neutral,full=25){const delta=((value-neutral+540)%360)-180,amount=Math.max(0,Math.abs(delta)-3);return Math.sign(delta)*Math.min(1,amount/(full-3));}
export function mountTilt(win,onStatus=()=>{},now=()=>Date.now()){
 let enabled=false,neutral=null,latest=null,last=0,filtered=0,timer;
 const angle=()=>win.screen?.orientation?.angle??win.orientation??0;
 const report=message=>onStatus(message);
 const reset=()=>{neutral=null;latest=null;last=0;filtered=0;};
 const receive=e=>{if(!Number.isFinite(e.beta)||!Number.isFinite(e.gamma))return;latest=screenTilt(e.beta,e.gamma,angle());last=now();if(neutral===null){neutral=latest;report('Tilt ready. Hold your phone comfortably; tilt left or right.');}clearTimeout(timer);};
 win.addEventListener('orientationchange',reset);win.screen?.orientation?.addEventListener('change',reset);
 win.addEventListener('blur',reset);win.document?.addEventListener('visibilitychange',()=>{if(win.document.hidden)reset();});
 return {async enable(){if(enabled){reset();report('Hold still while the sensor calibrates.');return true;}if(!win.DeviceOrientationEvent||win.isSecureContext===false){report('Tilt unavailable. Use the steering circle on this device.');return false;}try{if(typeof win.DeviceOrientationEvent.requestPermission==='function'&&await win.DeviceOrientationEvent.requestPermission()!=='granted'){report('Motion permission denied. The steering circle still works.');return false;}enabled=true;reset();win.addEventListener('deviceorientation',receive);report('Waiting for motion. Hold your phone in your driving position.');timer=setTimeout(()=>report('No motion received yet. Use the circle or check browser motion access.'),4000);return true;}catch{report('Motion access failed. Use the steering circle.');return false;}},calibrate(){if(latest===null||now()-last>1000){report('Enable tilt and wait for a sensor reading first.');return false;}neutral=latest;filtered=0;report('Calibrated. This position is straight ahead.');return true;},steer(full){if(!enabled||neutral===null||now()-last>1000){filtered=0;return 0;}const target=tiltAxis(latest,neutral,full);filtered+=.3*(target-filtered);return filtered;},get ready(){return enabled&&neutral!==null&&now()-last<=1000;}};
}
