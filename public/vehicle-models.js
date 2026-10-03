// Original compact 3D vehicle models. Sections shape the body rather than drawing a flat sprite.
import {vehicles} from './vehicles.js';
export function drawVehicleModel(mesh,p,time){const v=vehicles[p.vehicle],angle=p.angle,co=Math.cos(angle),si=Math.sin(angle),point=(f,y,side)=>{const x=p.x+co*f-si*side,z=p.y+si*f+co*side;return[x,y+mesh.elevation(x,z),z];},box=(f,side,y,l,h,w,color)=>{const [x,,z]=point(f,0,side);mesh.box(x,y,z,l,h,w,color,angle);},wheel=(f,side,r,w,steering=false)=>{const [x,,z]=point(f,0,side);mesh.wheel(x,z,r,w,angle+(steering?(p.input?.steer||0)*.22:0));};
 function hull(sections,bottom,color){for(let i=0;i<sections.length-1;i++){const [x,y,w]=sections[i],[X,Y,W]=sections[i+1];mesh.quad(point(x,bottom,-w),point(X,bottom,-W),point(X,Y,-W),point(x,y,-w),color);mesh.quad(point(x,y,w),point(X,Y,W),point(X,bottom,W),point(x,bottom,w),color);mesh.quad(point(x,y,-w),point(X,Y,-W),point(X,Y,W),point(x,y,w),color);}for(const [x,y,w] of [sections[0],sections.at(-1)])mesh.quad(point(x,bottom,-w),point(x,y,-w),point(x,y,w),point(x,bottom,w),color);}
 mesh.shine=.6;const paint=p.color,glass='#29465b',chrome='#bbcbd0',black='#1b2834';
 // Contact shadow and underside provide depth even when the sun is high.
 box(0,0,.7,v.length*.9,.3,v.width*1.06,'#344748');
 if(p.vehicle==='car'){
 hull([[-22,12,10],[-18,17,12],[-8,18,13],[9,18,13],[17,15,11],[22,11,9]],7,paint);
 hull([[-11,18,11],[-6,27,9],[6,27,9],[13,18,11]],17,glass);
 box(0,0,27,13,2,18,paint);box(0,0,7,34,2,26,black);
 for(const f of [-14,14])for(const side of [-13,13])wheel(f,side,7,5,f>0);
 for(const side of [-1,1]){box(7,side*14.5,19,4,2,4,paint);box(0,side*12,17,1.5,11,1.5,paint);box(-5,side*13.2,17,4,.7,.6,chrome);box(21,side*6,12,2,3,7,'#eff7e8');box(-21,side*7,12,2,3,6,'#ec5267');box(-18,side*9,10,2,2,2,chrome);}
 box(22,0,9,1,3,9,black);box(-22,0,9,1,2,15,chrome);box(-22,0,12,1,3,5,'#eee5cf');box(-17,0,17,5,.4,17,paint);
 }else if(p.vehicle==='bus'){
 hull([[-33,36,13],[-29,42,15],[27,42,15],[33,34,13]],7,paint);box(0,0,7,57,3,32,black);box(0,0,42,57,2,27,'#eceadf');
 for(const side of [-1,1]){for(const f of [-23,-13,-3,7,17]){box(f,side*15.2,25,8,12,.7,glass);box(f,side*15.6,25,8,.6,.7,chrome);}box(26,side*15.2,15,7,22,.8,glass);box(0,side*15.5,17,61,1,.6,chrome);box(29,side*18,28,3,3,4,black);for(const f of [-23,-14,23])wheel(f,side*15.5,7.5,5,f>0);}
 box(32,0,25,1,12,25,glass);box(-32,0,27,1,10,23,glass);box(33,0,12,1,3,22,chrome);for(const side of [-1,1]){box(33,side*9,16,2,3,6,'#fff6d6');box(-33,side*10,13,2,4,4,'#ec5267');}box(-33,0,37,1,3,13,'#f9d78b');
 }else if(p.vehicle==='bike'){
 wheel(-14,0,9,5);wheel(15,0,9,5,true);box(-2,0,11,21,5,8,chrome);box(0,0,15,15,7,8,black);hull([[-6,22,4],[0,27,6],[9,23,5]],18,paint);box(-11,0,22,12,3,8,black);box(13,0,12,3,15,7,chrome);box(13,0,27,3,2,17,black);box(14,0,26,3,5,7,'#fff0c7');box(-17,0,18,3,3,5,'#ed617c');box(-7,6,9,15,3,3,chrome);box(-1,0,27,8,13,8,'#24384c');box(4,0,39,8,8,9,paint);box(9,-6,28,10,2,2,'#24384c');box(9,6,28,10,2,2,'#24384c');
 }else{
 hull([[-27,13,9],[-15,20,13],[2,23,12],[16,15,7],[29,10,0]],8,paint);hull([[-9,22,8],[-3,31,6],[6,26,5],[13,17,3]],16,glass);
 for(const side of [-1,1]){mesh.quad(point(-23,11,side*12),point(-20,10,side*32),point(9,9,side*19),point(16,12,side*6),paint);mesh.quad(point(-23,8,side*12),point(-20,7,side*32),point(9,6,side*19),point(16,9,side*6),chrome);box(-22,side*10,8,17,12,11,black);box(-30,side*10,10,2,7,7,'#80e4f5');box(-17,side*27,11,4,1,4,'#f8dc86');}
 }
 if(p.input?.boost)box(-v.length*.65,0,7,12+Math.sin(time*30)*4,5,10,'#92f6ca');mesh.shine=0;
}
