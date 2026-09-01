/**
 * 서울숲엘타워 소방점검 DB - Google Apps Script API
 * 대상 시트: 검색용_DB
 *
 * 배포:
 * 1) 구글시트 > 확장 프로그램 > Apps Script
 * 2) 이 파일을 Code.gs에 붙여넣고 저장
 * 3) 배포 > 새 배포 > 웹 앱
 * 4) 실행 사용자: 나 / 액세스 권한: 링크를 가진 모든 사용자(또는 사용 가능한 공개 옵션)
 * 5) 배포된 /exec URL을 GitHub index.html의 APP_SCRIPT_URL에 입력
 */

const SHEET_NAME = '검색용_DB';

function doGet(e) {
  try {
    const result = getFireInspectionData_();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(err && err.message ? err.message : err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFireInspectionData_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('시트 "' + SHEET_NAME + '"을 찾을 수 없습니다.');

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 1) return { ok:true, headers:[], data:[], count:0 };

  const headers = values[0].map(v => String(v).trim());
  const data = values.slice(1)
    .filter(row => row.some(v => String(v).trim() !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      return obj;
    });

  return {
    ok: true,
    title: ss.getName(),
    sheet: SHEET_NAME,
    updatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    headers: headers,
    count: data.length,
    data: data
  };
}
