// A few synthesized sounds replace downloaded sound files.
export class AudioFX{
 constructor(){this.context=null;this.enabled=false;}
 async toggle(){this.enabled=!this.enabled;if(this.enabled){try{this.context??=new (window.AudioContext||window.webkitAudioContext)();await this.context.resume();this.play('gate');}catch{this.enabled=false;}}return this.enabled;}
 play(type){if(!this.enabled||!this.context)return;const c=this.context,o=c.createOscillator(),g=c.createGain(),t=c.currentTime;
 const boom=['explode','bonk','hit'].includes(type);o.type=boom?'sawtooth':'sine';o.frequency.setValueAtTime(boom?130:type==='fire'?480:660,t);o.frequency.exponentialRampToValueAtTime(boom?30:type==='fire'?180:1000,t+.13);g.gain.setValueAtTime(boom?.035:.025,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(c.destination);o.start();o.stop(t+.17);}
}
