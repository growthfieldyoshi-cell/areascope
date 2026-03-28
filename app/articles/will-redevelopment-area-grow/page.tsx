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

export default function WillRedevelopmentAreaGrowPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          再開発エリアは本当に伸びるのか？<br /><span style={{ color: '#00d4aa' }}>データで解説</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          再開発＝伸びるとは限りません。一時的な増加で終わるケースと、構造的に成長が続くケースはデータで見分けられます。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          駅前の大型開発やタワーマンション建設が話題になると「あのエリアは伸びる」という期待が高まります。しかし、再開発後に本当にエリアが成長し続けるかどうかは、開発の内容だけでは判断できません。この記事では、人口と乗降者数のデータから再開発エリアの実態を見極める方法を解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>再開発後の3パターン</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            再開発が行われたエリアのその後は、大きく3つのパターンに分かれます。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 定着・成長型</p>
            <p style={pStyle}>
              再開発をきっかけに人口が増加し、その後も継続的に増え続けるパターンです。交通インフラの整備、商業施設の集積、周辺エリアへの波及効果が複合的に作用しているケースに多く見られます。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数も再開発前から右肩上がりが続いており、人口推移と合わせて長期トレンドが確認できるのが特徴です。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 一時増加・横ばい型</p>
            <p style={pStyle}>
              大型マンションの竣工で人口が一時的に急増するものの、その後は横ばいに転じるパターンです。入居が一巡すると新たな転入が減り、エリア全体の需要が伸びているわけではなかったことが分かります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数も竣工直後に増えた後、横ばいまたは微減になるケースがあります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 一時増加・反転型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              再開発直後は増加するものの、数年後に減少に転じるパターンです。周辺のインフラ整備が追いつかなかった、商業施設が定着しなかった、居住者のニーズと開発内容にミスマッチがあったなどの要因が考えられます。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：再開発が始まった＝伸びると判断するケース</h2>
          <p style={pStyle}>
            「再開発計画が発表された」「タワーマンションが建つ」というニュースだけで、エリアの将来性を確信してしまうのは最も危険なパターンです。
          </p>
          <p style={pStyle}>
            再開発は人を「一時的に集める」効果はありますが、「継続的に住み続けたい街」になるかどうかは別の問題です。開発内容が住民向けではなく商業・オフィス中心だった場合、居住需要にはつながりにくい傾向があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            計画の規模ではなく、実際のデータの推移で判断することが不可欠です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データでどう判断するか</h2>
          <p style={pStyle}>
            まず確認すべきは、再開発の「前後」で人口推移がどう変わったかです。再開発前から緩やかに増加しており、再開発後も増加ペースが維持または加速しているなら、構造的な成長と判断しやすいです。
          </p>
          <p style={pStyle}>
            再開発直後だけ急増してその後横ばいなら、一時的な住戸供給に反応しただけの可能性があります。5年以上の推移を見て「形」を判断することが重要です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            駅の乗降者数も合わせて確認してください。人口が増えているのに乗降者数が変わらなければ、車中心の生活圏で駅周辺の活性化にはつながっていない可能性があります。逆に、人口と乗降者数の両方が伸びているなら、交通需要と居住需要が揃った成長サインと考えやすいです。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象エリアの人口推移を確認します。1995年〜2020年の推移グラフで、再開発前後の変化と長期トレンドの両方を把握できます。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から最寄り駅の乗降者数推移を確認します。再開発後に乗降者数も伸びているかどうかが、エリアの活性化を測る重要な指標です。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で同規模の他エリアと比較し、再開発エリアの駅が相対的にどの位置にあるかを確認するのも有効です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            再開発エリアが伸びるかどうかは、開発計画の発表だけでは判断できません。人口推移と乗降者数の「再開発前後の推移」を確認し、定着・成長型なのか一時的な増加で終わるパターンなのかをデータで見分けることが、エリア判断の精度を上げるポイントです。
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
