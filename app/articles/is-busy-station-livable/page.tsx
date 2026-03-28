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

export default function IsBusyStationLivablePage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          駅の乗降者数が多い街は<br /><span style={{ color: '#00d4aa' }}>住みやすいのか？</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          乗降者数が多い＝住みやすい、ではありません。駅の「タイプ」によって住環境はまったく異なります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          人が多い街は活気があって便利そうに見えますが、それは「訪れる人にとって便利」であって「住む人にとって快適」かどうかは別の問題です。この記事では、乗降者数の多さと住みやすさの関係を、駅のタイプ別に整理します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>乗降者数と住みやすさは直結しない</h2>
          <p style={pStyle}>
            乗降者数が多い駅の周辺には商業施設が集まりやすく、交通利便性も高い傾向があります。しかしそれは住環境としてのメリットの一面にすぎません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            混雑・騒音・家賃の高さなど、乗降者数が多いからこそ発生するデメリットがあります。「人が多い＝住みやすい」という前提を見直すことが、エリア選びの精度を上げる第一歩です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>駅の3つのタイプ</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            乗降者数の規模と利用実態から、駅は大きく3タイプに分けられます。住みやすさの評価はタイプによって変わります。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① ターミナル型（30万人以上/日）</p>
            <p style={pStyle}>
              新宿・渋谷・池袋など、複数路線が交差する巨大駅です。交通の便は極めて良いですが、利用者の大半は乗り換え客・通勤客であり、駅周辺は商業・観光客向けの施設が中心です。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              住環境としては、終日の混雑、深夜までの繁華街の喧騒、高い家賃が課題になりやすい傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 住宅駅型（1〜5万人/日）</p>
            <p style={pStyle}>
              住民の通勤・通学・買い物利用が中心の駅です。駅前にスーパー・クリニック・ドラッグストアなど日常利用の施設が揃い、住環境としてのバランスが取れている傾向があります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              ただし運行本数が限られたり、商業の選択肢が少なかったりするケースもあります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ バランス型（5〜20万人/日）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              交通利便性・商業集積・住環境のバランスが取れやすいレンジです。ターミナルほどの混雑はなく、商業施設と生活インフラの両方がある程度揃っているケースが多く見られます。住みやすさを重視するなら、まずこのレンジの駅から検討するのが効率的です。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>混雑のデメリット</h2>
          <p style={pStyle}>
            乗降者数が多い駅では、朝夕のラッシュ時にホーム・改札・駅前が混雑します。通勤時間帯だけでなく、休日や夜間も人が多いエリアでは、日常的にストレスを感じやすくなります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            また、混雑するエリアは治安面の懸念も出やすくなります。人通りが多いことは防犯上のメリットにもなりますが、繁華街型の混雑はトラブルの発生率とも関連する傾向があります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>商業集積のメリットと落とし穴</h2>
          <p style={pStyle}>
            乗降者数が多い駅の周辺には飲食店・商業施設が集まりやすく、買い物や外食の選択肢が増えます。これは生活利便性として大きなメリットです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            ただし、集積している施設が「住民向け」か「来街者向け」かで意味が変わります。観光客やビジネス客向けの飲食店ばかりで、日常使いのスーパーやクリニックが少ないエリアでは、見かけの商業集積が住みやすさにつながらないケースがあります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：人が多い＝住みやすいという誤解</h2>
          <p style={pStyle}>
            「乗降者数ランキング上位の駅なら便利で住みやすいはず」と考えてターミナル駅の近くに引越した結果、混雑・騒音・家賃の高さに悩まされるケースは珍しくありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数の多さは「人の流れが多い」ことを示すだけで、「住む人にとって快適な環境」を保証するものではありません。駅のタイプを見分け、自分の生活スタイルとの相性を考えることが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補駅の規模感を確認できます。都道府県別に絞り込めるため、候補エリアの駅を効率よく比較できます。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅ページへアクセスすると、2011年〜2021年の乗降者数推移を確認できます。増加傾向か安定か減少かを10年スパンで把握できます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            エリアの人口動態は<Link href="/city" style={linkStyle}>市区町村一覧</Link>から確認できます。乗降者数と人口推移を見比べることで、そのエリアが「住む人に選ばれているか」の判断材料になります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数が多い街は便利ですが、住みやすいかどうかは駅のタイプ次第です。ターミナル型は混雑・騒音・コストの課題があり、住宅駅型は落ち着いているが選択肢が限られることもあります。バランス型（5〜20万人/日）を軸に、人口推移と合わせてデータで判断することが、後悔しないエリア選びにつながります。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>市区町村から探す</Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>駅から探す</Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>ランキングを見る</Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>他の記事を見る</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
