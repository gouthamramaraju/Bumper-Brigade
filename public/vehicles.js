// Different handling, silhouettes and durability; no vehicle needs an art download.
export const vehicles={
  car:{id:'car',name:'Pocket Rocket',kind:'CAR',tag:'THE ALL-ROUNDER',description:'Quick, grippy and ready for trouble.',maxSpeed:330,acceleration:230,turn:2.8,grip:7,hp:100,mass:1,radius:19,length:44,width:26,color:'#a4ff58',bars:[4,4,3]},
  bike:{id:'bike',name:'Tiny Terror',kind:'BIKE',tag:'SMALL & SLIPPERY',description:'Fast turns. Fragile ego. Fragile everything.',maxSpeed:365,acceleration:260,turn:3.5,grip:8,hp:72,mass:.65,radius:15,length:38,width:15,color:'#ff7db6',bars:[5,5,2]},
  bus:{id:'bus',name:'School of Bonk',kind:'BUS',tag:'BIG BONK ENERGY',description:'Slow to turn. Difficult to argue with.',maxSpeed:275,acceleration:180,turn:2,grip:7,hp:145,mass:1.7,radius:26,length:66,width:31,color:'#ffcc5c',bars:[3,2,5]},
  ship:{id:'ship',name:'Space Oddity',kind:'SPACESHIP',tag:'WHEELS OPTIONAL',description:'Floaty handling and a very questionable pilot.',maxSpeed:355,acceleration:235,turn:2.7,grip:4.5,hp:90,mass:.85,radius:20,length:44,width:35,color:'#ad9aff',bars:[5,3,3]}
};
export const playerColors=['#a4ff58','#ff7db6','#ffcc5c','#ad9aff','#62e3ff','#ff875c','#f3f3e7','#67dab4','#fa626d','#87b4ff'];
export const weaponNames={rocket:'BOING ROCKET',banana:'BANANA PEEL',pulse:'BONK PULSE'};
