import Link from 'next/link';

const sectionStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '28px',
  marginBottom: '24px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 700 as const,
  color: '#00d4aa',
  marginBottom: '16px',
};

const h3Style = {
  fontSize: '16px',
  fontWeight: 700 as const,
  color: '#e8edf5',
  marginBottom: '10px',
};

const pStyle = {
  color: '#aaa',
  fontSize: '15px',
  lineHeight: 1.8,
  marginBottom: '12px',
};

const linkStyle = {
  color: '#00d4aa',
  textDecoration: 'underline' as const,
};

const TOP20 = [
  { rank: 1,  name: '新宿',   passengers: '約100万人', slug: 'shinjuku-tokyo-shinjukuku' },
  { rank: 2,  name: '渋谷',   passengers: '約83万人',  slug: 'shibuya-tokyo-shibuyaku' },
  { rank: 3,  name: '池袋',   passengers: '約78万人',  slug: null },
  { rank: 4,  name: '東京',   passengers: '約57万人',  slug: 'toukyou-tokyo-chiyodaku' },
  { rank: 5,  name: '品川',   passengers: '約52万人',  slug: null },
  { rank: 6,  name: '新橋',   passengers: '約42万人',  slug: null },
  { rank: 7,  name: '秋葉原', passengers: '約38万人',  slug: null },
  { rank: 8,  name: '高田馬場', passengers: '約35万人', slug: null },
  { rank: 9,  name: '上野',   passengers: '約31万人',  slug: null },
  { rank: 10, name: '北千住', passengers: '約30万人',  slug: null },
  { rank: 11, name: '中目黒', passengers: '約28万人',  slug: null },
  { rank: 12, name: '目黒',   passengers: '約27万人',  slug: null },
  { rank: 13, name: '大崎',   passengers: '約26万人',  slug: null },
  { rank: 14, name: '代々木上原', passengers: '約25万人', slug: null },
  { rank: 15, name: '五反田', passengers: '約24万人',  slug: null },
  { rank: 16, name: '恵比寿', passengers: '約23万人',  slug: null },
  { rank: 17, name: '飯田橋', passengers: '約22万人',  slug: null },
  { rank: 18, name: '中野',   passengers: '約21万人',  slug: null },
  { rank: 19, name: '有楽町', passengers: '約20万人',  slug: null },
  { rank: 20, name: '田町',   passengers: '約19万人',  slug: null },
];

