
'use strict';

// LCD 공통 기본 설정
const DEFAULT = {
  showTime: true,
  showDate: true,
  timeSize: 112,
  timeColor: '#ffffff',
  timeFormat: '24s',
  timeFont: 'Arial',

  dateSize: 34,
  dateColor: '#ffffff',
  dateFont: 'Arial',
  datePosition: 'bottom-right',
  dateFormat: 'long',

  background: 'images/background.jpg',
  overlay: 15,

  messageEnabled: false,
  messageText: '',
  messageHtml: '',
  messageBlocks: [],

  clockSeconds: 60,
  messageSeconds: 15,
  messageSize: 100,
  messageColor: '#ffdd55',
  messageBackground: '#101827',
  messageFont: 'Malgun Gothic',
  messageAlign: 'center',

  startScreen: 'clock',
  version: '1'
};

const FONT_OPTIONS = [
  'Arial',
  'Malgun Gothic',
  'Noto Sans KR',
  'Georgia',
  'Courier New',
  'Times New Roman'
];

function fontValue(v) {
  return FONT_OPTIONS.includes(v)
    ? JSON.stringify(v) + ', sans-serif'
    : 'Arial, sans-serif';
}

// 기존 config.js 변수명 모두 지원
const apiUrl = () => String(
  window.SIGNAGE_API_URL ||
  window.LCD_API_URL ||
  ''
).trim();

function apiReady() {
  return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(apiUrl());
}

// Google Apps Script 설정 조회
function getRemote(timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    if (!apiReady()) {
      return reject(
        Error('config.js에 Apps Script /exec 주소를 넣으세요.')
      );
    }

    const callback =
      'lcdCallback' + Math.random().toString(36).slice(2);

    const tag = document.createElement('script');
    let done = false;

    const timer = setTimeout(() => {
      finish(
        Error(
          '설정 서버 응답 시간 초과 (' +
          Math.round(timeoutMs / 1000) +
          '초)'
        )
      );
    }, timeoutMs);

    function finish(err, value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      delete window[callback];
      tag.remove();

      if (err) reject(err);
      else resolve(value);
    }

    window[callback] = data => {
      if (data && data.ok) {
        const remote = data.config || {};

        // 이전 서버 설정과 V19 설정 모두 호환
        finish(null, {
          ...DEFAULT,
          ...remote,
          messageBlocks: Array.isArray(remote.messageBlocks)
            ? remote.messageBlocks
            : [],
          startScreen: remote.startScreen === 'message'
            ? 'message'
            : 'clock'
        });
      } else {
        finish(
          Error(
            (data && data.error) ||
            '설정 조회 실패'
          )
        );
      }
    };

    tag.onerror = () => {
      finish(Error('설정 서버 연결 실패'));
    };

    tag.src =
      apiUrl() +
      '?action=config&callback=' +
      encodeURIComponent(callback) +
      '&_=' + Date.now();

    document.head.appendChild(tag);
  });
}

// 한국 시간 기준 날짜와 시간
function nowParts() {
  return Object.fromEntries(
    new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date()).map(x => [
      x.type,
      x.value
    ])
  );
}

function fmtDate(c, p) {
  const y = p.year;
  const m = p.month;
  const d = p.day;
  const w = p.weekday;

  const formats = {
    long: `${y}년 ${Number(m)}월 ${Number(d)}일 ${w}`,
    short: `${y}.${m}.${d} (${w[0]})`,
    iso: `${y}-${m}-${d}`,
    slash: `${y}/${m}/${d}`,
    month: `${Number(m)}월 ${Number(d)}일 ${w}`
  };

  return formats[c.dateFormat] || formats.long;
}

function fmtTime(c, p) {
  let h = p.hour;

  if (String(c.timeFormat).startsWith('12')) {
    const n = Number(h);
    h =
      (n < 12 ? '오전 ' : '오후 ') +
      String(n % 12 || 12).padStart(2, '0');
  }

  return h + ':' + p.minute +
    (String(c.timeFormat).endsWith('s')
      ? ':' + p.second
      : '');
}

// 안전한 문자 HTML 서식 처리
function safeMessageHtml(raw) {
  const root = document.createElement('div');
  root.innerHTML = String(raw || '');

  root.querySelectorAll(
    'script,style,iframe,object,embed,svg,math,' +
    'form,input,button,img,video,audio,link,meta'
  ).forEach(n => n.remove());

  const allow = new Set([
    'B', 'STRONG', 'I', 'EM', 'U', 'BR',
    'DIV', 'P', 'SPAN', 'MARK', 'FONT',
    'S', 'STRIKE'
  ]);

  const safeColor = v =>
    /^#[0-9a-f]{3,6}$/i.test(v) ||
    /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0?\.\d+|1))?\s*\)$/i.test(v);

  const safeSize = v =>
    /^(?:50|75|100|125|150|200)%$/.test(v) ||
    (/^(\d{1,3})px$/.test(v) &&
      Number(v.slice(0, -2)) >= 12 &&
      Number(v.slice(0, -2)) <= 240);

  function clean(node) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType !== 1) continue;

      if (!allow.has(child.tagName)) {
        child.replaceWith(
          document.createTextNode(child.textContent || '')
        );
        continue;
      }

      const st = child.style;
      const color = st.color ||
        (child.tagName === 'FONT'
          ? child.getAttribute('color') || ''
          : '');

      const bg = st.backgroundColor;
      const size = st.fontSize;
      const align = st.textAlign;
      const font = st.fontFamily;
      const weight = st.fontWeight;
      const decoration = st.textDecoration;

      [...child.attributes].forEach(a =>
        child.removeAttribute(a.name)
      );

      if (safeColor(color)) child.style.color = color;
      if (safeColor(bg)) child.style.backgroundColor = bg;
      if (safeSize(size)) child.style.fontSize = size;

      if (['bold', '700', '800', '900'].includes(weight)) {
        child.style.fontWeight = weight;
      }

      if (['underline', 'line-through'].includes(decoration)) {
        child.style.textDecoration = decoration;
      }

      if (FONT_OPTIONS.some(
        f => font.replace(/["']/g, '').trim() === f
      )) {
        child.style.fontFamily = font;
      }

      if (['left', 'center', 'right'].includes(align)) {
        child.style.textAlign = align;
      }

      if (child.tagName === 'FONT') {
        const span = document.createElement('span');
        span.setAttribute(
          'style',
          child.getAttribute('style') || ''
        );

        while (child.firstChild) {
          span.appendChild(child.firstChild);
        }

        child.replaceWith(span);
        clean(span);
        continue;
      }

      clean(child);
    }
  }

  clean(root);
  return root.innerHTML.slice(0, 12000);
}

function escapeMessage(s) {
  const d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML.replace(/\n/g, '<br>');
}

function messageMarkup(c) {
  return safeMessageHtml(
    c.messageHtml ||
    escapeMessage(c.messageText || '')
  );
}

function messageAlignment(c) {
  return ['left', 'center', 'right'].includes(c.messageAlign)
    ? c.messageAlign
    : 'center';
}
