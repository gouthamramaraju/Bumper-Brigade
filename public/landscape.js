// Shared road elevation keeps scenery, camera and vehicle meshes on the same surface.
import {roadCenter} from './endless.js';
export function roadHeight(x){return 65*Math.sin(x/1050)+32*Math.sin(x/2700+1)-32*Math.sin(1);}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function terrainHeight(x,z,width=180){const side=Math.abs(z-roadCenter(x)),blend=smooth((side-width*.58)/420),rolling=100*Math.sin(x/720+z/870)+65*Math.cos(z/430-x/1700)+Math.max(0,side-300)*.12;return roadHeight(x)+rolling*blend;}
export function roadGrade(x){return 65/1050*Math.cos(x/1050)+32/2700*Math.cos(x/2700+1);}
