// The server accepts controls, runs the rules, and sends one shared state to everyone.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomBytes,randomUUID} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';
import {createMatch,setInput,step,maps,vehicles} from './public/physics.js';
const publicRoot=fileURLToPath(new URL('./public/',import.meta.url));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const allowedFiles=new Set(['index.html','style.css','app.js','physics.js','maps.js','vehicles.js','render.js','audio.js','icon.svg','manifest.json','sw.js','config.js']);
export function createArcadeServer({maxRooms=100,maxConnections=1000,allowedOrigins=[]}={}){
  const rooms=new Map(),clients=new Set(),byIp=new Map();
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405);res.end();return;}
    let url;try{url=new URL(req.url,'http://localhost');}catch{res.writeHead(400);res.end();return;}
    if(url.pathname==='/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,rooms:rooms.size,players:clients.size}));return;}
    let file;try{file=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);res.end();return;}
    if(!allowedFiles.has(file)){res.writeHead(404);res.end('Not found');return;}
    try{const body=await readFile(path.join(publicRoot,file));res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?undefined:body);}catch{res.writeHead(404);res.end('Not found');}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:1024,perMessageDeflate:false});
  server.on('upgrade',(req,socket,head)=>{
    const ip=req.socket.remoteAddress;
    let originOK=false;
    try{const o=new URL(req.headers.origin);originOK=(['http:','https:'].includes(o.protocol) && o.host===req.headers.host) || allowedOrigins.includes(req.headers.origin);}catch{}
    if(req.url!=='/ws' || !originOK || clients.size>=maxConnections || (byIp.get(ip)||0)>=30){socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;}
    wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
  });
  const send=(c,data)=>{if(c.ws.readyState===WebSocket.OPEN){if(c.ws.bufferedAmount>256000){c.ws.close(1008,'Connection too slow');return;}c.ws.send(JSON.stringify(data));}};
  const error=(c,message)=>send(c,{type:'error',message});
  const view=r=>({type:'room',code:r.code,mapId:r.mapId,host:r.host,status:r.status,startsAt:r.startsAt||null,players:[...r.members.values()].map(c=>({id:c.id,name:c.name,vehicle:c.vehicle})),match:r.match});
  const broadcast=r=>{const data=view(r);for(const c of r.members.values())send(c,data);};
  function leave(c){
    const r=rooms.get(c.room);c.room=null;if(!r)return;r.members.delete(c.id);
    if(!r.members.size){rooms.delete(r.code);return;}
    if(r.host===c.id)r.host=r.members.keys().next().value;
    if(r.match)r.match.players=r.match.players.filter(p=>p.id!==c.id);
    broadcast(r);
  }
  wss.on('connection',(ws,req)=>{
    const ip=req.socket.remoteAddress;byIp.set(ip,(byIp.get(ip)||0)+1);
    const c={ws,id:randomUUID().slice(0,12),name:'Player',room:null,ip,alive:true,messages:0,bucket:Date.now(),lastInput:0};clients.add(c);
    send(c,{type:'welcome',id:c.id});
    ws.on('pong',()=>{c.alive=true;});
    ws.on('message',raw=>{
      const now=Date.now();if(now-c.bucket>1000){c.bucket=now;c.messages=0;}if(++c.messages>80){ws.close(1008,'Too many messages');return;}
      let m;try{m=JSON.parse(raw.toString());}catch{error(c,'Invalid message.');return;}if(!m || typeof m!=='object'){error(c,'Invalid message.');return;}
      const r=rooms.get(c.room);
      if(m.type==='leave'){leave(c);send(c,{type:'left'});return;}
      if(m.type==='create' || m.type==='join'){
        if(c.room){error(c,'Leave your current room first.');return;}
        c.vehicle=vehicles[m.vehicle]?m.vehicle:'car';
        c.name=typeof m.name==='string'?m.name.trim().replace(/[\u0000-\u001f\u007f]/g,'').slice(0,16)||'Player':'Player';
        let target;
        if(m.type==='create'){
          if(!maps[m.mapId]){error(c,'Choose a valid map.');return;}
          if(rooms.size>=maxRooms){error(c,'Server is full. Try later.');return;}
          let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));
          target={code,mapId:m.mapId,host:c.id,members:new Map(),status:'lobby',match:null,changed:now};rooms.set(code,target);
        }else{
          target=rooms.get(typeof m.code==='string'?m.code.trim().toUpperCase():'');
          if(!target){error(c,'Room not found. Check the six-character code.');return;}
          if(target.status==='playing'||target.status==='countdown'){error(c,'Round in progress. Join when it finishes.');return;}
          if(target.members.size>=10){error(c,'Room is full (10 players).');return;}
          // Reopen finished rooms as a lobby when someone joins.
          if(target.status==='finished'){target.status='lobby';target.match=null;}
        }
        c.room=target.code;target.members.set(c.id,c);target.changed=now;broadcast(target);return;
      }
      if(!r){error(c,'Create or join a room first.');return;}r.changed=now;
      if(m.type==='input'){
        if(r.status==='playing'){setInput(r.match,c.id,m);c.lastInput=now;}return;
      }
      if(m.type==='start'){
        if(r.host!==c.id){error(c,'Only the host can start the round.');return;}
        if(r.status==='playing'||r.status==='countdown'){error(c,'A round is already running.');return;}
        r.match=null;r.status='countdown';r.startsAt=now+3000;broadcast(r);return;
      }
      if(m.type==='vehicle'){
        if(!vehicles[m.vehicle]){error(c,'Unknown vehicle.');return;}
        if(r.status==='playing'||r.status==='countdown'){error(c,'Choose your vehicle between races.');return;}
        c.vehicle=m.vehicle;broadcast(r);return;
      }
      if(m.type==='map'){
        if(r.host!==c.id){error(c,'Only the host can change maps.');return;}
        if(!maps[m.mapId]){error(c,'Unknown map.');return;}
        if(r.status==='playing'||r.status==='countdown'){error(c,'Wait for the round to finish.');return;}
        r.mapId=m.mapId;r.match=null;r.status='lobby';broadcast(r);return;
      }
      error(c,'Unknown action.');
    });
    ws.on('error',()=>{});
    ws.on('close',()=>{leave(c);clients.delete(c);const n=(byIp.get(ip)||1)-1;if(n)byIp.set(ip,n);else byIp.delete(ip);});
  });
  let tick=0;
  const timer=setInterval(()=>{
    const now=Date.now();tick++;
    for(const r of rooms.values()){
      if(r.status==='countdown' && now>=r.startsAt){r.match=createMatch(r.mapId,[...r.members.values()].map(c=>({id:c.id,name:c.name,vehicle:c.vehicle})),randomBytes(4).readUInt32LE());r.status='playing';broadcast(r);}
      if(r.status==='playing'){
        for(const c of r.members.values())if(now-c.lastInput>400)setInput(r.match,c.id,{steer:0,throttle:0});
        step(r.match,1/30);if(r.match.status==='finished')r.status='finished';if(tick%2===0 || r.status==='finished')broadcast(r);
      }else if(now-r.changed>15*60*1000){for(const c of [...r.members.values()]){send(c,{type:'expired'});leave(c);}}
    }
  },1000/30);
  const heartbeat=setInterval(()=>{for(const c of clients){if(!c.alive)c.ws.terminate();else{c.alive=false;c.ws.ping();}}},15000);
  async function close(){clearInterval(timer);clearInterval(heartbeat);for(const c of clients)c.ws.terminate();await new Promise(resolve=>wss.close(resolve));await new Promise(resolve=>server.close(resolve));}
  return {server,rooms,close};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||8080);const app=createArcadeServer({allowedOrigins:(process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean)});
  app.server.listen(port,process.env.HOST||'0.0.0.0',()=>console.log(`Bumper Brigade running on http://localhost:${port}`));
  const stop=()=>app.close().then(()=>process.exit(0));process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
