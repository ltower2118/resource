'use strict';
const DEFAULT={showTime:true,showDate:true,timeSize:112,timeColor:'#ffffff',timeFormat:'24s',timeFont:'Arial',dateSize:34,dateColor:'#ffffff',dateFont:'Arial',datePosition:'bottom-right',dateFormat:'long',background:'images/background.jpg',overlay:15,version:'1'};
const FONT_OPTIONS=['Arial','Malgun Gothic','Noto Sans KR','Georgia','Courier New','Times New Roman'];
function fontValue(v){return FONT_OPTIONS.includes(v)?JSON.stringify(v)+', sans-serif':'Arial, sans-serif'}
const apiUrl=()=>String(window.LCD_API_URL||'').trim();
function apiReady(){return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(apiUrl())}
function getRemote(timeoutMs=12000){
  return new Promise((resolve,reject)=>{
    if(!apiReady())return reject(Error('config.js에 Apps Script /exec 주소를 넣으세요.'));
    const callback='lcdCallback'+Math.random().toString(36).slice(2);
    const tag=document.createElement('script');let done=false;
    const timer=setTimeout(()=>finish(Error('설정 서버 응답 시간 초과')),timeoutMs);
    function finish(err,value){if(done)return;done=true;clearTimeout(timer);delete window[callback];tag.remove();err?reject(err):resolve(value)}
    window[callback]=data=>data&&data.ok?finish(null,data.config):finish(Error(data?.error||'설정 조회 실패'));
    tag.onerror=()=>finish(Error('설정 서버 연결 실패'));
    tag.src=apiUrl()+'?action=config&callback='+callback+'&_='+Date.now();
    document.head.appendChild(tag);
  });
}
function fmtDate(c,p){const y=p.year,m=p.month,d=p.day,w=p.weekday;return ({long:`${y}년 ${Number(m)}월 ${Number(d)}일 ${w}`,short:`${y}.${m}.${d} (${w[0]})`,iso:`${y}-${m}-${d}`,slash:`${y}/${m}/${d}`,month:`${Number(m)}월 ${Number(d)}일 ${w}`})[c.dateFormat]||`${y}년 ${Number(m)}월 ${Number(d)}일 ${w}`}
function fmtTime(c,p){let h=p.hour;if(String(c.timeFormat).startsWith('12')){const n=Number(h);h=(n<12?'오전 ':'오후 ')+String(n%12||12).padStart(2,'0')}return h+':'+p.minute+(String(c.timeFormat).endsWith('s')?':'+p.second:'')}
function nowParts(){return Object.fromEntries(new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).formatToParts(new Date()).map(x=>[x.type,x.value]))}
