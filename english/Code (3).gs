/*
영어 플래시카드 Code.gs 전체 교체용

[새 연결]
1) 새 Google Spreadsheet > 확장 프로그램 > Apps Script
2) 이 Code.gs 전체 붙여넣기
3) setupEnglishCards()를 1회 실행하고 Google 권한 승인
4) 배포 > 새 배포 > 웹 앱
5) 실행 사용자: 나
6) 본인/아내가 접근 가능한 액세스 권한 선택
7) 배포된 /exec URL을 english/main.html의 API_URL에 입력

[권한]
ALLOWED_EMAILS는 선택 기능입니다.
Google Workspace처럼 Session.getActiveUser().getEmail()이 확인되는 환경에서만
['본인메일','아내메일'] 형태로 사용할 것을 권장합니다.
개인 Gmail 웹앱에서는 이메일이 빈 값일 수 있으므로 기본 []가 안전합니다.

[시트]
ID | 종류 | 영어 | 한글발음 | 한국어뜻 | 메모 | 펜데이터 |
정답횟수 | 오답횟수 | 마지막학습일 | 수정일
*/
const SHEET_NAME='영어카드';
const HEADERS=['ID','종류','영어','한글발음','한국어뜻','메모','펜데이터','정답횟수','오답횟수','마지막학습일','수정일'];
const ALLOWED_EMAILS=[];

