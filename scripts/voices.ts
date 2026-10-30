import {writeFileSync,mkdirSync} from 'node:fs';
import {dialogue} from '../src/dialogue';
mkdirSync('assets/audio',{recursive:true});
writeFileSync('assets/audio/script.json',JSON.stringify(Object.entries(dialogue).flatMap(([emotion,lines])=>lines.map((text,i)=>({id:`${emotion}-${i}`,emotion,text}))),null,2));
