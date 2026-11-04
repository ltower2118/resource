
'use strict';

// LCD 디지털 사이니지 서버 연결
// V34 Apps Script 웹앱 주소 하나만 사용

window.LCD_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycby3pSHJiPr6g1lLYOtxF-Y6VCDmrJxn0wPw80pzVmB4vx4FCRPevVEJBfq-MmgotYkUEA/exec';

// 기존 HTML 버전과 호환
window.SIGNAGE_API_URL = window.LCD_WEBAPP_URL;
window.LCD_API_URL = window.LCD_WEBAPP_URL;
