/**
 * 시설이력대장 - Google Apps Script
 *
 * 사용 파일:
 * 1) Code.gs      : 이 파일 내용 붙여넣기
 * 2) Index.html   : Apps Script에서 HTML 파일 이름을 "Index"로 만들고 붙여넣기
 *
 * 현재 사진 기준 기본값:
 * - 응답 시트 탭 이름: 설문지 응답 시트1
 * - 주요 열 제목: 타임스탬프, 시설ID, 시설명, 작업일자, 작업구분, 작업상태, 업체
 */

const CONFIG = {
  // 1. 구글시트 주소에서 /d/ 와 /edit 사이의 값을 넣으세요.
  // 예: https://docs.google.com/spreadsheets/d/abc123456/edit
  //     여기서 abc123456 부분만 넣습니다.
  SPREADSHEET_ID: '여기에_구글시트_ID를_넣으세요',

  // 2. 시설 기본정보 시트입니다. 없어도 작동하지만, 만들면 더 좋습니다.
  // 열 제목 예: 시설ID, 시설명, 위치, 관리부서, 비고
  FACILITY_SHEET_NAME: '시설목록',

  // 3. 구글폼 응답이 쌓이는 시트 탭 이름입니다.
  // 사진 기준으로는 "설문지 응답 시트1" 입니다.
  RESPONSE_SHEET_NAME: '설문지 응답 시트1',

  // 4. 구글폼 미리 채워진 링크를 넣으면 "새 이력 입력" 버튼이 시설ID를 자동 입력합니다.
  //
  // 가장 쉬운 방법:
  // 구글폼에서 시설ID에 FAC-001을 넣은 상태로 "미리 채워진 링크"를 만든 뒤,
  // 링크 안의 FAC-001 부분을 {{시설ID}} 로 바꿔서 아래에 붙여넣으세요.
  //
  // 예:
  // https://docs.google.com/forms/d/e/폼ID/viewform?usp=pp_url&entry.123456789={{시설ID}}
  //
  FORM_PREFILLED_URL_TEMPLATE: '',

  // 5. 위 4번을 쓰기 어렵다면 아래 방식도 가능합니다.
  // FORM_BASE_URL 예:
  // https://docs.google.com/forms/d/e/폼ID/viewform?usp=pp_url
  FORM_BASE_URL: '',
  ENTRY_FACILITY_ID: '',
  ENTRY_FACILITY_NAME: ''
};

/**
 * QR 스캔 시 열리는 웹 페이지
 * 예: https://script.google.com/macros/s/배포ID/exec?id=FAC-001
 */
function doGet(e) {
  const id = String((e && e.parameter && e.parameter.id) || '').trim();

  const template = HtmlService.createTemplateFromFile('Index');
  template.facilityId = id;
  template.pageTitle = '시설 이력 조회';

  return template
    .evaluate()
    .setTitle('시설 이력 조회')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 화면에서 호출하는 데이터 조회 함수
 */
function getPageData(id) {
  id = String(id || '').trim();

  if (!id) {
    throw new Error('시설ID가 없습니다. QR 주소 끝에 ?id=FAC-001 형식이 필요합니다.');
  }

  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID.indexOf('여기에_') === 0) {
    throw new Error('Code.gs 상단 CONFIG.SPREADSHEET_ID에 구글시트 ID를 넣어야 합니다.');
  }

  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  const responseSheet = ss.getSheetByName(CONFIG.RESPONSE_SHEET_NAME);
  if (!responseSheet) {
    throw new Error('응답 시트를 찾을 수 없습니다: ' + CONFIG.RESPONSE_SHEET_NAME);
  }

  const responseTable = readTable_(responseSheet);
  const responseIdCol = findHeader_(responseTable.headers, [
    '시설ID',
    '시설Id',
    '시설 id',
    'Facility ID',
    'facility_id',
    'facilityId'
  ]);

  if (responseIdCol === -1) {
    throw new Error('응답 시트 첫 줄에 "시설ID" 열 제목이 필요합니다.');
  }

  const matchedRows = responseTable.rows.filter(function(row) {
    return normalizeId_(row[responseIdCol]) === normalizeId_(id);
  });

  const facility = getFacility_(ss, id, responseTable, matchedRows);

  const histories = matchedRows
    .map(function(row) {
      return normalizeHistory_(responseTable.headers, row);
    })
    .reverse();

  return {
    ok: true,
    facility: facility,
    histories: histories,
    formUrl: makeFormUrl_(id, facility),
    count: histories.length,
    updatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
  };
}

/**
 * 시트 데이터를 표 형태로 읽기
 */
function readTable_(sheet) {
  const range = sheet.getDataRange();
  const values = range.getDisplayValues();

  if (!values || values.length === 0) {
    return {
      headers: [],
      rows: []
    };
  }

  const headers = values[0].map(function(value) {
    return String(value || '').trim();
  });

  const rows = values.slice(1).filter(function(row) {
    return row.some(function(cell) {
      return String(cell || '').trim() !== '';
    });
  });

  return {
    headers: headers,
    rows: rows
  };
}

/**
 * 시설목록 시트에서 시설 기본정보 찾기
 * 시설목록 시트가 없으면 응답 시트의 최신 자료에서 시설명을 가져옵니다.
 */
