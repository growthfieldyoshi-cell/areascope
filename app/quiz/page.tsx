import Link from 'next/link';

const QUIZ_CARDS = [
  {
    title: '難読駅名クイズ',
    description: '読めたら凄い。全国の難読駅名を4択で楽しくチェック',
    href: '/station/quiz',
  },
  {
    title: '難読市区町村名クイズ',
    description: '匝瑳・蒲郡など、読めそうで読めない地名に挑戦',
    href: '/city/quiz',
  },
  {
    title: '都道府県当てクイズ',
    description: 'この駅どこにある？有名駅の所在地を4択で当てよう',
    href: '/station/quiz/prefecture',
  },
  {
    title: '駅の乗降者数クイズ',
    description: '新宿や渋谷は1日に何人使う？駅の規模感を数字で体感',
    href: '/station/quiz/passengers',
  },
  {
    title: '路線当てクイズ',
    description: 'この駅はどの路線？知っているようで迷う駅を4択で出題',
    href: '/station/quiz/line',
  },
];

export default function QuizIndexPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .quiz-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .quiz-card:hover { border-color: #00d4aa !important; }
        @media (max-width: 640px) { .quiz-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          AreaScope <span style={{ color: '#00d4aa' }}>クイズ</span>一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '8px' }}>
          AreaScopeでは、駅名・地名・路線・乗降者数にまつわるクイズを複数用意しています。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '8px' }}>
          難読駅名や難読地名の読み方、有名駅の所在都道府県、1日の利用者数の規模感など、知っているようで意外と答えられない問題ばかりです。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          すべて4択形式・各10問。気軽に挑戦してみてください。
        </p>

        <div className="quiz-grid">
          {QUIZ_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="quiz-card"
              style={{
                background: '#111827',
                border: '1px solid #1e2d45',
                borderRadius: '12px',
                padding: '28px',
                textDecoration: 'none',
                color: '#e8edf5',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{card.title}</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>{card.description}</div>
              <div style={{ color: '#00d4aa', fontSize: '13px', marginTop: 'auto', paddingTop: '8px' }}>
                挑戦する &rarr;
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '48px', borderTop: '1px solid #1e2d45', paddingTop: '24px' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 関連ページ</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/station/hard-reading" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>難読駅名一覧</Link>
            <Link href="/city/hard-reading" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>難読市区町村名一覧</Link>
            <Link href="/station/list" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>駅一覧</Link>
            <Link href="/city" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '13px' }}>市区町村一覧</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
