/**
 * 서울숲엘타워 시설관리 - 이력관리 백엔드
 * 이 코드는 구글시트의 [확장 프로그램 > Apps Script]에 붙여넣어 사용합니다.
 * 자세한 배포 절차는 SETUP.md 문서를 참고하세요.
 *
 * 시트 이름: "이력관리" (없으면 활성 시트를 사용)
 * 시트 1행(헤더)에 아래 순서로 입력해두세요:
 *   등록시각 | 날짜 | 구분 | 위치 | 작업내용 | 처리자 | 비고
 */

const SHEET_NAME = "이력관리";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 목록 조회: GET ?action=list */
function doGet(e) {
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return jsonOutput_({ success: true, data: [] });

    const headers = values[0];
    const rows = values.slice(1).map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) {
        let v = row[i];
        if (v instanceof Date) {
          v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
        }
        obj[h] = v;
      });
      return obj;
    });
    return jsonOutput_({ success: true, data: rows });
  } catch (err) {
    return jsonOutput_({ success: false, error: err.toString() });
  }
}

/** 신규 이력 저장: POST (JSON body) */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),            // 등록시각
      payload.date || "",    // 날짜
      payload.category || "",// 구분
      payload.location || "",// 위치
      payload.content || "", // 작업내용
      payload.handler || "", // 처리자
      payload.note || ""     // 비고
    ]);

    return jsonOutput_({ success: true });
  } catch (err) {
    return jsonOutput_({ success: false, error: err.toString() });
  }
}
