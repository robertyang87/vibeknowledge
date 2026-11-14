import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../../..'),out=path.join(root,'episodes/katago-gold/renders');
const data=JSON.parse(fs.readFileSync(path.join(root,'episodes/katago-gold/copy/timeline.json')));
const serveUrl=await bundle({entryPoint:path.join(root,'tools/remotion/src/index.ts')});
const browser=await openBrowser('chrome',{browserExecutable:'/usr/bin/chromium',chromiumOptions:{gl:'swangle'}});
try{
 const composition=await selectComposition({serveUrl,id:'KataGoGold',browserExecutable:'/usr/bin/chromium',chromiumOptions:{gl:'swangle'},puppeteerInstance:browser});
 for(let i=0;i<data.scenes.length;i++){const s=data.scenes[i];if(process.env.REVIEW_SCENES&&!process.env.REVIEW_SCENES.split(',').includes(s.id))continue;const frame=Math.round((s.start+Math.min(s.duration*.6,8))*30);await renderStill({composition,serveUrl,frame,output:path.join(out,`scene-${String(i+1).padStart(2,'0')}.png`),imageFormat:'png',browserExecutable:'/usr/bin/chromium',chromiumOptions:{gl:'swangle'},puppeteerInstance:browser});console.log('Reviewed',s.id)}
 const cover=await selectComposition({serveUrl,id:'KataGoGoldCover',browserExecutable:'/usr/bin/chromium',chromiumOptions:{gl:'swangle'},puppeteerInstance:browser});await renderStill({composition:cover,serveUrl,output:path.join(out,'cover.png'),imageFormat:'png',browserExecutable:'/usr/bin/chromium',chromiumOptions:{gl:'swangle'},puppeteerInstance:browser});
}finally{await browser.close({silent:true})}
