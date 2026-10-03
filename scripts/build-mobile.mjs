// Prepare one iOS/Android app containing all four vehicles and three maps.
import {mkdir,cp,writeFile,readFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),target=path.join(root,'mobile');
const appId=process.env.APP_ID||'org.example.bumperbrigade',serverUrl=process.env.ARCADE_SERVER_URL||'';
if(!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(appId))throw new Error('APP_ID must look like com.yourname.bumperbrigade.');
if(serverUrl){const u=new URL(serverUrl);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Use an HTTPS server URL without credentials.');}
await mkdir(target,{recursive:true});
try{const old=JSON.parse(await readFile(path.join(target,'capacitor.config.json'),'utf8'));if(old.appId!==appId)throw new Error('Choose your final app ID before generating native folders. Back up native changes before recreating mobile/.');}catch(e){if(e.code!=='ENOENT')throw e;}
await cp(path.join(root,'public'),path.join(target,'www'),{recursive:true});
await writeFile(path.join(target,'www','config.js'),`export const config=${JSON.stringify({serverUrl})};\n`);
await writeFile(path.join(target,'capacitor.config.json'),JSON.stringify({appId,appName:'Bumper Brigade',webDir:'www',server:{androidScheme:'https'}},null,2)+'\n');
await writeFile(path.join(target,'package.json'),JSON.stringify({name:'bumper-brigade-native',version:'0.3.1',type:'module',private:true,dependencies:{'@capacitor/core':'8.5.2','@capacitor/android':'8.5.2','@capacitor/ios':'8.5.2'}},null,2)+'\n');
if(process.argv.includes('--native')){const cli=path.join(root,'node_modules','@capacitor','cli','bin','capacitor');for(const platform of ['android','ios']){let exists=true;try{await access(path.join(target,platform));}catch{exists=false;}const r=spawnSync(process.execPath,[cli,exists?'sync':'add',platform],{cwd:target,stdio:'inherit'});if(r.status!==0)throw new Error(`Native ${platform} generation failed.`);}}
console.log('Bumper Brigade mobile source prepared.');if(!serverUrl)console.log('Solo works locally. Public rooms need a deployed HTTPS server URL.');
