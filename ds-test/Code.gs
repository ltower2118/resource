/** LCD Digital Signage V51 - WeatherAPI-linked animation toggle (weather page only). */
const CONFIG_PROP='LCD_CONFIG_JSON';
const KEY_PROP='LCD_ADMIN_KEY';
const POINTER_PROP='LCD_CONFIG_POINTER_V4';
const SERVER_VERSION='LCD-TEST-V55R-20261110';
const DEFAULTS={showTime:true,showDate:true,timeX:50,timeY:50,dateX:null,dateY:null,timeSize:112,timeColor:'#ffffff',timeFormat:'24s',timeFont:'Malgun Gothic',timeBold:false,dateSize:34,dateColor:'#ffffff',dateFont:'Malgun Gothic',dateBold:false,datePosition:'bottom-right',dateFormat:'long',background:'images/background.jpg',clockBackgroundMode:'image',clockBackgroundColor:'#17283b',overlay:15,messageShowTime:false,messageShowDate:false,messageTimeX:50,messageTimeY:22,messageTimeSize:112,messageTimeColor:'#ffffff',messageTimeFont:'Malgun Gothic',messageTimeBold:false,messageTimeFormat:'24s',messageTimeShadow:true,messageDateX:50,messageDateY:82,messageDateSize:34,messageDateColor:'#ffffff',messageDateFont:'Malgun Gothic',messageDateBold:false,messageDateFormat:'long',messageDateShadow:true,messageEnabled:false,messageText:'',messageHtml:'',clockSeconds:60,messageSeconds:15,messageSize:100,messageColor:'#ffdd55',messageBackground:'#101827',messageBackgroundMode:'color',messageBackgroundImage:'images/background.jpg',timeShadow:true,dateShadow:true,weatherShadow:true,clockWeatherShadow:true,messageShadow:true,maintenanceMode:false,maintenanceTitle:'안내 말씀',maintenanceText:'현재 화면을 점검하고 있습니다.\n잠시 후 정상 운영됩니다.',transitionEffect:'fade',transitionDuration:700,messageFont:'Malgun Gothic',messageAlign:'center',startScreen:'clock',messageBlocks:[],clockPageEnabled:true,weatherOnClock:false,weatherPageEnabled:false,weatherSource:'weatherapi',weatherCity:'Seoul',weatherLocationLabel:'',weatherProvince:'',weatherDistrict:'',weatherDong:'',weatherCoordinateMode:'district',weatherSeconds:20,weatherRefreshMinutes:15,weatherFields:['temp','condition','humidity'],weatherClockFields:['temp','condition','humidity'],weatherIconStyle:'outline',weatherIconColorMode:'auto',weatherIconColor:'#ffffff',weatherClockShowLocation:true,weatherClockFont:'Malgun Gothic',weatherClockBold:false,weatherClockColor:'#ffffff',weatherPageFont:'Malgun Gothic',weatherPageBold:false,weatherPageColor:'#ffffff',weatherAnimationEnabled:false,weatherBackgroundMode:'color',weatherBackgroundColor:'#122940',weatherBackgroundImage:'images/background.jpg',weatherShowLocation:true,weatherClockX:50,weatherClockY:12,weatherClockSize:40,weatherClockLayout:'horizontal',weatherPageLayout:'summary',weatherTempScale:100,weatherIconScale:100,weatherConditionScale:100,weatherExtraScale:100,weatherPageX:50,weatherPageY:48,weatherPageSize:135,weatherConditionFontSize:60,weatherExtraFontSize:45,weatherLocationFontSize:55,pageOrder:'clock,message,weather',messagePrioritySchedule:{enabled:false,start:0,end:0},version:'1'};
function setup(){const p=PropertiesService.getScriptProperties();if(!p.getProperty(CONFIG_PROP)&&!p.getProperty(POINTER_PROP))p.setProperty(CONFIG_PROP,JSON.stringify(DEFAULTS));if(!p.getProperty(KEY_PROP))p.setProperty(KEY_PROP,Utilities.getUuid()+Utilities.getUuid());Logger.log('관리자 키: '+p.getProperty(KEY_PROP));}
function readConfig_(){const p=PropertiesService.getScriptProperties();const pointer=p.getProperty(POINTER_PROP);let raw;if(pointer){const prefix='LCD_V4_'+pointer+'_';const count=Number(p.getProperty(prefix+'N'));if(!Number.isInteger(count)||count<1||count>60)throw Error('설정 블록 개수 오류');let data='';for(let i=0;i<count;i++){const part=p.getProperty(prefix+i);if(part===null)throw Error('설정 블록 누락 '+i);data+=part;}raw=JSON.parse(data);}else raw=JSON.parse(p.getProperty(CONFIG_PROP)||JSON.stringify(DEFAULTS));return normalizeConfig_(raw);}
function normalizeConfig_(raw){const original=raw&&typeof raw==='object'?raw:{};const x={...DEFAULTS,...original};if(!Object.prototype.hasOwnProperty.call(original,'weatherClockFields'))x.weatherClockFields=original.weatherFields??DEFAULTS.weatherFields;const c=validate_(x);c.version=String(x.version||'1');return c;}
function writeConfig_(c){const p=PropertiesService.getScriptProperties();const json=JSON.stringify(c);if(json.length>100000)throw Error('설정 크기가 너무 큽니다.');const chunks=[];for(let i=0;i<json.length;i+=1800)chunks.push(json.slice(i,i+1800));if(chunks.length>60)throw Error('설정 블록 제한 초과');const old=p.getProperty(POINTER_PROP),pointer='v'+Date.now()+'_'+Math.floor(Math.random()*1e6),prefix='LCD_V4_'+pointer+'_',batch={};chunks.forEach((v,i)=>batch[prefix+i]=v);batch[prefix+'N']=String(chunks.length);p.setProperties(batch,false);p.setProperty(POINTER_PROP,pointer);if(old){const oldPrefix='LCD_V4_'+old+'_';const count=Number(p.getProperty(oldPrefix+'N'))||0;for(let i=0;i<Math.min(count,60);i++)p.deleteProperty(oldPrefix+i);p.deleteProperty(oldPrefix+'N');}}
function doGet(e){const q=e&&e.parameter||{};try{if(q.action==='templateList')return response_({ok:true,templates:templateList_()},q.callback);if(q.action==='templateGet')return response_(templateRead_(String(q.id||'')),q.callback);if(q.action==='health')return response_({ok:true,version:SERVER_VERSION,features:['messageBlocks','clockPosition','transitionEffect','transitionDuration','clockBackgroundMode','clockBackgroundColor','weatherSource','weatherPage','weatherOnClock','weatherFields','weatherRefreshMinutes','weatherShowLocation','weatherClockShowLocation','weatherClockFont','weatherClockBold','weatherClockColor','weatherPageFont','weatherPageBold','weatherPageColor','weatherAnimationEnabled','weatherBackgroundMode','weatherBackgroundColor','weatherBackgroundImage','timeBold','dateBold','weatherClockX','weatherClockY','weatherClockSize','weatherPageX','weatherPageY','weatherPageSize','weatherConditionFontSize','weatherLocationFontSize','weatherClockLayout','weatherPageLayout','weatherTempScale','weatherIconScale','weatherConditionScale','weatherExtraScale','weatherClockFields','weatherLocationLabel','dongSearch','weatherIconStyle','weatherIconColorMode','weatherIconColor','maintenanceMode','maintenanceTitle','maintenanceText','timeShadow','dateShadow','weatherShadow','clockWeatherShadow','messageShadow','messageClockOverlay','messagePrioritySchedule']},q.callback);if(q.action==='weather')return response_(getWeather_(),q.callback);if(q.action==='weatherCheck')return response_(weatherCheck_(),q.callback);if(q.action==='dongSearch')return response_(dongSearch_(q.q),q.callback);if(q.action==='saveStatus'){const id=String(q.requestId||'');if(!/^[A-Za-z0-9_-]{12,100}$/.test(id))throw Error('요청번호 오류');const cached=CacheService.getScriptCache().get('lcd_save_'+id);if(cached)return response_(JSON.parse(cached),q.callback);const actual=readConfig_();return response_({ok:true,state:actual.version===id?'saved':'pending',version:actual.version,serverVersion:SERVER_VERSION,maintenanceMode:actual.maintenanceMode,source:'config-read'},q.callback);}return response_({ok:true,serverVersion:SERVER_VERSION,config:readConfig_()},q.callback);}catch(err){return response_({ok:false,error:String(err.message||err)},q.callback);}}
function doPost(e){let p={},id='';try{const params=e&&e.parameter||{};p=params.payload?JSON.parse(params.payload):JSON.parse(e&&e.postData&&e.postData.contents||'{}');if(p.action==='templateSave'||p.action==='templateDelete')return response_(templateWrite_(p));id=String(p.requestId||'');if(!/^[A-Za-z0-9_-]{12,100}$/.test(id))throw Error('요청번호 오류');if(p.action!=='save')throw Error('지원하지 않는 요청');const props=PropertiesService.getScriptProperties();if(!props.getProperty(KEY_PROP)||String(p.adminKey||'')!==props.getProperty(KEY_PROP))throw Error('관리자 키 불일치');const c=validate_(p.config||{});if(c.maintenanceMode!==((p.config||{}).maintenanceMode===true))throw Error('점검 모드 입력값 검사 실패');if(!c.clockPageEnabled&&!c.messageEnabled&&!c.weatherPageEnabled)throw Error('화면을 최소 하나 이상 사용하도록 설정하세요.');const lock=LockService.getScriptLock();if(!lock.tryLock(15000))throw Error('다른 저장 진행 중');try{c.version=id;writeConfig_(c);const actual=readConfig_();const fields=['clockPageEnabled','weatherOnClock','weatherPageEnabled','weatherSource','weatherCity','weatherLocationLabel','weatherProvince','weatherDistrict','weatherDong','weatherCoordinateMode','weatherSeconds','weatherRefreshMinutes','weatherShowLocation','weatherClockShowLocation','weatherClockFont','weatherClockBold','weatherClockColor','weatherPageFont','weatherPageBold','weatherPageColor','weatherAnimationEnabled','weatherBackgroundMode','weatherBackgroundColor','weatherBackgroundImage','timeBold','dateBold','weatherClockX','weatherClockY','weatherClockSize','weatherPageX','weatherPageY','weatherPageSize','weatherConditionFontSize','weatherExtraFontSize','weatherClockLayout','weatherPageLayout','weatherTempScale','weatherIconScale','weatherConditionScale','weatherExtraScale','pageOrder','version','messageShowTime','messageShowDate','messageTimeX','messageTimeY','messageTimeSize','messageTimeColor','messageTimeFont','messageTimeBold','messageTimeFormat','messageTimeShadow','messageDateX','messageDateY','messageDateSize','messageDateColor','messageDateFont','messageDateBold','messageDateFormat','messageDateShadow','messageHtml','messageAlign','messageBackgroundMode','messageBackgroundImage','maintenanceMode','maintenanceTitle','maintenanceText','timeShadow','dateShadow','weatherShadow','clockWeatherShadow','messageShadow','timeX','timeY','dateX','dateY','timeSize','dateSize','transitionEffect','transitionDuration','clockBackgroundMode','clockBackgroundColor'];for(const k of fields){if(actual[k]!==c[k])throw Error('서버 저장 검증 실패: '+k);}if(JSON.stringify(actual.clockCustomText)!==JSON.stringify(c.clockCustomText)||JSON.stringify(actual.weatherCustomText)!==JSON.stringify(c.weatherCustomText))throw Error('추가 텍스트 저장 검증 실패');if(JSON.stringify(actual.messagePrioritySchedule)!==JSON.stringify(c.messagePrioritySchedule))throw Error('문자 우선예약 저장 검증 실패');if(JSON.stringify(actual.weatherFields)!==JSON.stringify(c.weatherFields))throw Error('날씨 전용 항목 저장 검증 실패');if(JSON.stringify(actual.weatherClockFields)!==JSON.stringify(c.weatherClockFields))throw Error('시계 날씨 항목 저장 검증 실패');if(!blocksMatch_(actual.messageBlocks,c.messageBlocks))throw Error('문자 상자 저장 검증 실패');CacheService.getScriptCache().put('lcd_save_'+id,JSON.stringify({ok:true,state:'saved',version:id,serverVersion:SERVER_VERSION,maintenanceMode:actual.maintenanceMode,receivedMode:(p.config||{}).maintenanceMode,validatedMode:c.maintenanceMode,storedMode:actual.maintenanceMode}),600);}finally{lock.releaseLock();}return response_({ok:true,version:id,serverVersion:SERVER_VERSION});}catch(err){const error=String(err.message||err);if(/^[A-Za-z0-9_-]{12,100}$/.test(id))try{CacheService.getScriptCache().put('lcd_save_'+id,JSON.stringify({ok:false,state:'error',error}),600);}catch(_){}return response_({ok:false,error});}}
// R29: inactive background image fields may contain legacy filenames; do not block unrelated saves.
function validateOptionalBg_(v,required,label){
 const p=String(v||'images/background.jpg').trim();
 if(/^images\/[a-zA-Z0-9가-힣._ -]+\.(jpg|jpeg|png|webp)$/i.test(p)&&!p.includes('..'))return p;
 if(required)throw Error(label+' 배경 이미지 파일명 오류: images/파일명.jpg 형식을 사용하세요.');
 return 'images/background.jpg';
}
function validateWeatherBg_(v){const p=String(v||'images/background.jpg');if(!/^images\/[a-zA-Z0-9가-힣._ -]+\.(jpg|jpeg|png|webp)$/i.test(p)||p.includes('..'))throw Error('날씨 배경 이미지 파일명 오류');return p;}
function validatePrioritySchedule_(v){
 const s=v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const start=Number(s.start)||0,end=Number(s.end)||0;
 if(start||end){if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<946684800000||end<=start||end-start>31*86400000)throw Error('문자 우선예약 기간 오류 (최대 31일)')}
 if(s.enabled===true&&(!start||!end))throw Error('문자 우선예약 시작·종료 기간을 설정하세요.');
 const weekdays=Array.isArray(s.weekdays)?[...new Set(s.weekdays.map(Number).filter(d=>Number.isInteger(d)&&d>=0&&d<=6))]:[0,1,2,3,4,5,6];
 const time=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||''))?String(v):'00:00';
 return {enabled:s.enabled===true,start,end,weekdays,timeStart:time(s.timeStart),timeEnd:time(s.timeEnd)};
}
function r115ValidateText_(v){const x=v&&typeof v==='object'?v:{};const n=(v,d)=>Number.isFinite(Number(v))?Number(v):d;return {text:String(x.text||'').slice(0,500),enabled:x.enabled===true,x:Math.max(0,Math.min(100,n(x.x,50))),y:Math.max(0,Math.min(100,n(x.y,72))),size:Math.max(16,Math.min(300,n(x.size,62))),color:/^#[0-9a-f]{6}$/i.test(String(x.color||''))?String(x.color):'#ffffff',bold:x.bold!==false,shadow:x.shadow!==false};}
function validate_(x){const allowed=(v,a,d)=>a.includes(v)?v:d;const n=(v,lo,hi,d)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):d;const color=(v,d='#ffffff')=>/^#[0-9a-f]{6}$/i.test(String(v||''))?String(v):d;const bg=String(x.background||'images/background.jpg');if(!/^images\/[a-zA-Z0-9가-힣._ -]+\.(jpg|jpeg|png|webp)$/i.test(bg)||bg.includes('..'))throw Error('배경 파일명 오류');const html=String(x.messageHtml||'');if(html.length>60000)throw Error('문자 HTML은 최대 60000자');const fonts=['Arial','Malgun Gothic','Noto Sans KR','Georgia','Courier New','Times New Roman'];return {timeX:n(x.timeX,0,100,50),timeY:n(x.timeY,0,100,50),dateX:x.dateX==null?null:n(x.dateX,0,100,50),dateY:x.dateY==null?null:n(x.dateY,0,100,65),showTime:!!x.showTime,showDate:!!x.showDate,timeSize:n(x.timeSize,24,600,112),timeColor:color(x.timeColor),timeFormat:allowed(x.timeFormat,['24s','24m','12s','12m'],'24s'),timeFont:allowed(x.timeFont,fonts,'Malgun Gothic'),timeBold:!!x.timeBold,dateSize:n(x.dateSize,16,110,34),dateColor:color(x.dateColor),dateFont:allowed(x.dateFont,fonts,'Malgun Gothic'),dateBold:!!x.dateBold,datePosition:allowed(x.datePosition,['center','top-left','top-right','bottom-left','bottom-right'],'bottom-right'),dateFormat:allowed(x.dateFormat,['long','short','iso','slash','month'],'long'),background:bg,clockBackgroundMode:allowed(x.clockBackgroundMode,['image','color'],'image'),clockBackgroundColor:color(x.clockBackgroundColor,'#17283b'),overlay:n(x.overlay,0,70,15),messageShowTime:!!x.messageShowTime,messageShowDate:!!x.messageShowDate,messageTimeX:n(x.messageTimeX,0,100,50),messageTimeY:n(x.messageTimeY,0,100,22),messageTimeSize:n(x.messageTimeSize,24,600,112),messageTimeColor:color(x.messageTimeColor),messageTimeFont:allowed(x.messageTimeFont,fonts,'Malgun Gothic'),messageTimeBold:!!x.messageTimeBold,messageTimeFormat:allowed(x.messageTimeFormat,['24s','24m','12s','12m'],'24s'),messageTimeShadow:x.messageTimeShadow!==false,messageDateX:n(x.messageDateX,0,100,50),messageDateY:n(x.messageDateY,0,100,82),messageDateSize:n(x.messageDateSize,16,110,34),messageDateColor:color(x.messageDateColor),messageDateFont:allowed(x.messageDateFont,fonts,'Malgun Gothic'),messageDateBold:!!x.messageDateBold,messageDateFormat:allowed(x.messageDateFormat,['long','short','iso','slash','month'],'long'),messageDateShadow:x.messageDateShadow!==false,messageEnabled:!!x.messageEnabled,messageText:String(x.messageText||'').slice(0,500),messageHtml:html,clockSeconds:n(x.clockSeconds,5,86400,60),messageSeconds:n(x.messageSeconds,3,3600,15),messageSize:n(x.messageSize,24,240,100),messageColor:color(x.messageColor,'#ffdd55'),messageBackground:color(x.messageBackground,'#101827'),messageBackgroundMode:allowed(x.messageBackgroundMode,['color','image'],'color'),messageBackgroundImage:validateOptionalBg_(x.messageBackgroundImage,x.messageBackgroundMode==='image','문자'),timeShadow:x.timeShadow!==false,dateShadow:x.dateShadow!==false,weatherShadow:x.weatherShadow!==false,clockWeatherShadow:x.clockWeatherShadow!==false,messageShadow:x.messageShadow!==false,maintenanceMode:x.maintenanceMode===true,maintenanceTitle:String(x.maintenanceTitle??'안내 말씀').trim().slice(0,60)||'안내 말씀',maintenanceText:String(x.maintenanceText??'현재 화면을 점검하고 있습니다.\n잠시 후 정상 운영됩니다.').slice(0,200),transitionEffect:allowed(x.transitionEffect,['none','fade','slide'],'fade'),transitionDuration:n(x.transitionDuration,0,3000,700),messageFont:allowed(x.messageFont,fonts,'Malgun Gothic'),messageAlign:allowed(x.messageAlign,['left','center','right'],'center'),startScreen:allowed(x.startScreen,['clock','message'],'clock'),messageBlocks:validateBlocks_(x.messageBlocks),clockPageEnabled:x.clockPageEnabled!==false,weatherOnClock:!!x.weatherOnClock,weatherPageEnabled:!!x.weatherPageEnabled,weatherSource:allowed(x.weatherSource,['weatherapi','kma'],'weatherapi'),weatherCity:String(x.weatherCity||'Seoul').trim().slice(0,100)||'Seoul',weatherLocationLabel:String(x.weatherLocationLabel||'').trim().slice(0,80),weatherProvince:String(x.weatherProvince||'').trim().slice(0,50),weatherDistrict:String(x.weatherDistrict||'').trim().slice(0,100),weatherDong:String(x.weatherDong||'').trim().slice(0,40),weatherCoordinateMode:allowed(x.weatherCoordinateMode,['district','selected','manual'],'district'),weatherSeconds:n(x.weatherSeconds,5,3600,20),weatherRefreshMinutes:allowed(Number(x.weatherRefreshMinutes),[5,10,15,30],15),weatherFields:normalizeWeatherFields_(x.weatherFields),weatherClockFields:normalizeWeatherFields_(x.weatherClockFields==null?x.weatherFields:x.weatherClockFields),weatherClockShowLocation:x.weatherClockShowLocation!==false,weatherIconStyle:allowed(x.weatherIconStyle,['outline','emoji','none'],'outline'),weatherIconColorMode:allowed(x.weatherIconColorMode,['auto','white','black','custom'],'auto'),weatherIconColor:color(x.weatherIconColor,'#ffffff'),weatherClockFont:allowed(x.weatherClockFont,fonts,'Malgun Gothic'),weatherClockBold:!!x.weatherClockBold,weatherClockColor:color(x.weatherClockColor,'#ffffff'),weatherPageFont:allowed(x.weatherPageFont,fonts,'Malgun Gothic'),weatherPageBold:!!x.weatherPageBold,weatherAnimationEnabled:x.weatherAnimationEnabled===true,weatherBackgroundMode:allowed(x.weatherBackgroundMode,['color','image'],'color'),weatherBackgroundColor:color(x.weatherBackgroundColor,'#122940'),weatherBackgroundImage:validateOptionalBg_(x.weatherBackgroundImage,x.weatherAnimationEnabled!==true&&x.weatherBackgroundMode==='image','날씨'),weatherPageColor:color(x.weatherPageColor,'#ffffff'),weatherShowLocation:x.weatherShowLocation!==false,weatherClockX:n(x.weatherClockX,0,100,50),weatherClockY:n(x.weatherClockY,0,100,12),weatherClockSize:n(x.weatherClockSize,16,150,40),weatherClockLayout:allowed(x.weatherClockLayout,['horizontal','summary','compact'],'horizontal'),weatherPageLayout:allowed(x.weatherPageLayout,['horizontal','summary','compact'],'summary'),weatherTempScale:n(x.weatherTempScale,50,150,100),weatherIconScale:n(x.weatherIconScale,50,150,100),weatherConditionScale:n(x.weatherConditionScale,50,150,100),weatherExtraScale:n(x.weatherExtraScale,50,150,100),weatherPageX:n(x.weatherPageX,0,100,50),weatherPageY:n(x.weatherPageY,0,100,48),weatherPageSize:n(x.weatherPageSize,40,900,135),weatherConditionFontSize:n(x.weatherConditionFontSize,24,250,60),weatherExtraFontSize:n(x.weatherExtraFontSize,20,120,45),weatherLocationFontSize:n(x.weatherLocationFontSize,20,120,55),pageOrder:normalizePageOrder_(x.pageOrder),messagePrioritySchedule:validatePrioritySchedule_(x.messagePrioritySchedule),clockCustomText:r115ValidateText_(x.clockCustomText),weatherCustomText:r115ValidateText_(x.weatherCustomText)};}
function validateBlocks_(blocks){if(!Array.isArray(blocks))return [];if(blocks.length>30)throw Error('텍스트 상자 최대 30개');const fonts=['Arial','Malgun Gothic','Noto Sans KR','Georgia','Courier New','Times New Roman'];return blocks.map((b,i)=>{if(String(b.text??'').length>1000)throw Error('텍스트 상자당 최대 1000자');const n=(v,lo,hi,d)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):d;return {id:String(b.id||'b'+i).slice(0,60),text:String(b.text??''),x:n(b.x,0,100,50),y:n(b.y,0,100,50),size:n(b.size,16,300,100),color:/^#[0-9a-f]{6}$/i.test(String(b.color))?b.color:'#ffdd55',font:fonts.includes(b.font)?b.font:'Arial',bold:!!b.bold,underline:!!b.underline,width:n(b.width,100,1800,900),wrap:b.wrap!==false,align:['left','center','right'].includes(b.align)?b.align:'center'};});}
function blocksMatch_(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function response_(obj,callback){const body=JSON.stringify(obj).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');if(callback){if(!/^[A-Za-z_$][\w$]{0,80}$/.test(callback))return ContentService.createTextOutput('invalid callback');return ContentService.createTextOutput(callback+'('+body+');').setMimeType(ContentService.MimeType.JAVASCRIPT);}return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);}


// V33: WeatherAPI credential is never included in public GET config responses.
// Set Script Properties > WEATHERAPI_KEY manually in Apps Script settings.
function normalizeWeatherFields_(v){
 const allowed=['temp','condition','feelslike','humidity','wind'];
 const a=Array.isArray(v)?v:allowed.slice(0,3);
 return [...new Set(a.filter(x=>allowed.includes(x)))];
}
function normalizePageOrder_(v){
 const wanted=String(v||'clock,message,weather').split(',').map(s=>s.trim());
 const valid=[...new Set(wanted.filter(s=>['clock','message','weather'].includes(s)))];
 return [...valid,...['clock','message','weather'].filter(x=>!valid.includes(x))].join(',');
}
/**
 * Run this ONCE from the Apps Script editor as the deployment owner to approve
 * UrlFetchApp external network access. Never log/return the secret key.
 */
function testWeatherConnection(){
 const result=weatherCheck_();
 Logger.log(JSON.stringify(result));
 return result;
}
function weatherCheck_(){
 const c=readConfig_();if(c.weatherSource==='kma')return getKmaWeather_(c,true);
 const p=PropertiesService.getScriptProperties();
 const key=String(p.getProperty('WEATHERAPI_KEY')||'').trim();
 const location=String(c.weatherCity||'Seoul').trim();
 const base={ok:false,serverVersion:SERVER_VERSION,keyConfigured:!!key,location:location};
 if(!key)return {...base,stage:'script_property',error:'WEATHERAPI_KEY가 없습니다. 프로젝트 설정 > 스크립트 속성에 등록하세요.'};
 const result=fetchWeatherApi_(location,key);
 return {...base,...result,location:result.ok?weatherDisplayLabelV52A_(c,result.location):location,stage:result.ok?'success':result.stage||'api',keyConfigured:true};
}
function fetchWeatherApi_(city,key){
 try{
  // Use the encoded key only in the outgoing request. Never return URL or key.
  const url='https://api.weatherapi.com/v1/current.json?key='+encodeURIComponent(key)+'&q='+encodeURIComponent(city)+'&lang=ko&aqi=no';
  const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:true,validateHttpsCertificates:true});
  const status=res.getResponseCode();
  const body=res.getContentText();
  if(status!==200){
   let code=null,detail='HTTP '+status;
   try{const parsed=JSON.parse(body);code=parsed.error&&parsed.error.code;detail=parsed.error&&parsed.error.message||detail}catch(_){}
   const hints={1002:'API 키가 누락되었거나 잘못되었습니다.',1003:'API 키가 유효하지 않습니다.',1005:'현재 요금제에서 지원하지 않는 요청입니다.',1006:'지역 이름을 찾지 못했습니다. Seoul 또는 위도,경도로 변경해 보세요.',2006:'API 키가 잘못되었습니다.',2007:'호출 한도를 초과했습니다.',2008:'API 키가 비활성화되었습니다.',2009:'월 호출 한도를 초과했습니다.'};
   return {ok:false,stage:'weatherapi',httpStatus:status,errorCode:code,error:'WeatherAPI 응답: '+detail+(hints[code]?' / '+hints[code]:'')};
  }
  const raw=JSON.parse(body);const w=raw.current||{},loc=raw.location||{};
  if(!Number.isFinite(Number(w.temp_c)))return {ok:false,stage:'parse',error:'WeatherAPI 응답에 기온 값이 없습니다.'};
  return {ok:true,updatedAt:Date.now(),location:String(loc.name||city),temperature:Number(w.temp_c),feelsLike:Number(w.feelslike_c),humidity:Number(w.humidity),windKph:Number(w.wind_kph),condition:String(w.condition&&w.condition.text||''),conditionCode:Number(w.condition&&w.condition.code||0),isDay:Number(w.is_day)==0?0:1,observedAt:String(w.last_updated||'')};
 }catch(err){
  const msg=String(err&&err.message||err);
  return {ok:false,stage:'apps_script_fetch',error:'Apps Script 외부 요청 실패: '+msg.replace(/key=[^&\s]+/gi,'key=[hidden]')+' / Apps Script 편집기에서 testWeatherConnection을 실행해 외부 요청 권한을 승인하세요.'};
 }
}
// V52A: keep WeatherAPI's query location separate from the Korean screen label.
function weatherDisplayLabelV52A_(c,apiName){
 const fixed=String(c.weatherLocationLabel||'').trim();
 if(fixed)return fixed;
 const dong=String(c.weatherDong||'').trim();
 if(dong)return dong;
 const query=String(c.weatherCity||'').trim();
 const district=String(c.weatherDistrict||'').trim();
 // Known district-center coordinate used by the administrator location selector.
 if(query==='37.5633,127.0371'||district==='37.5633,127.0371')return '서울특별시 성동구';
 const province=String(c.weatherProvince||'').trim();
 if(province&&district&&/^[가-힣]/.test(district))return province+' '+district;
 if(province&&!district)return province;
 return String(apiName||query||'Seoul');
}
function getWeather_(){
 const selected=readConfig_();if(selected.weatherSource==='kma')return getKmaWeather_(selected);
 const p=PropertiesService.getScriptProperties();
 const key=String(p.getProperty('WEATHERAPI_KEY')||'').trim();
 if(!key)return {ok:false,error:'WeatherAPI 키 미설정: Apps Script 스크립트 속성 WEATHERAPI_KEY를 등록하세요.'};
 const c=readConfig_();if(!(c.weatherPageEnabled||(c.clockPageEnabled&&c.weatherOnClock)))return {ok:false,disabled:true,error:'날씨 표시 꺼짐 · WeatherAPI 호출 안 함'};const city=String(c.weatherCity||'Seoul').trim();
 const cache=CacheService.getScriptCache();
 const cacheKey='lcd_weather_v34_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,city)).slice(0,26);
 const cached=cache.get(cacheKey);
 if(cached){try{const data=JSON.parse(cached);if(data.ok)data.location=weatherDisplayLabelV52A_(c,data.location);return data;}catch(_){}}
 const lock=LockService.getScriptLock();
 if(!lock.tryLock(3000)){
  const after=cache.get(cacheKey);if(after){const data=JSON.parse(after);if(data.ok)data.location=weatherDisplayLabelV52A_(c,data.location);return data;}
  return {ok:false,error:'날씨 갱신 요청이 겹쳤습니다. 잠시 후 다시 시도하세요.'};
 }
 try{
  const stored=cache.get(cacheKey);if(stored){const data=JSON.parse(stored);if(data.ok)data.location=weatherDisplayLabelV52A_(c,data.location);return data;}
  const result=fetchWeatherApi_(city,key);
  if(result.ok)result.location=weatherDisplayLabelV52A_(c,result.location);
  if(result.ok)cache.put(cacheKey,JSON.stringify(result),Math.max(300,Math.min(21600,Number(c.weatherRefreshMinutes||15)*60)));
  return result;
 }finally{lock.releaseLock()}
}


/** V48: WeatherAPI search endpoint; called only by explicit admin search button. */
function dongSearch_(query){
 const q=String(query||'').trim();
 if(q.length<2||q.length>100||/[<>\\]/.test(q))return {ok:false,error:'검색어를 확인하세요.'};
 const key=String(PropertiesService.getScriptProperties().getProperty('WEATHERAPI_KEY')||'').trim();
 if(!key)return {ok:false,error:'WEATHERAPI_KEY가 설정되지 않았습니다.'};
 const cache=CacheService.getScriptCache();
 const cacheKey='lcd_dong48_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5,q)).slice(0,30);
 const cached=cache.get(cacheKey);if(cached){try{return JSON.parse(cached)}catch(_){}}
 try{
  const url='https://api.weatherapi.com/v1/search.json?key='+encodeURIComponent(key)+'&q='+encodeURIComponent(q);
  const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:true});
  if(res.getResponseCode()!==200)return {ok:false,error:'WeatherAPI 위치 검색 실패 (HTTP '+res.getResponseCode()+'). 직접 좌표를 사용할 수 있습니다.'};
  const raw=JSON.parse(res.getContentText());
  if(!Array.isArray(raw))return {ok:false,error:'위치 검색 응답 형식 오류'};
  const results=raw.filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lon)))
   .slice(0,10).map(x=>({name:String(x.name||''),region:String(x.region||''),country:String(x.country||''),lat:Number(x.lat),lon:Number(x.lon)}));
  const out={ok:true,results};cache.put(cacheKey,JSON.stringify(out),21600);return out;
 }catch(e){return {ok:false,error:'동 검색 요청 오류: '+String(e.message||e).replace(/key=[^&\\s]+/gi,'key=[hidden]')}}
}


