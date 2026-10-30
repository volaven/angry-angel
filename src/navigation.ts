import {SCREENS,type ScreenId} from './ui-contract';
export const UI_STORAGE_KEY='siyeon-exam.ui.v1';
export interface Location {screen:ScreenId;page:number;scroll:number;panelScroll:number;previewId?:string}
export interface Navigation {current:Location;stack:Location[];pages:Partial<Record<ScreenId,number>>;locations:Partial<Record<ScreenId,Location>>}
export const location=(screen:ScreenId,page=0):Location=>({screen,page,scroll:0,panelScroll:0});
export function loadNavigation(raw:string|null):Navigation {
 try {const n=JSON.parse(raw||'null');if(n&&n.current?.screen in SCREENS&&Array.isArray(n.stack))return {current:{...location(n.current.screen),...n.current},stack:n.stack.filter((x:Location)=>x.screen in SCREENS).slice(-20),pages:n.pages||{},locations:n.locations||{}};}catch{/* UI state is disposable; learning data is independent. */}
 return {current:location('entry'),stack:[],pages:{},locations:{}};
}
export function navigate(n:Navigation,to:ScreenId){if(n.current.screen===to)return;n.pages[n.current.screen]=n.current.page;n.locations[n.current.screen]={...n.current};n.stack.push({...n.current});n.stack=n.stack.slice(-20);n.current={...(n.locations[to]||location(to,n.pages[to]||0))};}
export function goBack(n:Navigation){n.pages[n.current.screen]=n.current.page;n.locations[n.current.screen]={...n.current};const fallback=SCREENS[n.current.screen].back;n.current=n.stack.pop()||{...(n.locations[fallback]||location(fallback,n.pages[fallback]||0))};}
