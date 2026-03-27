'use client';

import { useState } from 'react';
import Link from 'next/link';

type QuizQuestion = {
  stationGroupSlug: string;
  stationName: string;
  correctPassengers: string;
  choices: string[];
  description: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    stationGroupSlug: 'shinjuku-tokyo-shinjukuku',
    stationName: '新宿',
    correctPassengers: '約100万人',
    choices: ['約60万人', '約80万人', '約100万人', '約140万人'],
    description: '新宿駅は1日の利用者数が世界最大級のターミナル駅。100万人超えはおよそ静岡市の全人口に匹敵する規模です。',
  },
  {
    stationGroupSlug: 'shibuya-tokyo-shibuyaku',
    stationName: '渋谷',
    correctPassengers: '約83万人',
    choices: ['約40万人', '約60万人', '約83万人', '約120万人'],
    description: '渋谷駅は複数の路線が交差する大ターミナル。再開発が続く渋谷エリアの玄関口として多くの人が行き交います。',
  },
  {
    stationGroupSlug: 'yokohama-kanagawa-yokohamashi',
    stationName: '横浜',
    correctPassengers: '約61万人',
    choices: ['約30万人', '約61万人', '約90万人', '約120万人'],
    description: '横浜駅は神奈川県最大のターミナル駅。JR・私鉄・地下鉄が集まり、東京圏有数の乗降者数を誇ります。',
  },
  {
    stationGroupSlug: 'toukyou-tokyo-chiyodaku',
    stationName: '東京',
    correctPassengers: '約57万人',
    choices: ['約30万人', '約57万人', '約80万人', '約110万人'],
    description: '東京駅は新幹線・在来線が集まる日本の鉄道の中心。ビジネス・観光どちらの利用者も多い駅です。',
  },
  {
    stationGroupSlug: 'nagoya-aichi-nagoyashi',
    stationName: '名古屋',
    correctPassengers: '約29万人',
    choices: ['約15万人', '約29万人', '約45万人', '約70万人'],
    description: '名古屋駅は東海地方最大の拠点駅。新幹線・JR・私鉄・地下鉄が集まる中部圏の玄関口です。',
  },
  {
    stationGroupSlug: 'kyouto-kyoto-kyoutoshi',
    stationName: '京都',
    correctPassengers: '約26万人',
    choices: ['約10万人', '約26万人', '約45万人', '約60万人'],
    description: '京都駅は観光地への玄関口として国内外から多くの訪問者が利用。新幹線・在来線・地下鉄が乗り入れます。',
  },
  {
    stationGroupSlug: 'sendai-miyagi-sendaishi',
    stationName: '仙台',
    correctPassengers: '約14万人',
    choices: ['約5万人', '約14万人', '約25万人', '約40万人'],
    description: '仙台駅は東北地方最大の都市・仙台市の玄関口。東北新幹線の主要停車駅でもあります。',
  },
  {
    stationGroupSlug: 'sapporo-hokkaido-sapporoshi',
    stationName: '札幌',
    correctPassengers: '約13万人',
    choices: ['約5万人', '約13万人', '約25万人', '約40万人'],
    description: '札幌駅は北海道最大の都市の中心駅。北海道新幹線延伸も予定されており、今後さらに注目される駅です。',
  },
  {
    stationGroupSlug: 'hakata-fukuoka-fukuokashi',
    stationName: '博多',
    correctPassengers: '約10万人',
    choices: ['約4万人', '約10万人', '約20万人', '約35万人'],
    description: '博多駅は九州最大の都市・福岡市の中心駅。新幹線・JR・地下鉄が集まる九州の玄関口です。',
  },
  {
    stationGroupSlug: 'kanazawa-ishikawa-kanazawashi',
    stationName: '金沢',
    correctPassengers: '約3万人',
    choices: ['約1万人', '約3万人', '約8万人', '約15万人'],
    description: '金沢駅は北陸新幹線開業後に利用者が急増。加賀百万石の城下町への玄関口として観光客にも人気です。',
  },
];

export default function PassengersQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === q.correctPassengers) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  };

  const scoreComment = correctCount >= 8
    ? '乗降者数マスター！鉄道通ですね'
    : correctCount >= 5
      ? 'なかなかの感覚！'
      : '数字の感覚、鍛えてみよう';

  if (finished) {
    return (
      <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7a99', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px' }}>// 結果発表</div>
          <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>
            <span style={{ color: '#00d4aa' }}>{correctCount}</span> / {total}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '32px' }}>{scoreComment}</div>

          <button
            onClick={handleRetry}
            style={{ background: '#00d4aa', color: '#0a0e1a', border: 'none', borderRadius: '6px', padding: '12px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '32px' }}
          >
            もう一度挑戦する
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <Link href="/station/quiz" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
              難読駅名クイズに挑戦 &rarr;
            </Link>
            <Link href="/station-ranking" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
              駅乗降者数ランキングを見る &rarr;
            </Link>
            <Link href="/station/list" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
              駅一覧を見る &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          あなたの感覚は正しい？<br />駅の<span style={{ color: '#00d4aa' }}>乗降者数</span>クイズ
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          新宿や渋谷から地方の主要駅まで、1日にどれくらいの人が利用しているか知っていますか？全{total}問で日本の鉄道スケールを体感してみましょう。
        </p>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '16px', fontFamily: 'monospace' }}>
            {currentIndex + 1} / {total}
          </div>

          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>この駅は1日にどれくらいの人が利用している？</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>{q.stationName}駅</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.choices.map((choice) => {
              const isCorrect = choice === q.correctPassengers;
              const isSelected = choice === selected;
              let bg = '#0a0e1a';
              let borderColor = '#1e2d45';
              let textColor = '#e8edf5';

              if (selected !== null) {
                if (isCorrect) {
                  bg = 'rgba(0,212,170,0.15)';
                  borderColor = '#00d4aa';
                  textColor = '#00d4aa';
                } else if (isSelected && !isCorrect) {
                  bg = 'rgba(239,68,68,0.15)';
                  borderColor = '#ef4444';
                  textColor = '#ef4444';
                }
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={selected !== null}
                  style={{
                    background: bg,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '14px 20px',
                    color: textColor,
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: selected !== null ? 'default' : 'pointer',
                    textAlign: 'left',
                    opacity: selected !== null && !isCorrect && !isSelected ? 0.5 : 1,
                  }}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '14px', marginBottom: '12px', color: selected === q.correctPassengers ? '#00d4aa' : '#ef4444', fontWeight: 700 }}>
                {selected === q.correctPassengers ? '正解！' : `不正解… 正解は「${q.correctPassengers}」`}
              </div>
              <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px', textAlign: 'left' }}>
                {q.description}
              </p>
              <Link
                href={`/station/${q.stationGroupSlug}`}
                style={{ display: 'inline-block', color: '#6b7a99', fontSize: '12px', textDecoration: 'none', marginBottom: '16px' }}
              >
                この駅を見る &rarr;
              </Link>
              <div>
                <button
                  onClick={handleNext}
                  style={{ background: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 24px', color: '#00d4aa', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {currentIndex + 1 >= total ? '結果を見る' : '次の問題へ'} &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/station-ranking" style={{ color: '#6b7a99', fontSize: '12px', textDecoration: 'none' }}>
            駅乗降者数ランキングを見る &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