// V55X-R30: independent message layout library. Does not modify active LCD config.
const TEMPLATE_INDEX_PROP='LCD_MESSAGE_TEMPLATES_R30';
function templateIndex_(){try{const x=JSON.parse(PropertiesService.getScriptProperties().getProperty(TEMPLATE_INDEX_PROP)||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function templateList_(){return templateIndex_().map(x=>({id:x.id,name:x.name,updatedAt:x.updatedAt}));}
function templateWrite_(p){
 const props=PropertiesService.getScriptProperties();
 if(!props.getProperty(KEY_PROP)||String(p.adminKey||'')!==props.getProperty(KEY_PROP))throw Error('관리자 키 불일치');
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))throw Error('다른 작업 진행 중');
 try{
  let index=templateIndex_();const id=String(p.templateId||'');
  if(!/^t[a-z0-9_-]{5,45}$/i.test(id))throw Error('템플릿 ID 오류');
  if(p.action==='templateDelete'){
   if(!index.some(x=>x.id===id))throw Error('삭제할 레이아웃 없음');
   index=index.filter(x=>x.id!==id);props.deleteProperty('LCD_TPL_R30_'+id);
  }else{
   const name=String(p.name||'').trim().slice(0,50);if(!name)throw Error('레이아웃 이름을 입력하세요');
   const raw=p.layout;if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('레이아웃 데이터 오류');
   const safe={};const allowed=['messageBlocks','messageBackground','messageBackgroundMode','messageBackgroundImage','messageShowTime','messageShowDate','messageTimeX','messageTimeY','messageTimeSize','messageTimeColor','messageTimeFont','messageTimeBold','messageTimeFormat','messageTimeShadow','messageDateX','messageDateY','messageDateSize','messageDateColor','messageDateFont','messageDateBold','messageDateFormat','messageDateShadow','messageShadow','messageFont','messageAlign','messageSize','messageColor','messageText','messageHtml'];
   for(const k of allowed)if(Object.prototype.hasOwnProperty.call(raw,k))safe[k]=raw[k];
   if(Array.isArray(safe.messageBlocks)&&safe.messageBlocks.length>30)throw Error('문자 상자 최대 30개');
   const data=JSON.stringify(safe);if(data.length>15000)throw Error('레이아웃 용량 초과(15,000자)');
   if(!index.some(x=>x.id===id)&&index.length>=20)throw Error('최대 20개까지 저장할 수 있습니다');
   props.setProperty('LCD_TPL_R30_'+id,data);
   index=index.filter(x=>x.id!==id);index.push({id,name,updatedAt:Date.now()});
  }
  props.setProperty(TEMPLATE_INDEX_PROP,JSON.stringify(index));
  return {ok:true,templateId:id,templates:templateList_()};
 }finally{lock.releaseLock()}
}
function templateRead_(id){const x=templateIndex_().find(x=>x.id===id);if(!x)throw Error('레이아웃을 찾지 못했습니다');const raw=PropertiesService.getScriptProperties().getProperty('LCD_TPL_R30_'+id);if(!raw)throw Error('레이아웃 데이터 누락');return {ok:true,id:x.id,name:x.name,layout:JSON.parse(raw)}}


/** R115: KMA only; never falls back to WeatherAPI when KMA is selected. */
function r115Grid_(lat,lon){
 const RE=6371.00877,GRID=5,SLAT1=30*Math.PI/180,SLAT2=60*Math.PI/180,OLON=126*Math.PI/180,OLAT=38*Math.PI/180,XO=43,YO=136;
 const sn0=Math.tan(Math.PI*.25+SLAT1*.5),sn1=Math.tan(Math.PI*.25+SLAT2*.5);
 let sn=Math.log(Math.cos(SLAT1)/Math.cos(SLAT2))/Math.log(sn1/sn0);
 let sf=Math.tan(Math.PI*.25+SLAT1*.5);sf=Math.pow(sf,sn)*Math.cos(SLAT1)/sn;
 let ro=Math.tan(Math.PI*.25+OLAT*.5);ro=RE/GRID*sf/Math.pow(ro,sn);
 let ra=Math.tan(Math.PI*.25+lat*Math.PI/360);ra=RE/GRID*sf/Math.pow(ra,sn);
 let theta=lon*Math.PI/180-OLON;if(theta>Math.PI)theta-=2*Math.PI;if(theta< -Math.PI)theta+=2*Math.PI;theta*=sn;
 return {nx:Math.floor(ra*Math.sin(theta)+XO+.5),ny:Math.floor(ro-ra*Math.cos(theta)+YO+.5)};
}
function r115KmaQuery_(service,key,baseDate,baseTime,nx,ny){
 const url='https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/'+service+'?serviceKey='+encodeURIComponent(key)+'&pageNo=1&numOfRows=1000&dataType=JSON&base_date='+baseDate+'&base_time='+baseTime+'&nx='+nx+'&ny='+ny;
 const res=UrlFetchApp.fetch(url,{muteHttpExceptions:true,followRedirects:true});
 if(res.getResponseCode()!==200)throw Error('기상청 '+service+' HTTP '+res.getResponseCode());
 let data;try{data=JSON.parse(res.getContentText())}catch(_){throw Error('기상청 JSON 응답 해석 실패')}
 const header=data.response&&data.response.header||{};
 if(String(header.resultCode)!=='00')throw Error('기상청 '+service+': '+String(header.resultMsg||header.resultCode));
 const items=data.response&&data.response.body&&data.response.body.items;
 return Array.isArray(items&&items.item)?items.item:[];
}
function r115KmaClock_(offsetHours){const d=new Date(Date.now()+offsetHours*3600000);return {date:Utilities.formatDate(d,'Asia/Seoul','yyyyMMdd'),time:Utilities.formatDate(d,'Asia/Seoul','HHmm')}}
function getKmaWeather_(c,check){
 const key=String(PropertiesService.getScriptProperties().getProperty('KMA_SERVICE_KEY')||'').trim();
 if(!key)return {ok:false,source:'kma',stage:'script_property',error:'기상청 인증키 미설정: 스크립트 속성 KMA_SERVICE_KEY를 등록하세요.'};
 if(!check&&!(c.weatherPageEnabled||(c.clockPageEnabled&&c.weatherOnClock)))return {ok:false,source:'kma',disabled:true,error:'날씨 표시 꺼짐'};
 const match=String(c.weatherCity||'').match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
 if(!match)return {ok:false,source:'kma',stage:'location',error:'기상청은 위도,경도 좌표가 필요합니다. 날씨 설정에서 직접 좌표를 입력하세요. (예: 37.5444,127.0561)'};
 const lat=Number(match[1]),lon=Number(match[2]);if(lat<32||lat>39.5||lon<124||lon>132)return {ok:false,source:'kma',error:'대한민국 범위의 위도·경도를 입력하세요.'};
 const grid=r115Grid_(lat,lon),now=new Date(),minute=Number(Utilities.formatDate(now,'Asia/Seoul','mm'));
 const ncst=r115KmaClock_(minute<12?-1:0),fcst=r115KmaClock_(minute<45?-1:0);
 const ncstBase=ncst.time.slice(0,2)+'00',fcstBase=fcst.time.slice(0,2)+'30';
 const cache=CacheService.getScriptCache(),cacheKey='r115_kma_'+grid.nx+'_'+grid.ny+'_'+ncst.date+ncstBase+'_'+fcst.date+fcstBase;
 if(!check){const cached=cache.get(cacheKey);if(cached){try{return JSON.parse(cached)}catch(_){}}}
 try{
  const observed=r115KmaQuery_('getUltraSrtNcst',key,ncst.date,ncstBase,grid.nx,grid.ny);
  const predicted=r115KmaQuery_('getUltraSrtFcst',key,fcst.date,fcstBase,grid.nx,grid.ny);
  const obs={};for(const v of observed)obs[v.category]=v.obsrValue;
  const slots={};for(const v of predicted){const k=v.fcstDate+v.fcstTime;(slots[k]||(slots[k]={}))[v.category]=v.fcstValue}
  const sorted=Object.keys(slots).sort(),target=Utilities.formatDate(now,'Asia/Seoul','yyyyMMddHHmm');
  const slot=slots[sorted.find(k=>k>=target)||sorted[sorted.length-1]]||{};
  const pty=Number(slot.PTY??obs.PTY??0),sky=Number(slot.SKY??1),rain=Number(obs.RN1??0);
  const raining=pty===1||pty===2||pty===5||pty===6||pty===7||rain>0;
  let code=1000,condition='맑음';
  if(pty===3||pty===7){code=1213;condition='눈'}
  else if(pty===2||pty===6){code=1204;condition='비·눈'}
  else if(raining){code=1183;condition='비'}
  else if(sky===4){code=1009;condition='흐림'}
  else if(sky===3){code=1006;condition='구름 많음'}
  const temp=Number(obs.T1H),hum=Number(obs.REH),wind=Number(obs.WSD);
  if(!Number.isFinite(temp)||!Number.isFinite(hum))throw Error('기상청 초단기실황 기온·습도 누락');
  const hour=Number(Utilities.formatDate(now,'Asia/Seoul','HH'));
  const result={ok:true,source:'kma',updatedAt:Date.now(),location:weatherDisplayLabelV52A_(c,''),temperature:temp,feelsLike:temp,humidity:hum,windKph:Number.isFinite(wind)?wind*3.6:0,condition:condition,conditionCode:code,isDay:hour>=6&&hour<18?1:0,kmaNx:grid.nx,kmaNy:grid.ny,kmaObservationAt:ncst.date+ncstBase,kmaForecastAt:fcst.date+fcstBase};
  cache.put(cacheKey,JSON.stringify(result),Math.max(300,Math.min(900,Number(c.weatherRefreshMinutes||15)*60)));
  return result;
 }catch(e){return {ok:false,source:'kma',stage:'kma_api',error:String(e.message||e).slice(0,220)}}
}
