'use client';

import { useState } from 'react';
import Link from 'next/link';

type QuizQuestion = {
  stationGroupSlug: string;
  stationName: string;
  correctReading: string;
  choices: string[];
  prefecture?: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    stationGroupSlug: 'houshutsu-osaka-oosakashi',
    stationName: '放出',
    correctReading: 'ほうしゅつ',
    choices: ['はなてん', 'ほうしゅつ', 'はなで', 'ほうで'],
    prefecture: '大阪府',
  },
  {
    stationGroupSlug: 'kirenuriwari-osaka-oosakashi',
    stationName: '喜連瓜破',
    correctReading: 'きれうりわり',
    choices: ['きれうりわり', 'よしれうりわり', 'きつれうりはり', 'きれかぼちゃ'],
    prefecture: '大阪府',
  },
  {
    stationGroupSlug: 'okachimachi-tokyo-taitouku',
    stationName: '御徒町',
    correctReading: 'おかちまち',
    choices: ['おとまち', 'みかちまち', 'おかちまち', 'おとちょう'],
    prefecture: '東京都',
  },
  {
    stationGroupSlug: 'zoushiki-tokyo-ootaku',
    stationName: '雑色',
    correctReading: 'ざっしょく',
    choices: ['ざつしき', 'ざっしょく', 'まざいろ', 'ざつしょく'],
    prefecture: '東京都',
  },
  {
    stationGroupSlug: 'obusuma-saitama-yoriimachi',
    stationName: '男衾',
    correctReading: 'おぶすま',
    choices: ['おぶとん', 'おとこふすま', 'おぶすま', 'だんきん'],
    prefecture: '埼玉県',
  },
  {
    stationGroupSlug: 'noenaidai-osaka-oosakashi',
    stationName: '野江内代',
    correctReading: 'のえうちんだい',
    choices: ['のえないだい', 'のえうちんだい', 'やこうちだい', 'のこうちだい'],
    prefecture: '大阪府',
  },
  {
    stationGroupSlug: 'gamoushiteime-osaka-oosakashi',
    stationName: '蒲生四丁目',
    correctReading: 'がもうよんちょうめ',
    choices: ['かまおよんちょうめ', 'がもうよんちょうめ', 'ほほうしちょうめ', 'かまいよんちょうめ'],
    prefecture: '大阪府',
  },
  {
    stationGroupSlug: 'taishihashiimaichi-osaka-moriguchishi',
    stationName: '太子橋今市',
    correctReading: 'たいしばしいまいち',
    choices: ['たいしきょういまいち', 'たいこばしいまいち', 'たいしばしいまいち', 'おおこばしいまいち'],
    prefecture: '大阪府',
  },
  {
    stationGroupSlug: 'moro-saitama-moroyamamachi',
    stationName: '毛呂',
    correctReading: 'もろ',
    choices: ['けろ', 'もうろ', 'もろ', 'もうろく'],
    prefecture: '埼玉県',
  },
  {
    stationGroupSlug: 'koujiya-tokyo-ootaku',
    stationName: '糀谷',
    correctReading: 'こうじや',
    choices: ['こじや', 'こうじや', 'もやしたに', 'きじや'],
    prefecture: '東京都',
  },
];

export default function StationQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === q.correctReading) {
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
    ? '難読駅名マスター！'
    : correctCount >= 5
      ? 'なかなか読めてます！'
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
          あなたはいくつ読める？<br />日本の<span style={{ color: '#00d4aa' }}>難読駅名</span>クイズ
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          漢字の見た目からは想像できない読み方の駅が日本中に存在します。全{total}問の4択クイズで、あなたの難読駅名力を試してみましょう。
        </p>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '16px', fontFamily: 'monospace' }}>
            {currentIndex + 1} / {total}
          </div>

          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '4px' }}>{q.stationName}駅</div>
          {q.prefecture && <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '24px' }}>{q.prefecture}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.choices.map((choice) => {
              const isCorrect = choice === q.correctReading;
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
              <div style={{ fontSize: '14px', marginBottom: '16px', color: selected === q.correctReading ? '#00d4aa' : '#ef4444', fontWeight: 700 }}>
                {selected === q.correctReading ? '正解！' : `不正解… 正解は「${q.correctReading}」`}
              </div>
              <button
                onClick={handleNext}
                style={{ background: 'none', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 24px', color: '#00d4aa', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
              >
                {currentIndex + 1 >= total ? '結果を見る' : '次の問題へ'} &rarr;
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/station/hard-reading" style={{ color: '#6b7a99', fontSize: '12px', textDecoration: 'none' }}>
            難読駅名一覧を見る &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
