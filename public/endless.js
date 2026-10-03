// Endless route is a deterministic, gently curving highway shared by all racers.
export const segmentLength=320;
export function roadCenter(x){return 550+Math.sin(x/1800)*210+Math.sin(x/4300)*160;}
export function roadAngle(x){return Math.atan(Math.cos(x/1800)*210/1800+Math.cos(x/4300)*160/4300);}
export function endlessObstacles(x){const out=[],first=Math.max(2,Math.floor((x-500)/segmentLength)),last=Math.floor((x+1200)/segmentLength);for(let i=first;i<=last;i++){if(i%3===0)continue;const px=i*segmentLength+150;out.push({x:px,y:roadCenter(px)+(i%3-1)*54,r:19+(i%2)*4,type:i%2?'barrel':'cone'});}return out;}
export function endlessPickups(x){const out=[];for(let i=Math.max(1,Math.floor((x-600)/640));i<=Math.floor((x+1400)/640);i++){const px=i*640;out.push({id:i,x:px,y:roadCenter(px)+(i%2?42:-42),type:i%3===0?'repair':i%3===1?'boost':'weapon',readyAt:0});}return out;}
