일본어 플래시카드 설치 방법

1. Google Sheets에서 새 스프레드시트를 만듭니다.
2. 확장 프로그램 > Apps Script를 엽니다.
3. 기본 Code.gs 내용을 모두 지우고, 제공된 Code.gs 전체를 붙여넣고 저장합니다.
4. Apps Script 우측 상단 '배포' > '새 배포' > 유형 '웹 앱'을 선택합니다.
5. 실행 사용자: 나 / 액세스 권한: 모든 사용자 로 설정 후 배포합니다.
6. 생성된 웹 앱 URL(https://script.google.com/macros/s/.../exec)을 복사합니다.
7. index.html에서 아래 줄을 찾습니다.
   const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   따옴표 안을 복사한 웹 앱 URL로 바꿉니다.
8. GitHub 저장소를 만들고 index.html을 업로드합니다.
9. GitHub 저장소 Settings > Pages > Deploy from a branch > main / (root) > Save.
10. 생성된 GitHub Pages 주소를 휴대폰/PC에서 엽니다.

Google Sheet의 cards 탭은 최초 웹 요청 때 자동 생성됩니다.
시트에 직접 단어를 넣을 때는 ID가 필요합니다. 가장 쉬운 방법은 웹에서 먼저 카드를 추가한 뒤 시트에서 일본어/뜻 등을 수정하는 것입니다.
웹의 '시트 새로고침'을 누르면 시트에서 직접 변경한 내용이 다시 표시됩니다.

열 구조:
ID | 종류 | 일본어 | 읽는법 | 한국어 | 메모 | 정답횟수 | 오답횟수 | 마지막학습일 | 수정일
