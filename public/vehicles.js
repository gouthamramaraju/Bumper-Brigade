// Different handling, silhouettes and durability; no vehicle needs an art download.
export const vehicles={
  car:{id:'car',name:'Pocket Rocket',kind:'CAR',tag:'THE ALL-ROUNDER',description:'Quick, grippy and ready for trouble.',maxSpeed:330,acceleration:230,turn:2.8,grip:7,hp:100,mass:1,radius:19,length:44,width:26,color:'#a4ff58',bars:[4,4,3]},
  bike:{id:'bike',name:'Tiny Terror',kind:'BIKE',tag:'SMALL & SLIPPERY',description:'Fast turns. Fragile ego. Fragile everything.',maxSpeed:365,acceleration:260,turn:3.5,grip:8,hp:72,mass:.65,radius:15,length:38,width:15,color:'#ff7db6',bars:[5,5,2]},
  bus:{id:'bus',name:'School of Bonk',kind:'BUS',tag:'BIG BONK ENERGY',description:'Slow to turn. Difficult to argue with.',maxSpeed:275,acceleration:180,turn:2,grip:7,hp:145,mass:1.7,radius:26,length:66,width:31,color:'#ffcc5c',bars:[3,2,5]},
  ship:{id:'ship',name:'Space Oddity',kind:'SPACESHIP',tag:'WHEELS OPTIONAL',description:'Floaty handling and a very questionable pilot.',maxSpeed:355,acceleration:235,turn:2.7,grip:4.5,hp:90,mass:.85,radius:20,length:44,width:35,color:'#ad9aff',bars:[5,3,3]},
  fox:{id:'fox',name:'Dash the Fox',kind:'FOX',animal:true,eyeHeight:32,focusHeight:23,tag:'QUICK & CURIOUS',description:'A balanced runner with a sweeping tail.',maxSpeed:330,acceleration:230,turn:2.8,grip:7,hp:100,mass:1,radius:19,length:44,width:26,color:'#e8954b',bars:[4,4,3]},
  rabbit:{id:'rabbit',name:'Bolt the Bunny',kind:'RABBIT',animal:true,eyeHeight:25,focusHeight:19,tag:'SMALL & SPRINGY',description:'Fast hops and quick turns.',maxSpeed:365,acceleration:260,turn:3.5,grip:8,hp:72,mass:.65,radius:15,length:38,width:15,color:'#ded8d0',bars:[5,5,2]},
  bear:{id:'bear',name:'Big Bear',kind:'BEAR',animal:true,eyeHeight:42,focusHeight:33,tag:'BIG HUG ENERGY',description:'A sturdy lumbering runner.',maxSpeed:275,acceleration:180,turn:2,grip:7,hp:145,mass:1.7,radius:26,length:66,width:31,color:'#8b6249',bars:[3,2,5]},
  deer:{id:'deer',name:'Willow the Deer',kind:'DEER',animal:true,eyeHeight:68,focusHeight:48,tag:'LONG LEGS. BIG LEAPS.',description:'A nimble runner with antlers.',maxSpeed:355,acceleration:235,turn:2.7,grip:4.5,hp:90,mass:.85,radius:20,length:44,width:35,color:'#c4a16c',bars:[5,3,3]},
  elephant:{id:'elephant',name:'Ellie the Elephant',kind:'ELEPHANT',animal:true,eyeHeight:58,focusHeight:40,tag:'GENTLE GIANT',description:'A sturdy walker with a swaying trunk.',maxSpeed:240,acceleration:180,turn:1.8,grip:7,hp:170,mass:2.1,radius:29,length:76,width:42,color:'#929ca2',bars:[2,3,5]}
};
export const playerColors=['#a4ff58','#ff7db6','#ffcc5c','#ad9aff','#62e3ff','#ff875c','#f3f3e7','#67dab4','#fa626d','#87b4ff'];
export const weaponNames={rocket:'BOING ROCKET',banana:'BANANA PEEL',pulse:'BONK PULSE'};
