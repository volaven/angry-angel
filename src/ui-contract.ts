export type ScreenId = 'entry'|'home'|'subjects'|'mocks'|'play'|'result'|'wrong'|'settings'|'wardrobe'|'history'|'sources'|'inspect'|'pause';
type Contract={family:'entry'|'selection'|'lesson'|'result'|'dialogue'|'dedicated';title:string;back:ScreenId;layout:string;actions:readonly string[]};
export const SCREENS:Record<ScreenId,Contract>={
 entry:{family:'entry',title:'',back:'entry',layout:'title-art',actions:['settings']},
 home:{family:'selection',title:'학습 메뉴',back:'entry',layout:'cards-4',actions:['settings']},
 subjects:{family:'selection',title:'과목 학습',back:'home',layout:'cards-4',actions:['settings']},
 mocks:{family:'selection',title:'실전 모의고사',back:'home',layout:'cards-2',actions:['settings']},
 play:{family:'lesson',title:'문제 풀이',back:'home',layout:'exam-70-30',actions:['pause']},
 result:{family:'result',title:'학습 결과',back:'home',layout:'document',actions:['settings']},
 wrong:{family:'dedicated',title:'폐기물 보관소',back:'home',layout:'list',actions:['settings']},
 settings:{family:'dedicated',title:'설정',back:'home',layout:'document',actions:[]},
 wardrobe:{family:'selection',title:'시연의 기록실',back:'home',layout:'cards-3',actions:['settings']},
 history:{family:'dedicated',title:'학습 기록',back:'home',layout:'document',actions:['settings']},
 sources:{family:'dedicated',title:'원문 검수 현황',back:'home',layout:'document',actions:['settings']},
 inspect:{family:'dedicated',title:'해설 다시 보기',back:'result',layout:'document',actions:['settings']},
 pause:{family:'dialogue',title:'잠시 쉬어가기',back:'play',layout:'pause',actions:['settings']},
};
export const isLandscapePhone=(width:number,height:number)=>width>height&&height<=600&&width<=1200;
// All in-app content uses fixed viewport pages; external source PDFs are exempt.
export const CONTENT_CONTRACT={scroll:false,lessonTabs:['passage','answers','explanation','source'],orientation:'landscape',portraitBehavior:'rotation-guide',bodyFont:24,minimumBodyFont:20,phoneTouch:64,desktopTouch:80,externalDocumentScrolling:true} as const;
export const escapeHTML=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
// Markup/attributes are internal templates. All content interpolations must be escaped first.
export function renderButton(markup:string,action:string,classes='',attrs=''){
 const role=classes.includes('primary')?'primary':classes.includes('icon')?'icon':'secondary';
 const state=attrs.includes('disabled')?'disabled':attrs.includes('aria-pressed="true"')?'selected':'default';
 return `<button type="button" class="${classes}" data-action="${escapeHTML(action)}" data-role="${role}" data-state="${state}" ${attrs}>${markup}</button>`;
}
