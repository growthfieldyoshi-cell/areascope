'use client';

import { useState } from 'react';
import Link from 'next/link';

type QuizQuestion = {
  stationGroupSlug: string;
  stationName: string;
  correctPrefecture: string;
  choices: string[];
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { stationGroupSlug: 'hakodate-hokkaido-hakodateshi',      stationName: '函館',   correctPrefecture: '北海道',   choices: ['北海道', '青森県', '岩手県', '秋田県'] },
  { stationGroupSlug: 'karuizawa-nagano-karuizawamachi',    stationName: '軽井沢', correctPrefecture: '長野県',   choices: ['群馬県', '埼玉県', '長野県', '新潟県'] },
  { stationGroupSlug: 'atami-shizuoka-atamishi',            stationName: '熱海',   correctPrefecture: '静岡県',   choices: ['神奈川県', '静岡県', '愛知県', '山梨県'] },
  { stationGroupSlug: 'ebina-kanagawa-ebinashi',            stationName: '海老名', correctPrefecture: '神奈川県', choices: ['東京都', '埼玉県', '神奈川県', '千葉県'] },
  { stationGroupSlug: 'kanazawa-ishikawa-kanazawashi',      stationName: '金沢',   correctPrefecture: '石川県',   choices: ['富山県', '石川県', '福井県', '新潟県'] },
  { stationGroupSlug: 'kouzan-gifu-takayamashi',            stationName: '高山',   correctPrefecture: '岐阜県',   choices: ['長野県', '岐阜県', '富山県', '愛知県'] },
  { stationGroupSlug: 'matsuyama-ehime-matsuyamashi',       stationName: '松山',   correctPrefecture: '愛媛県',   choices: ['高知県', '香川県', '愛媛県', '徳島県'] },
  { stationGroupSlug: 'hagi-yamaguchi-hagishi',             stationName: '萩',     correctPrefecture: '山口県',   choices: ['島根県', '広島県', '山口県', '鳥取県'] },
  { stationGroupSlug: 'beppu-oita-beppushi',                stationName: '別府',   correctPrefecture: '大分県',   choices: ['福岡県', '熊本県', '大分県', '宮崎県'] },
  { stationGroupSlug: 'ibusuki-kagoshima-ibusukishi',       stationName: '指宿',   correctPrefecture: '鹿児島県', choices: ['宮崎県', '熊本県', '大分県', '鹿児島県'] },
];

export default function PrefectureQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === q.correctPrefecture) {
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
    ? '都道府県マスター！'
    : correctCount >= 5
      ? 'なかなか詳しいですね！'
      : 'もう一度挑戦してみよう';

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
            <Link href="/station/hard-reading" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
              難読駅名一覧を見る &rarr;
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
          この駅どこにある？<br /><span style={{ color: '#00d4aa' }}>都道府県</span>当てクイズ
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          有名な駅でも、いざ「どの都道府県？」と聞かれると迷うことがあります。全{total}問の4択クイズで、あなたの地理力を試してみましょう。
        </p>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '16px', fontFamily: 'monospace' }}>
            {currentIndex + 1} / {total}
          </div>

          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>この駅はどの都道府県にある？</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>{q.stationName}駅</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.choices.map((choice) => {
              const isCorrect = choice === q.correctPrefecture;
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
              <div style={{ fontSize: '14px', marginBottom: '12px', color: selected === q.correctPrefecture ? '#00d4aa' : '#ef4444', fontWeight: 700 }}>
                {selected === q.correctPrefecture ? '正解！' : `不正解… 正解は「${q.correctPrefecture}」`}
              </div>
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
          <Link href="/station/quiz" style={{ color: '#6b7a99', fontSize: '12px', textDecoration: 'none' }}>
            難読駅名クイズに挑戦 &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
