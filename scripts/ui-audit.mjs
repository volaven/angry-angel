// Compatibility entry point for the previous seven-size audit command.
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','test:ui'],{stdio:'inherit',shell:process.platform==='win32'});process.exit(result.status??1);