export default function TokyoStationRanking2023Page() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          東京都の駅<span style={{ color: '#00d4aa' }}>乗降者数</span>ランキング（2023年）
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          2023年、東京都で最も利用者が多い駅は新宿駅（約100万人/日）です。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          東京都には全国でも突出した乗降者数を持つ駅が集中しています。国土交通省「国土数値情報」の2023年データをもとに、東京都の駅別乗降者数ランキングTOP20と、上位駅の特徴・エリア分析への活用方法を解説します。最新の完全版ランキングは<Link href="/station-ranking/tokyo" style={linkStyle}>東京都の駅乗降者数ランキング（全件）</Link>から確認できます。
        </p>

        {/* TOP20テーブル */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>東京都の駅乗降者数ランキングTOP20（2023年）</h2>
          <p style={{ ...pStyle, marginBottom: '16px' }}>
            以下は2023年の東京都における駅別乗降者数ランキングです。同じ駅名に複数路線がある場合は合算した数値です。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1e2d45' }}>
                  {['順位', '駅名', '乗降者数（2023年）', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#aaa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOP20.map((s) => (
                  <tr key={s.rank} style={{ borderBottom: '1px solid #1e2d45' }}>
                    <td style={{ padding: '10px 16px', color: s.rank <= 3 ? '#00d4aa' : '#aaa', fontWeight: s.rank <= 3 ? 'bold' : 'normal' }}>
                      {s.rank}位
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 'bold' }}>
                      {s.slug ? (
                        <Link href={`/station/${s.slug}`} style={{ color: '#e8edf5', textDecoration: 'none' }}>{s.name}駅</Link>
                      ) : (
                        <span>{s.name}駅</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 16px' }}>{s.passengers}</td>
                    <td style={{ padding: '10px 16px' }}>
                      {s.slug && (
                        <Link href={`/station/${s.slug}`} style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.85rem', border: '1px solid #00d4aa', borderRadius: '4px', padding: '4px 10px' }}>
                          詳細
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分析 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>なぜこの順位になるのか</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>新宿駅が1位の理由</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/shinjuku-tokyo-shinjukuku" style={linkStyle}>新宿駅</Link>はJR・私鉄・地下鉄合わせて10路線以上が乗り入れる日本最大のターミナル駅です。乗り換え需要が非常に大きく、通勤・通学客に加えて商業施設への来街者も膨大です。1日100万人を超える乗降者数は、静岡市の全人口に匹敵する規模です。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>渋谷・池袋が上位に並ぶ理由</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/shibuya-tokyo-shibuyaku" style={linkStyle}>渋谷駅</Link>はJR・東急・東京メトロ・京王が交差する巨大ターミナルで、再開発が進行中です。池袋駅はJR・東武・西武・東京メトロが集中し、埼玉方面からの通勤客が多い駅です。いずれも複数路線の結節点であることが乗降者数の多さに直結しています。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>東京駅の特徴</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              <Link href="/station/toukyou-tokyo-chiyodaku" style={linkStyle}>東京駅</Link>は新幹線・在来線が集まる日本の鉄道の中心です。乗降者数では新宿に次ぎますが、長距離移動の起点としての役割が大きい点が特徴です。周辺はオフィス街であり、ビジネス需要が中心です。
            </p>
          </div>
        </div>

        {/* エリア解説 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>上位駅周辺のエリア特徴</h2>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>ターミナル駅周辺（新宿・渋谷・池袋）</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              交通利便性は極めて高いですが、住環境としては混雑・騒音・家賃の高さが課題です。乗降者数30万人を超える駅の周辺は、商業・来街者向けの施設が中心で、住民の日常利用に向いた商業集積とは性質が異なる傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={h3Style}>中規模駅周辺（中野・恵比寿・飯田橋など）</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数15〜25万人程度の駅は、交通利便性と住環境のバランスが取れやすい傾向があります。商業施設も住民向けが一定揃い、生活拠点としての実用性が高いケースが多いです。
            </p>
          </div>

          <div>
            <h3 style={h3Style}>住みやすさとのバランス</h3>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が多い＝住みやすいとは限りません。住環境を重視するなら、ターミナル駅から1〜2駅離れた中規模駅周辺がコストと利便性のバランスが取れやすい傾向があります。エリアの人口推移と合わせて確認すると、居住需要の実態がより正確に把握できます。
            </p>
          </div>
        </div>

        {/* データの見方 */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数データの見方</h2>
          <p style={pStyle}>
            乗降者数は国土交通省「国土数値情報」に基づく2023年のデータです。各鉄道事業者が独自に算出しており、事業者間で厳密な比較が難しい場合があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            AreaScopeでは各駅の時系列推移を確認できるため、コロナ前後の回復度合いや長期トレンドを把握するのにも活用できます。<Link href="/station-ranking/tokyo" style={linkStyle}>東京都の駅ランキング（全件）</Link>では100位までの完全版を掲載しています。
          </p>
        </div>

        {/* まとめ */}
        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={pStyle}>
            2023年の東京都駅乗降者数ランキングでは、新宿・渋谷・池袋・東京の4駅が突出した利用者数を記録しています。これらはいずれも複数路線が交差するターミナル駅であり、乗り換え需要が乗降者数を押し上げています。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリア選びにおいては、乗降者数の絶対値だけでなく、駅のタイプ（ターミナル型か住宅駅型か）と人口推移を合わせて判断することが重要です。AreaScopeでは駅ごとの詳細データと市区町村の人口推移を合わせて確認できます。
          </p>
        </div>

        <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '24px' }}>
          全国の都道府県ランキング一覧は<Link href="/articles/prefecture-ranking" style={linkStyle}>都道府県別駅乗降者数ランキング一覧</Link>もご覧ください。
        </p>

        {/* CTA */}
        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>東京都の駅データを詳しく見る</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になる駅があれば、詳細データを確認してみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/station-ranking/tokyo" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              東京都の全駅ランキング
            </Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              駅一覧から探す
            </Link>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              市区町村の人口推移
            </Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
              他の記事を見る
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
