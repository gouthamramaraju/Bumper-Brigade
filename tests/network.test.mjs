import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {createArcadeServer} from '../server.mjs';
async function launch(options){const app=createArcadeServer(options);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${app.server.address().port}`;return {app,origin};}
async function client(origin,clientOrigin=origin){
  const ws=new WebSocket(origin.replace('http','ws')+'/ws',{origin:clientOrigin});const queue=[],waiters=[];
  ws.on('message',raw=>{const m=JSON.parse(raw);const i=waiters.findIndex(w=>w.filter(m));if(i>=0){const [w]=waiters.splice(i,1);clearTimeout(w.timer);w.resolve(m);}else queue.push(m);});
  const next=(filter)=>{const i=queue.findIndex(filter);if(i>=0)return Promise.resolve(queue.splice(i,1)[0]);return new Promise((resolve,reject)=>{const w={filter,resolve,reject,timer:setTimeout(()=>{const i=waiters.indexOf(w);if(i>=0)waiters.splice(i,1);reject(new Error('Timed out waiting for server'));},6000)};waiters.push(w);});};
  const welcome=await next(m=>m.type==='welcome');
  return {ws,id:welcome.id,next,send:m=>ws.send(JSON.stringify(m)),clear:()=>queue.splice(0),close:()=>new Promise(r=>{ws.once('close',r);ws.close();})};
}
for(const mapId of ['city','canyon','space','ice','beach','volcano'])test(`${mapId}: 10 real sockets, 11th refused, host rights, stale input, finish and replay`,async()=>{
  const {app,origin}=await launch();const sockets=[];
  try{
    const host=await client(origin);sockets.push(host);host.send({type:'create',mapId,vehicle:'bus',name:'Host'});const created=await host.next(m=>m.type==='room');const code=created.code;
    for(let i=1;i<10;i++){const c=await client(origin);sockets.push(c);c.send({type:'join',code,vehicle:['car','bike','bus','ship'][i%4],name:`Guest ${i}`});const joined=await c.next(m=>m.type==='room');assert.equal(joined.players.length,i+1);}
    const extra=await client(origin);sockets.push(extra);extra.send({type:'join',code});const refused=await extra.next(m=>m.type==='error');assert.match(refused.message,/full/);
    sockets[1].send({type:'start'});assert.match((await sockets[1].next(m=>m.type==='error')).message,/host/);
    sockets.forEach(c=>c.clear());host.send({type:'start'});await host.next(m=>m.status==='countdown');
    extra.send({type:'join',code});assert.match((await extra.next(m=>m.type==='error')).message,/progress/);
    const states=await Promise.all(sockets.slice(0,10).map(c=>c.next(m=>m.status==='playing')));for(const s of states){assert.equal(s.match.players.length,10);assert.equal(s.match.mapId,mapId);}
    host.send({type:'input',steer:1,throttle:1,score:999999});await new Promise(r=>setTimeout(r,150));const internal=app.rooms.get(code);assert.equal(internal.match.players[0].input.steer,1);assert.notEqual(internal.match.players[0].score,999999);
    await new Promise(r=>setTimeout(r,500));assert.equal(internal.match.players[0].input.steer,0);
    host.send({type:'map',mapId:'canyon'});assert.match((await host.next(m=>m.type==='error')).message,/finish/);
    internal.match.time=119.98;const finished=await host.next(m=>m.status==='finished');assert.equal(finished.match.status,'finished');
    host.send({type:'start'});await host.next(m=>m.status==='countdown');assert.equal(internal.match,null);
    await host.close();sockets.splice(0,1);await new Promise(r=>setTimeout(r,60));assert.equal(internal.host,sockets[0].id);assert.equal(internal.members.size,9);
  }finally{await app.close();}
});
test('Unknown rooms, malformed messages, wrong origins and static path isolation',async()=>{
  const {app,origin}=await launch();try{
    const c=await client(origin);c.send({type:'join',code:'NOTREAL'});assert.match((await c.next(m=>m.type==='error')).message,/not found/);
    c.ws.send('{');assert.match((await c.next(m=>m.type==='error')).message,/Invalid/);
    c.send({type:'create',mapId:'bad'});assert.match((await c.next(m=>m.type==='error')).message,/valid/);
    const health=await fetch(origin+'/health');assert.equal(health.status,200);
    assert.equal((await fetch(origin+'/server.mjs')).status,404);
    assert.equal((await fetch(origin+'/index.html')).headers.get('content-type'),'text/html; charset=utf-8');
    assert.equal((await fetch(origin+'/physics.js',{method:'POST'})).status,405);
    const denied=new WebSocket(origin.replace('http','ws')+'/ws',{origin:'https://evil.example'});await new Promise(resolve=>{denied.on('unexpected-response',(_,res)=>{assert.equal(res.statusCode,403);denied.terminate();resolve();});denied.on('error',()=>{});});
  }finally{await app.close();}
});
test('Empty rooms are removed and messages larger than 1 KB disconnect',async()=>{
  const {app,origin}=await launch();try{const c=await client(origin);c.send({type:'create',mapId:'city'});await c.next(m=>m.type==='room');assert.equal(app.rooms.size,1);const closed=new Promise(r=>c.ws.once('close',r));c.ws.send('x'.repeat(2048));await closed;await new Promise(r=>setTimeout(r,30));assert.equal(app.rooms.size,0);}finally{await app.close();}
});
test('Native origins work when explicitly allowed and each player chooses their own ride',async()=>{
 const {app,origin}=await launch({allowedOrigins:['capacitor://localhost','https://localhost']});try{
 const host=await client(origin);host.send({type:'create',mapId:'city',vehicle:'bus'});const room=await host.next(m=>m.type==='room');
 const ios=await client(origin,'capacitor://localhost');ios.send({type:'join',code:room.code,vehicle:'ship'});let joined=await ios.next(m=>m.type==='room');assert.equal(joined.players[0].vehicle,'bus');assert.equal(joined.players[1].vehicle,'ship');
 ios.send({type:'vehicle',vehicle:'bike'});joined=await ios.next(m=>m.type==='room'&&m.players.find(p=>p.id===ios.id)?.vehicle==='bike');assert.equal(joined.players[0].vehicle,'bus');
 const android=await client(origin,'https://localhost');android.send({type:'join',code:room.code,vehicle:'car'});assert.equal((await android.next(m=>m.type==='room')).players.length,3);
 host.send({type:'map',mapId:'space'});assert.equal((await host.next(m=>m.type==='room'&&m.mapId==='space')).mapId,'space');
 }finally{await app.close();}
});
test('Room cap fails cleanly without destroying existing rooms',async()=>{
  const {app,origin}=await launch({maxRooms:1});try{const a=await client(origin),b=await client(origin);a.send({type:'create',mapId:'city'});await a.next(m=>m.type==='room');b.send({type:'create',mapId:'canyon'});assert.match((await b.next(m=>m.type==='error')).message,/full/);assert.equal(app.rooms.size,1);}finally{await app.close();}
});
test('Only host changes time limit; chosen duration reaches the shared match',async()=>{const {app,origin}=await launch();try{const host=await client(origin);host.send({type:'create',mapId:'city',duration:45});const room=await host.next(m=>m.type==='room');assert.equal(room.duration,45);const guest=await client(origin);guest.send({type:'join',code:room.code});await guest.next(m=>m.type==='room');guest.send({type:'duration',duration:90});assert.match((await guest.next(m=>m.type==='error')).message,/host/);host.send({type:'duration',duration:0});assert.match((await host.next(m=>m.type==='error')).message,/seconds/);host.send({type:'duration',duration:75});await host.next(m=>m.duration===75);host.send({type:'start'});await host.next(m=>m.status==='countdown');app.rooms.get(room.code).startsAt=Date.now()-1;const playing=await host.next(m=>m.status==='playing');assert.equal(playing.match.duration,75);host.send({type:'duration',duration:90});assert.match((await host.next(m=>m.type==='error')).message,/finish/);}finally{await app.close();}});

test('Host selects Endless; guests cannot change it and all racers share the mode',async()=>{const {app,origin}=await launch();try{const host=await client(origin);host.send({type:'create',mapId:'beach',mode:'endless'});const room=await host.next(m=>m.type==='room');assert.equal(room.mode,'endless');const guest=await client(origin);guest.send({type:'join',code:room.code});assert.equal((await guest.next(m=>m.type==='room')).mode,'endless');guest.send({type:'mode',mode:'circuit'});assert.match((await guest.next(m=>m.type==='error')).message,/host/);host.send({type:'mode',mode:'bad'});assert.match((await host.next(m=>m.type==='error')).message,/Unknown/);host.send({type:'start'});await host.next(m=>m.status==='countdown');app.rooms.get(room.code).startsAt=Date.now()-1;assert.equal((await guest.next(m=>m.status==='playing')).match.mode,'endless');}finally{await app.close();}});
test('Elephant and vehicle choices share the same room and preserve individual selections',async()=>{const {app,origin}=await launch();try{const host=await client(origin);host.send({type:'create',mapId:'beach',mode:'scenic',vehicle:'elephant'});const room=await host.next(m=>m.type==='room');const guest=await client(origin);guest.send({type:'join',code:room.code,vehicle:'ship'});const joined=await guest.next(m=>m.type==='room');assert.equal(joined.players[0].vehicle,'elephant');assert.equal(joined.players[1].vehicle,'ship');guest.send({type:'vehicle',vehicle:'fox'});await guest.next(m=>m.players?.some(p=>p.vehicle==='fox'));host.send({type:'start'});await host.next(m=>m.status==='countdown');app.rooms.get(room.code).startsAt=Date.now()-1;const started=await guest.next(m=>m.status==='playing');assert.ok(started.match.players.some(p=>p.vehicle==='elephant'));assert.ok(started.match.players.some(p=>p.vehicle==='fox'));}finally{await app.close();}});
