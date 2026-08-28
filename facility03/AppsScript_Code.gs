/**
 * 시설점검 사진등록 시스템 - Google Apps Script 백엔드
 * ------------------------------------------------------------
 * [설치 방법]
 * 1) 새 구글 스프레드시트를 만든다. (파일명 예: 서울숲엘타워_시설점검기록)
 * 2) 상단 메뉴 확장프로그램 > Apps Script 클릭
 * 3) 기본 코드 삭제 후 이 파일 내용 전체를 붙여넣기
 * 4) 아래 SHEET_ID, FOLDER_ID 값을 본인 것으로 교체
 *    - SHEET_ID: 스프레드시트 주소창의 /d/ 와 /edit 사이 문자열
 *    - FOLDER_ID: 사진을 저장할 구글드라이브 폴더를 새로 만들고, 폴더 주소창의 /folders/ 뒤 문자열
 * 5) 저장 후 상단 "배포 > 새 배포" 클릭
 *    - 유형: 웹 앱
 *    - 실행할 사용자: 나
 *    - 액세스 권한: 전체 공개(Anyone) — 반드시 이렇게 설정해야 폰에서 접속 가능
 * 6) 배포 후 나오는 "웹 앱 URL"을 복사 → HTML 파일의 WEBAPP_URL 값에 붙여넣기
 * 7) 스프레드시트 자체도 "링크가 있는 모든 사용자 - 뷰어"로 공유 설정 (목록 페이지가 읽어가려면 필요)
 * ------------------------------------------------------------
 */

const SHEET_ID = 'YOUR_SHEET_ID_HERE';       // 스프레드시트 ID로 교체
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE';     // 사진 저장용 드라이브 폴더 ID로 교체
const SHEET_NAME = '점검기록';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        '등록일시', '시설명', '점검자', '점검일', '구역', '분류',
        '위치', '상태', '비고', '사진미리보기', '사진URL1', '사진URL2', '사진URL3', '사진URL4'
      ]);
      sheet.setFrozenRows(1);
    }

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const urls = [];
    (data.photos || []).slice(0, 4).forEach(function (b64, idx) {
      const m = b64.match(/^data:(.+);base64,(.*)$/);
      if (!m) return;
      const bytes = Utilities.base64Decode(m[2]);
      const blob = Utilities.newBlob(bytes, m[1], (data.location || 'photo') + '_' + Date.now() + '_' + idx + '.jpg');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      urls.push('https://drive.google.com/uc?export=view&id=' + file.getId());
    });

    const row = [
      new Date(),
      data.siteName || '',
      data.inspector || '',
      data.date || '',
      data.area || '',
      data.category || '',
      data.location || '',
      data.status || '',
      data.note || '',
      urls[0] ? '=IMAGE("' + urls[0] + '")' : '',
      urls[0] || '', urls[1] || '', urls[2] || '', urls[3] || ''
    ];
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