function checkAccess_(){
 if(!ALLOWED_EMAILS.length)return true;
 const email=String(Session.getActiveUser().getEmail()||'').trim().toLowerCase();
 if(!email)throw new Error('현재 배포 방식에서는 사용자 이메일을 확인할 수 없습니다. ALLOWED_EMAILS를 비우거나 배포 권한을 확인하세요.');
 if(!ALLOWED_EMAILS.map(x=>String(x).trim().toLowerCase()).includes(email))throw new Error('접근 권한이 없는 계정입니다.');
 return true;
}
function doGet(){try{checkAccess_();return json_({ok:true,message:'English Flashcards API',sheet:SHEET_NAME})}catch(e){return json_({ok:false,error:String(e.message||e)})}}
function doPost(e){
 try{
  checkAccess_();
  const p=JSON.parse((e&&e.postData&&e.postData.contents)||'{}'),sh=sheet_();
  switch(p.action){
   case 'list':return json_({ok:true,cards:list_(sh)});
   case 'add':return json_({ok:true,card:add_(sh,p.card||{})});
   case 'update':return json_({ok:true,card:update_(sh,p.card||{})});
   case 'penUpdate':return json_({ok:true,result:penUpdate_(sh,p.id,p.penData)});
   case 'move':return json_({ok:true,result:move_(sh,p.id,p.to)});
   case 'delete':delete_(sh,p.id);return json_({ok:true});
   case 'rate':rate_(sh,p.id,!!p.known);return json_({ok:true});
   case 'lookup':return json_(lookupEnglish_(String(p.text||'').trim()));
   default:throw new Error('알 수 없는 action입니다.');
  }
 }catch(err){return json_({ok:false,error:String(err&&err.message?err.message:err)})}
}
function setupEnglishCards(){
 const sh=sheet_();
 if(sh.getLastRow()===1){
  sh.getRange(2,1,2,HEADERS.length).setValues([
   [Utilities.getUuid(),'단어','apple','애플','사과','기본 예시 카드','',0,0,'',new Date()],
   [Utilities.getUuid(),'문장','How are you?','하우 아 유?','어떻게 지내세요?','회화 예시 카드','',0,0,'',new Date()]
  ]);
 }
 sh.setFrozenRows(1);sh.autoResizeColumns(1,HEADERS.length);
 return {ok:true,sheet:SHEET_NAME,rows:sh.getLastRow()-1,headers:HEADERS};
}
function sheet_(){
 const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(SHEET_NAME);
 if(!sh){sh=ss.insertSheet(SHEET_NAME);sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);sh.setFrozenRows(1)}
 ensureStructure_(sh);return sh;
}
function ensureStructure_(sh){
 const last=Math.max(1,sh.getLastColumn()),h=sh.getRange(1,1,1,last).getDisplayValues()[0].map(x=>String(x||'').trim());
 if(!h.includes('펜데이터')){const m=h.indexOf('메모');if(m>=0){sh.insertColumnAfter(m+1);sh.getRange(1,m+2).setValue('펜데이터')}else{sh.insertColumnAfter(6);sh.getRange(1,7).setValue('펜데이터')}}
 const cur=sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0];HEADERS.forEach((x,i)=>{if(!String(cur[i]||'').trim())sh.getRange(1,i+1).setValue(x)});sh.setFrozenRows(1);
}
function list_(sh){
 const n=sh.getLastRow();if(n<2)return [];
 return sh.getRange(2,1,n-1,HEADERS.length).getValues().filter(r=>r[0]||r[2]||r[3]||r[4]||r[5]||r[6]).map((r,i)=>({
  id:String(r[0]||('row-'+(i+2))),type:String(r[1]||''),jp:String(r[2]||''),reading:String(r[3]||''),ko:String(r[4]||''),memo:String(r[5]||''),penData:String(r[6]||''),correct:Number(r[7]||0),wrong:Number(r[8]||0),lastStudy:r[9] instanceof Date?r[9].toISOString():String(r[9]||''),updated:r[10] instanceof Date?r[10].toISOString():String(r[10]||'')
 }));
}
function add_(sh,c){
 const id=Utilities.getUuid(),p=String(c.penData||'');validatePenData_(p);
 sh.appendRow([id,String(c.type||''),String(c.jp||''),String(c.reading||''),String(c.ko||''),String(c.memo||''),p,0,0,'',new Date()]);return {id:id,penData:p};
}
function rowById_(sh,id){
 const t=String(id||'');if(!t)return 0;const m=t.match(/^row-(\d+)$/);if(m){const r=Number(m[1]);if(r>=2&&r<=sh.getLastRow())return r}
 const n=sh.getLastRow();if(n<2)return 0;const f=sh.getRange(2,1,n-1,1).createTextFinder(t).matchEntireCell(true).findNext();return f?f.getRow():0;
}
function update_(sh,c){
 const r=rowById_(sh,c.id);if(!r)throw new Error('카드를 찾을 수 없습니다.');
 sh.getRange(r,2,1,5).setValues([[String(c.type||''),String(c.jp||''),String(c.reading||''),String(c.ko||''),String(c.memo||'')]]);
 if(Object.prototype.hasOwnProperty.call(c,'penData')&&String(c.penData||'').trim()){validatePenData_(c.penData);sh.getRange(r,7).setValue(String(c.penData))}
 sh.getRange(r,11).setValue(new Date());return {id:String(c.id)};
}
function penUpdate_(sh,id,data){
 const r=rowById_(sh,id);if(!r)throw new Error('필기를 저장할 카드를 찾을 수 없습니다.');data=String(data||'');validatePenData_(data);
 sh.getRange(r,7).setValue(data);sh.getRange(r,11).setValue(new Date());SpreadsheetApp.flush();
 if(String(sh.getRange(r,7).getValue()||'')!==data)throw new Error('펜데이터 저장 확인에 실패했습니다.');
 return {id:String(id),saved:true,length:data.length};
}
function validatePenData_(d){
 d=String(d||'');if(!d)return true;if(d.length>45000)throw new Error('필기 데이터가 너무 많습니다.');
 try{const x=JSON.parse(d);if(Array.isArray(x)||(x&&Array.isArray(x.strokes)))return true}catch(_){}
 throw new Error('펜데이터 형식이 올바르지 않습니다.');
}
function move_(sh,id,to){
 const fr=rowById_(sh,id);if(!fr)throw new Error('이동할 카드를 찾을 수 없습니다.');const total=sh.getLastRow()-1,t=Number(to);
 if(!Number.isInteger(t)||t<1||t>total)throw new Error('카드 번호는 1~'+total+' 사이여야 합니다.');
 const fp=fr-1;if(fp===t)return {from:fp,to:t};const w=HEADERS.length,row=sh.getRange(fr,1,1,w).getValues()[0];
 if(t<fp){const b=sh.getRange(t+1,1,fp-t,w).getValues();sh.getRange(t+2,1,b.length,w).setValues(b);sh.getRange(t+1,1,1,w).setValues([row])}
 else{const b=sh.getRange(fr+1,1,t-fp,w).getValues();sh.getRange(fr,1,b.length,w).setValues(b);sh.getRange(t+1,1,1,w).setValues([row])}
 SpreadsheetApp.flush();return {from:fp,to:t};
}
function delete_(sh,id){const r=rowById_(sh,id);if(!r)throw new Error('카드를 찾을 수 없습니다.');sh.deleteRow(r)}
function rate_(sh,id,known){const r=rowById_(sh,id);if(!r)throw new Error('카드를 찾을 수 없습니다.');const c=known?8:9;sh.getRange(r,c).setValue(Number(sh.getRange(r,c).getValue()||0)+1);sh.getRange(r,10).setValue(new Date())}
function lookupEnglish_(text){if(!text)throw new Error('선택한 영어가 없습니다.');let meaning='';try{meaning=LanguageApp.translate(text,'en','ko')}catch(_){}return {ok:true,text:text,kana:'',meaning:meaning}}
function checkEnglishSetup(){const sh=sheet_();return {ok:true,sheet:sh.getName(),headers:sh.getRange(1,1,1,HEADERS.length).getDisplayValues()[0],rows:Math.max(0,sh.getLastRow()-1),allowedEmails:ALLOWED_EMAILS}}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
