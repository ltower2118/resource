const categories = [
  {
    key: "emergency-contact",
    title: "비상연락처",
    desc: "정전, 화재 등 비상 상황 시 연락할 담당자와 기관 목록",
    href: "/docs/emergency/입주사 긴급비상연락망.pdf",
    count: 1,
    ready: true,
    icon: PhoneIcon,
  },
  {
    key: "drawing",
    title: "도면",
    desc: "층별 평면도, 설비 배치도 등 건물 도면 자료",
    href: null,
    count: 0,
    ready: false,
    icon: BlueprintIcon,
  },
  {
    key: "history",
    title: "이력관리",
    desc: "설비 점검·수리·교체 이력 기록",
    href: null,
    count: 0,
    ready: false,
    icon: HistoryIcon,
  },
  {
    key: "manual",
    title: "매뉴얼",
    desc: "정전 대응, 정화조 고수위 조치 등 상황별 업무 매뉴얼",
    href: "/docs/manual/정전시 대응 메뉴얼.pdf",
    count: 2,
    ready: true,
    icon: BookIcon,
  },
  {
    key: "howto",
    title: "비상시 사용법",
    desc: "정전·복전 조작 순서, 현장 장비 사용 방법",
    href: "/docs/manual/정전 복전 방법.jpg",
    count: 1,
    ready: true,
    icon: BoltIcon,
  },
];

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M5 4h3.2l1.3 4.2-2 1.6a12 12 0 0 0 6.7 6.7l1.6-2 4.2 1.3V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 4Z" strokeLinejoin="round" />
    </svg>
  );
}
function BlueprintIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 3h14v14H3z" strokeLinejoin="round" />
      <path d="M7 3v14M3 9h14M11 9v8" />
      <path d="M17 7h4v14H7v-4" />
    </svg>
  );
}
function HistoryIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M12 8v5l3 2" />
      <path d="M4.6 9A8 8 0 1 1 5 15" />
      <path d="M3 4v5h5" />
    </svg>
  );
}
function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5A1.5 1.5 0 0 1 18.5 20H6.5A2.5 2.5 0 0 0 4 22.5" />
      <path d="M4 5.5v14A2.5 2.5 0 0 0 6.5 22" />
      <path d="M8 7.5h9M8 11h9" />
    </svg>
  );
}
function BoltIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M13 3 4.5 14h6L11 21l8.5-11h-6L13 3Z" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
function AlertIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3 22 20H2L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategoryCard({ item }) {
  const Icon = item.icon;
  const body = (
    <div
      className={
        "group h-full rounded-2xl border p-6 transition-colors " +
        (item.ready
          ? "border-[--color-navy-400]/30 bg-white hover:border-[--color-navy-800] hover:shadow-[0_4px_0_0_var(--color-navy-800)]"
          : "border-dashed border-[--color-navy-400]/40 bg-[--color-paper-2]")
      }
    >
      <div className="flex items-start justify-between">
        <div
          className={
            "flex h-14 w-14 items-center justify-center rounded-xl " +
            (item.ready ? "bg-[--color-navy-800] text-white" : "bg-white text-[--color-navy-400]")
          }
        >
          <Icon className="h-7 w-7" />
        </div>
        <span
          className={
            "rounded-full px-3 py-1 text-sm font-medium " +
            (item.ready
              ? "bg-[--color-amber-100] text-[--color-amber-600]"
              : "bg-white text-[--color-navy-400]")
          }
        >
          {item.ready ? `자료 ${item.count}건` : "준비 중"}
        </span>
      </div>

      <h3 className="mt-5 text-xl font-bold text-[--color-navy-900]">{item.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[--color-navy-600]">{item.desc}</p>

      <div
        className={
          "mt-6 flex items-center gap-1.5 text-[15px] font-semibold " +
          (item.ready ? "text-[--color-navy-800]" : "text-[--color-navy-400]")
        }
      >
        {item.ready ? "바로가기" : "자료 등록 예정"}
        {item.ready && (
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </div>
    </div>
  );

  if (!item.ready) {
    return <div aria-disabled="true">{body}</div>;
  }
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[--color-amber-600]/40"
    >
      {body}
    </a>
  );
}

export default function App() {
  const today = new Date();
  const dateLabel = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;

  return (
    <div className="min-h-screen">
      {/* 상단 헤더 */}
      <header className="border-b border-[--color-navy-400]/25 bg-[--color-navy-900]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium tracking-wide text-[--color-navy-400]">서울숲엘타워</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white">시설관리 정보공유 시스템</h1>
          </div>
          <p className="hidden text-sm text-[--color-navy-400] sm:block">{dateLabel} 기준</p>
        </div>
      </header>

      {/* 비상 상황 안내 바 — 시그니처 요소 */}
      <div className="bg-[--color-alert-700]">
        <a
          href="/docs/emergency/입주사 긴급비상연락망.pdf"
          target="_blank"
          rel="noreferrer"
          className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4 text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
        >
          <div className="flex items-center gap-3">
            <AlertIcon className="h-6 w-6 shrink-0" />
            <span className="text-[17px] font-semibold sm:text-lg">
              비상 상황이신가요? 긴급연락처를 바로 확인하세요
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-white/15 px-4 py-2 text-[15px] font-semibold whitespace-nowrap">
            연락처 보기
            <ArrowIcon className="h-4 w-4" />
          </span>
        </a>
      </div>

      {/* 히어로 */}
      <section className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <p className="text-[15px] font-semibold text-[--color-amber-600]">시설관리팀 안내</p>
        <h2 className="mt-3 max-w-2xl text-[32px] font-bold leading-snug text-[--color-navy-900] sm:text-[38px]">
          건물 운영에 필요한 정보를,
          <br />
          한 곳에서 확인하세요
        </h2>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[--color-navy-600]">
          비상연락처, 도면, 점검 이력, 업무 매뉴얼까지. 직원과 경비 근무자 누구나
          쉽게 찾아볼 수 있도록 정리했습니다. 아래 항목을 눌러 필요한 자료로
          이동하세요.
        </p>
      </section>

      {/* 카테고리 그리드 */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item) => (
            <CategoryCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-[--color-navy-400]/25 bg-[--color-paper-2]">
        <div className="mx-auto max-w-5xl px-6 py-8 text-[14px] text-[--color-navy-600]">
          <p className="font-semibold text-[--color-navy-900]">서울숲엘타워 관리사무소</p>
          <p className="mt-1">자료 문의 및 추가 등록 요청은 시설관리팀으로 연락 주세요.</p>
          <p className="mt-4 text-[13px] text-[--color-navy-400]">최종 업데이트 {dateLabel}</p>
        </div>
      </footer>
    </div>
  );
}
