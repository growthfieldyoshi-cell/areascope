'use client';

import { useState } from 'react';
import Link from 'next/link';

type HardReadingCity = {
  name: string;
  reading: string;
  prefecture: string;
  prefectureSlug: string;
  municipalitySlug: string;
};

const HARD_READING_CITIES: HardReadingCity[] = [
  { name: '匝瑳市',   reading: 'そうさし',       prefecture: '千葉県', prefectureSlug: 'chiba',    municipalitySlug: 'sousashi' },
  { name: '四條畷市', reading: 'しじょうなわてし', prefecture: '大阪府', prefectureSlug: 'osaka',    municipalitySlug: 'shijounawateshi' },
  { name: '潮来市',   reading: 'いたこし',        prefecture: '茨城県', prefectureSlug: 'ibaraki',  municipalitySlug: 'itakoshi' },
  { name: '蒲郡市',   reading: 'がまごおりし',    prefecture: '愛知県', prefectureSlug: 'aichi',    municipalitySlug: 'gamagoorishi' },
  { name: '甲賀市',   reading: 'こうかし',        prefecture: '滋賀県', prefectureSlug: 'shiga',    municipalitySlug: 'kougashi' },
  { name: '弥富市',   reading: 'やとみし',        prefecture: '愛知県', prefectureSlug: 'aichi',    municipalitySlug: 'yatomishi' },
  { name: '揖斐川町', reading: 'いびがわちょう',  prefecture: '岐阜県', prefectureSlug: 'gifu',     municipalitySlug: 'ibigawamachi' },
  { name: '毛呂山町', reading: 'もろやままち',    prefecture: '埼玉県', prefectureSlug: 'saitama',  municipalitySlug: 'moroyamamachi' },
  { name: '嵐山町',   reading: 'らんざんまち',    prefecture: '埼玉県', prefectureSlug: 'saitama',  municipalitySlug: 'arashiyamamachi' },
  { name: '栗東市',   reading: 'りっとうし',      prefecture: '滋賀県', prefectureSlug: 'shiga',    municipalitySlug: 'rittoushi' },
  { name: '交野市',   reading: 'かたのし',        prefecture: '大阪府', prefectureSlug: 'osaka',    municipalitySlug: 'katanoshi' },
  { name: '枚方市',   reading: 'ひらかたし',      prefecture: '大阪府', prefectureSlug: 'osaka',    municipalitySlug: 'hirakatashi' },
  { name: '香取市',   reading: 'かとりし',        prefecture: '千葉県', prefectureSlug: 'chiba',    municipalitySlug: 'kandorishi' },
  { name: '鹿嶋市',   reading: 'かしまし',        prefecture: '茨城県', prefectureSlug: 'ibaraki',  municipalitySlug: 'kashimashi' },
  { name: '羽島市',   reading: 'はしまし',        prefecture: '岐阜県', prefectureSlug: 'gifu',     municipalitySlug: 'hashimashi' },
  { name: '上野原市', reading: 'うえのはらし',    prefecture: '山梨県', prefectureSlug: 'yamanashi', municipalitySlug: 'kaminoharashi' },
  { name: '旭市',     reading: 'あさひし',        prefecture: '千葉県', prefectureSlug: 'chiba',    municipalitySlug: 'asahishi' },
  { name: '横瀬町',   reading: 'よこぜまち',      prefecture: '埼玉県', prefectureSlug: 'saitama',  municipalitySlug: 'yokozemachi' },
  { name: '海津市',   reading: 'かいづし',        prefecture: '岐阜県', prefectureSlug: 'gifu',     municipalitySlug: 'kaizushi' },
  { name: '銚子市',   reading: 'ちょうしし',      prefecture: '千葉県', prefectureSlug: 'chiba',    municipalitySlug: 'choushishi' },
];

export default function HardReadingCityPage() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <style>{`
        .hrc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 640px) { .hrc-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
          読めたら凄い！日本の<span style={{ color: '#00d4aa' }}>難読市区町村名</span>一覧
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '8px' }}>
          日本には、地元の人でなければまず読めない市区町村名が数多くあります。漢字の見た目だけでは判断できない難読地名を20件厳選しました。
        </p>
        <p style={{ color: '#00d4aa', fontSize: '15px', fontWeight: 700, marginBottom: '32px' }}>
          全 {HARD_READING_CITIES.length} 市区町村、いくつ読めるか挑戦！
        </p>

        <div className="hrc-grid">
          {HARD_READING_CITIES.map((city) => {
            const key = `${city.prefectureSlug}-${city.municipalitySlug}`;
            const isOpen = !!revealed[key];
            return (
              <div
                key={key}
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
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{city.name}</div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>{city.prefecture}</div>

                {isOpen ? (
                  <>
                    <div style={{ color: '#00d4aa', fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
                      {city.reading}
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      style={{ background: 'none', border: 'none', color: '#6b7a99', fontSize: '12px', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                    >
                      隠す &#9650;
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggle(key)}
                    style={{ background: 'none', border: 'none', color: '#00d4aa', fontSize: '13px', cursor: 'pointer', padding: 0, textAlign: 'left', marginTop: '4px' }}
                  >
                    読み方を見る &#9660;
                  </button>
                )}

                <Link
                  href={`/city/${city.prefectureSlug}/${city.municipalitySlug}`}
                  style={{ color: '#00d4aa', fontSize: '12px', textDecoration: 'none', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e2d45' }}
                >
                  エリアの詳細を見る &rarr;
                </Link>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '48px', background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '15px', marginBottom: '16px' }}>
            何市区町村読めましたか？一覧はこちら
          </p>
          <Link
            href="/city"
            style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 24px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}
          >
            市区町村一覧を見る &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
