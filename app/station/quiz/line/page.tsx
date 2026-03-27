'use client';

import { useState } from 'react';
import Link from 'next/link';

type QuizQuestion = {
  stationGroupSlug: string;
  stationName: string;
  correctLine: string;
  choices: string[];
  prefecture: string;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { stationGroupSlug: 'yuutenji-tokyo-meguroku',              stationName: '祐天寺',   correctLine: '東急東横線',     choices: ['東急東横線', '東急目黒線', '東急大井町線', '東急田園都市線'], prefecture: '東京都' },
  { stationGroupSlug: 'zoushiki-tokyo-ootaku',                stationName: '雑色',     correctLine: '京急本線',       choices: ['京急本線', '京急空港線', '東急多摩川線', '東急池上線'],     prefecture: '東京都' },
  { stationGroupSlug: 'koujiya-tokyo-ootaku',                 stationName: '糀谷',     correctLine: '京急空港線',     choices: ['京急本線', '京急空港線', '東急多摩川線', '都営浅草線'],     prefecture: '東京都' },
  { stationGroupSlug: 'yaguchiwatari-tokyo-ootaku',           stationName: '矢口渡',   correctLine: '東急多摩川線',   choices: ['東急多摩川線', '東急池上線', '東急目黒線', '京急本線'],     prefecture: '東京都' },
  { stationGroupSlug: 'fudoumae-tokyo-shinagawaku',           stationName: '不動前',   correctLine: '東急目黒線',     choices: ['東急東横線', '東急目黒線', '東急大井町線', '東急多摩川線'], prefecture: '東京都' },
  { stationGroupSlug: 'sendagaya-tokyo-shibuyaku',            stationName: '千駄ヶ谷', correctLine: 'JR中央線',       choices: ['JR中央線', 'JR山手線', 'JR総武線', '東京メトロ副都心線'], prefecture: '東京都' },
  { stationGroupSlug: 'uguisudani-tokyo-taitouku',            stationName: '鶯谷',     correctLine: 'JR山手線',       choices: ['JR山手線', 'JR中央線', 'JR総武線', '東京メトロ日比谷線'], prefecture: '東京都' },
  { stationGroupSlug: 'okachimachi-tokyo-taitouku',           stationName: '御徒町',   correctLine: 'JR山手線',       choices: ['JR山手線', 'JR中央線', '東京メトロ銀座線', '都営大江戸線'], prefecture: '東京都' },
  { stationGroupSlug: 'musashiarashiyama-saitama-arashiyamamachi', stationName: '武蔵嵐山', correctLine: '東武東上線', choices: ['東武東上線', '西武池袋線', 'JR八高線', '東武伊勢崎線'],   prefecture: '埼玉県' },
  { stationGroupSlug: 'obusuma-saitama-yoriimachi',           stationName: '男衾',     correctLine: '東武東上線',     choices: ['東武東上線', '西武池袋線', 'JR八高線', '東武伊勢崎線'],   prefecture: '埼玉県' },
];

export default function LineQuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const q = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === q.correctLine) {
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
    ? '路線マスター！鉄道通ですね'
    : correctCount >= 5
      ? 'なかなか詳しい！'
      : '路線図を見て勉強してみよう';

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
          この駅はどの路線？<br /><span style={{ color: '#00d4aa' }}>路線当て</span>クイズ
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '32px' }}>
          よく聞く駅名でも、どの路線にあるか正確に答えられますか？東京近郊を中心に、知ってるようで知らない駅と路線の関係を全{total}問で出題します。
        </p>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '32px' }}>
          <div style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '16px', fontFamily: 'monospace' }}>
            {currentIndex + 1} / {total}
          </div>

          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>この駅の代表的な路線はどれ？</div>
          <div style={{ fontSize: '36px', fontWeight: 800, marginBottom: '4px' }}>{q.stationName}駅</div>
          <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '24px' }}>{q.prefecture}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.choices.map((choice) => {
              const isCorrect = choice === q.correctLine;
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
              <div style={{ fontSize: '14px', marginBottom: '12px', color: selected === q.correctLine ? '#00d4aa' : '#ef4444', fontWeight: 700 }}>
                {selected === q.correctLine ? '正解！' : `不正解… 正解は「${q.correctLine}」`}
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
