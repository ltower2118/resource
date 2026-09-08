/**
 * 서울숲엘타워 소방점검 통합DB API
 *
 * 대상:
 * 서울숲엘타워_소방점검_2017_2025_통합DB_AI
 * └─ 전체DB
 *
 * 특징:
 * - 전체DB 마지막 행까지 자동 조회
 * - 2026, 2027, 2028... 추가해도 자동 반영
 * - 연도 제한 없음
 * - 빈 행 자동 제외
 */

const SHEET_ID = '여기에_통합DB_구글시트_ID';
const SHEET_NAME = '전체DB';

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
        error: String(
          err && err.message
            ? err.message
            : err
        )
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


function getFireInspectionData_() {

  /* 지정한 Google 시트를 직접 엽니다. */
  const ss = SpreadsheetApp.openById(SHEET_ID);

  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(
      '시트 "' +
      SHEET_NAME +
      '"을 찾을 수 없습니다.'
    );
  }


  /* 실제 데이터 마지막 행/열 */
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();


  if (lastRow < 1 || lastColumn < 1) {
    return {
      ok: true,
      title: ss.getName(),
      sheet: SHEET_NAME,
      headers: [],
      data: [],
      count: 0
    };
  }


  /*
   * A1부터 실제 마지막 행/열까지 읽습니다.
   *
   * 2026 이후 자료를 추가해도
   * 자동으로 범위가 늘어납니다.
   */
  const values = sheet
    .getRange(
      1,
      1,
      lastRow,
      lastColumn
    )
    .getDisplayValues();


  /* 첫 번째 행 = 제목 */
  const headers = values[0].map(function(v) {
    return String(v).trim();
  });


  /*
   * 데이터 변환
   *
   * 빈 행은 제외
   */
  const data = values
    .slice(1)

    .filter(function(row) {

      return row.some(function(v) {
        return String(v).trim() !== '';
      });

    })

    .map(function(row) {

      const obj = {};

      headers.forEach(function(h, i) {

        if (!h) return;

        obj[h] =
          row[i] !== undefined
            ? row[i]
            : '';

      });

      return obj;

    });


  /*
   * 실제 포함된 연도 확인
   */
  const years = [
    ...new Set(
      data
        .map(function(x) {
          return String(x['연도'] || '').trim();
        })
        .filter(Boolean)
    )
  ].sort(function(a, b) {
    return Number(a) - Number(b);
  });


  return {

    ok: true,

    title: ss.getName(),

    sheet: SHEET_NAME,

    updatedAt: Utilities.formatDate(
      new Date(),
      'Asia/Seoul',
      'yyyy-MM-dd HH:mm:ss'
    ),

    headers: headers,

    count: data.length,

    years: years,

    data: data

  };
}
