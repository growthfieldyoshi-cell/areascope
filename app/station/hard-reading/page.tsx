'use client';

import { useState } from 'react';
import Link from 'next/link';

// export const metadata は 'use client' と共存不可のため、別途 layout or generateMetadata で対応
// → metadata は下記の Head 相当で代替せず、next/head 不使用の App Router では
//   同ディレクトリに layout.tsx を置くか、ページ自体を Server Component にする必要がある。
//   今回はインタラクション優先のため、metadata は別ファイルで対応。

type HardReadingStation = {
  slug: string;
  name: string;
  reading: string;
  prefecture: string;
};

const HARD_READING_STATIONS: HardReadingStation[] = [
  { slug: 'houshutsu-osaka-oosakashi',        name: '放出',       reading: 'ほうしゅつ',         prefecture: '大阪府' },
  { slug: 'kirenuriwari-osaka-oosakashi',     name: '喜連瓜破',   reading: 'きれうりわり',       prefecture: '大阪府' },
  { slug: 'okachimachi-tokyo-taitouku',       name: '御徒町',     reading: 'おかちまち',         prefecture: '東京都' },
  { slug: 'uguisudani-tokyo-taitouku',        name: '鶯谷',       reading: 'うぐいすだに',       prefecture: '東京都' },
  { slug: 'sendagaya-tokyo-shibuyaku',        name: '千駄ヶ谷',   reading: 'せんだがや',         prefecture: '東京都' },
  { slug: 'zoushiki-tokyo-ootaku',            name: '雑色',       reading: 'ざっしょく',         prefecture: '東京都' },
  { slug: 'koujiya-tokyo-ootaku',             name: '糀谷',       reading: 'こうじや',           prefecture: '東京都' },
  { slug: 'yaguchiwatari-tokyo-ootaku',       name: '矢口渡',     reading: 'やぐちのわたし',     prefecture: '東京都' },
  { slug: 'yuutenji-tokyo-meguroku',          name: '祐天寺',     reading: 'ゆうてんじ',         prefecture: '東京都' },
  { slug: 'obusuma-saitama-yoriimachi',       name: '男衾',       reading: 'おぶすま',           prefecture: '埼玉県' },
  { slug: 'musashiarashiyama-saitama-arashiyamamachi', name: '武蔵嵐山', reading: 'むさしらんざん', prefecture: '埼玉県' },
  { slug: 'moro-saitama-moroyamamachi',       name: '毛呂',       reading: 'もろ',               prefecture: '埼玉県' },
  { slug: 'hannou-saitama-hannoushi',         name: '飯能',       reading: 'はんのう',           prefecture: '埼玉県' },
  { slug: 'ogose-saitama-ogosemachi',         name: '越生',       reading: 'おごせ',             prefecture: '埼玉県' },
  { slug: 'shijounawate-osaka-daitoushi',     name: '四条畷',     reading: 'しじょうなわて',     prefecture: '大阪府' },
  { slug: 'taishihashiimaichi-osaka-moriguchishi', name: '太子橋今市', reading: 'たいしばしいまいち', prefecture: '大阪府' },
  { slug: 'noenaidai-osaka-oosakashi',        name: '野江内代',   reading: 'のえうちんだい',     prefecture: '大阪府' },
  { slug: 'shigino-osaka-oosakashi',          name: '鴫野',       reading: 'しぎの',             prefecture: '大阪府' },
  { slug: 'gamoushiteime-osaka-oosakashi',    name: '蒲生四丁目', reading: 'がもうよんちょうめ', prefecture: '大阪府' },
  { slug: 'midorihashi-osaka-oosakashi',      name: '緑橋',       reading: 'みどりきょう',       prefecture: '大阪府' },
  { slug: 'kounoshi-osaka-katanoshi',         name: '交野市',     reading: 'かたのし',           prefecture: '大阪府' },
  { slug: 'kawauchiiwafune-osaka-katanoshi',  name: '河内磐船',   reading: 'かわちいわふね',     prefecture: '大阪府' },
  { slug: 'hirakatashi-osaka-hirakatashi',    name: '枚方市',     reading: 'ひらかたし',         prefecture: '大阪府' },
  { slug: 'oosakatenmanguu-osaka-oosakashi',  name: '大阪天満宮', reading: 'おおさかてんまんぐう', prefecture: '大阪府' },
];

export default function HardReadingPage() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggle = (slug: string) => {
    setRevealed((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .hr-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 640px) { .hr-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          読めたら凄い！日本の<span style={{ color: '#00d4aa' }}>難読駅名</span>一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '8px' }}>
          日本全国には、地元の人でも戸惑う難読駅名が数多く存在します。漢字の見た目からは想像できない読み方の駅を24駅厳選しました。
        </p>
        <p style={{ color: '#00d4aa', fontSize: '15px', fontWeight: 700, marginBottom: '32px' }}>
          全 {HARD_READING_STATIONS.length} 駅、いくつ読めるか挑戦！
        </p>

        <div className="hr-grid">
          {HARD_READING_STATIONS.map((station) => {
            const isOpen = !!revealed[station.slug];
            return (
              <div
                key={station.slug}
                style={{
                  background: '#111827',
                  border: '1px solid #1e2d45',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{station.name}駅</div>
                <div style={{ color: '#6b7a99', fontSize: '12px' }}>{station.prefecture}</div>

                {isOpen ? (
                  <>
                    <div style={{ color: '#00d4aa', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
                      {station.reading}
                    </div>
                    <button
                      onClick={() => toggle(station.slug)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7a99',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                      }}
                    >
                      隠す &#9650;
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggle(station.slug)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00d4aa',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                      marginTop: '4px',
                    }}
                  >
                    読み方を見る &#9660;
                  </button>
                )}

                <Link
                  href={`/station/${station.slug}`}
                  style={{
                    color: '#00d4aa',
                    fontSize: '12px',
                    textDecoration: 'none',
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid #1e2d45',
                  }}
                >
                  駅の詳細を見る &rarr;
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '48px', background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '16px' }}>
            何駅読めましたか？駅の詳細はこちら
          </p>
          <Link
            href="/station/list"
            style={{
              display: 'inline-block',
              color: '#00d4aa',
              border: '1px solid #00d4aa',
              borderRadius: '6px',
              padding: '10px 24px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            駅一覧を見る &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