function getFacility_(ss, id, responseTable, matchedRows) {
  const facility = {
    시설ID: id,
    시설명: '',
    위치: '',
    관리부서: '',
    비고: ''
  };

  const facilitySheet = ss.getSheetByName(CONFIG.FACILITY_SHEET_NAME);

  if (facilitySheet) {
    const facilityTable = readTable_(facilitySheet);
    const facilityIdCol = findHeader_(facilityTable.headers, [
      '시설ID',
      '시설Id',
      '시설 id',
      'Facility ID',
      'facility_id',
      'facilityId'
    ]);

    if (facilityIdCol !== -1) {
      const found = facilityTable.rows.find(function(row) {
        return normalizeId_(row[facilityIdCol]) === normalizeId_(id);
      });

      if (found) {
        return {
          시설ID: pick_(facilityTable.headers, found, ['시설ID', '시설Id', 'Facility ID']) || id,
          시설명: pick_(facilityTable.headers, found, ['시설명', '시설명칭', '설비명', '장비명', '이름']) || '',
          위치: pick_(facilityTable.headers, found, ['위치', '설치위치', '장소', '층', '구역']) || '',
          관리부서: pick_(facilityTable.headers, found, ['관리부서', '담당부서', '부서', '관리팀']) || '',
          비고: pick_(facilityTable.headers, found, ['비고', '메모', '특이사항']) || ''
        };
      }
    }
  }

  // 시설목록 시트가 없거나 해당 ID가 없으면, 응답 시트의 마지막 응답에서 기본정보를 가져옵니다.
  if (matchedRows.length > 0) {
    const latest = matchedRows[matchedRows.length - 1];

    facility.시설명 = pick_(responseTable.headers, latest, ['시설명', '시설명칭', '설비명', '장비명', '이름']) || '';
    facility.위치 = pick_(responseTable.headers, latest, ['위치', '설치위치', '장소', '층', '구역']) || '';
    facility.관리부서 = pick_(responseTable.headers, latest, ['관리부서', '담당부서', '부서', '관리팀']) || '';
    facility.비고 = pick_(responseTable.headers, latest, ['비고', '메모', '특이사항']) || '';
  }

  return facility;
}

/**
 * 응답 시트 한 줄을 화면 표시용 이력 데이터로 변환
 */
function normalizeHistory_(headers, row) {
  return {
    timestamp: pick_(headers, row, ['타임스탬프', 'Timestamp', '제출시간', '제출일시']),
    facilityId: pick_(headers, row, ['시설ID', '시설Id', 'Facility ID', 'facility_id']),
    facilityName: pick_(headers, row, ['시설명', '시설명칭', '설비명', '장비명', '이름']),
    workDate: pick_(headers, row, ['작업일자', '점검일자', '수리일자', '일자', '날짜']),
    workType: pick_(headers, row, ['작업구분', '점검구분', '구분', '유형']),
    status: pick_(headers, row, ['작업상태', '상태', '점검상태', '조치상태']),
    company: pick_(headers, row, ['업체', '작업업체', '시공업체', '점검업체']),
    worker: pick_(headers, row, ['작업자', '조치자', '담당자', '점검자']),
    contents: pick_(headers, row, ['작업내용', '점검내용', '조치내용', '내용', '상세내용']),
    photoUrl: pick_(headers, row, ['사진URL', '사진 Url', '사진 링크', '사진', '첨부파일', '파일']),
    notes: pick_(headers, row, ['비고', '메모', '특이사항'])
  };
}

/**
 * 새 이력 입력용 구글폼 URL 만들기
 */
function makeFormUrl_(id, facility) {
  const encodedId = encodeURIComponent(id);
  const encodedName = encodeURIComponent((facility && facility.시설명) || '');

  let template = String(CONFIG.FORM_PREFILLED_URL_TEMPLATE || '').trim();

  if (template) {
    // 권장 방식: 링크 안에 {{시설ID}} 토큰 사용
    template = replaceAll_(template, '{{시설ID}}', encodedId);
    template = replaceAll_(template, '{{FACILITY_ID}}', encodedId);
    template = replaceAll_(template, '{{시설명}}', encodedName);
    template = replaceAll_(template, '{{FACILITY_NAME}}', encodedName);

    // 사용자가 FAC-001로 미리 채운 링크를 그대로 넣은 경우를 위한 보조 처리
    template = replaceAll_(template, 'FAC-001', encodedId);

    return template;
  }

  const baseUrl = String(CONFIG.FORM_BASE_URL || '').trim();
  const entryFacilityId = String(CONFIG.ENTRY_FACILITY_ID || '').trim();
  const entryFacilityName = String(CONFIG.ENTRY_FACILITY_NAME || '').trim();

  if (baseUrl && entryFacilityId) {
    let url = baseUrl;
    url += appendSeparator_(url);
    url += entryFacilityId + '=' + encodedId;

    if (entryFacilityName && encodedName) {
      url += '&' + entryFacilityName + '=' + encodedName;
    }

    return url;
  }

  return '';
}

function appendSeparator_(url) {
  if (url.indexOf('?') === -1) {
    return '?';
  }

  const last = url.substring(url.length - 1);
  if (last === '?' || last === '&') {
    return '';
  }

  return '&';
}

function pick_(headers, row, candidates) {
  const col = findHeader_(headers, candidates);

  if (col === -1) {
    return '';
  }

  return String(row[col] || '').trim();
}

function findHeader_(headers, candidates) {
  const normalizedHeaders = headers.map(function(header) {
    return normalizeHeader_(header);
  });

  for (let i = 0; i < candidates.length; i++) {
    const target = normalizeHeader_(candidates[i]);
    const found = normalizedHeaders.indexOf(target);

    if (found !== -1) {
      return found;
    }
  }

  return -1;
}

function normalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function normalizeId_(value) {
  return String(value || '')
    .trim()
    .toUpperCase();
}

function replaceAll_(text, searchValue, replaceValue) {
  return String(text).split(searchValue).join(replaceValue);
}
