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

export default function ResidentialVsCommercialAreaPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          住宅地と商業地の違い｜<br /><span style={{ color: '#00d4aa' }}>住みやすさ</span>の本質
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          便利な街＝住みやすい街ではありません。住宅地と商業地では、駅の使われ方も住環境もまったく異なります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          商業施設が多く人通りの多い街は便利に見えますが、それは「訪れる人にとって便利」であって「住む人にとって快適」かは別問題です。住宅地と商業地の違いをデータの視点から整理し、自分に合ったエリアを選ぶための考え方を解説します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>住宅地と商業地の3つの違い</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 駅利用のパターンが異なる</p>
            <p style={pStyle}>
              住宅地の駅は朝の通勤ラッシュに利用が集中し、日中は比較的落ち着く傾向があります。住民の通勤・通学が主な利用目的です。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              商業地の駅は日中〜夜間にかけて利用が多く、休日も乗降者数が落ちにくいのが特徴です。買い物客・観光客・ビジネス客など、多様な目的の利用者が混在しています。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 人口構造が異なる</p>
            <p style={pStyle}>
              住宅地は夜間人口（実際に住んでいる人）が昼間人口より多い傾向があります。住民が生活の拠点としているエリアです。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              商業地は昼間人口が夜間人口を大きく上回ります。オフィスや店舗で働く人、訪れる人が多い一方、実際に住んでいる人は少ないケースがあります。人口推移を見るときは、この構造の違いを意識する必要があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 生活利便性の「質」が異なる</p>
            <p style={pStyle}>
              商業地には飲食店や商業施設が多いですが、住民の日常に必要なスーパー・クリニック・ドラッグストアが少ないことがあります。
            </p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              住宅地は派手な商業施設は少ないものの、日常利用の店舗が駅周辺にコンパクトに揃っているケースが多く、毎日の生活に必要なものが徒歩圏で手に入る傾向があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>エリアの3パターン</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>住宅特化型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数1〜5万人/日程度。住民の通勤利用が中心で、駅前にスーパーや日用品店が揃う。静かな環境で、ファミリーや落ち着いた暮らしを求める人に向いている傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>商業特化型</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数20万人以上/日。商業施設・飲食店が密集し、来街者向けのサービスが充実。利便性は高いが、騒音・混雑・家賃の高さが住環境の課題になりやすいです。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>混在型（バランス型）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数5〜20万人/日程度。住民向けの生活施設と一定の商業集積が共存するエリア。通勤利便性と住環境のバランスが取れやすい傾向があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：便利そうな商業地を住宅地として選ぶケース</h2>
          <p style={pStyle}>
            「飲食店が多くて便利そう」「駅前が賑わっていて活気がある」という印象だけで商業地エリアに住居を構えた結果、夜間の騒音、ゴミの多さ、日常の買い物が不便だったという声は少なくありません。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            商業施設の充実と生活の快適さは異なる概念です。「何が揃っているか」だけでなく「誰向けに揃っているか」を見分けることが、住みやすい街を選ぶ上で重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データでどう見分けるか</h2>
          <p style={pStyle}>
            乗降者数の規模感は、エリアの性質を推測する手がかりになります。乗降者数が極端に多い駅（20万人以上/日）の周辺は商業地型の傾向が強く、5万人以下の駅は住宅地型である可能性が高いです。
          </p>
          <p style={pStyle}>
            人口推移も合わせて確認します。夜間人口が安定〜増加しているエリアは住宅需要が維持されている傾向があり、住宅地としての実態が裏付けられます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            乗降者数が大きいのに人口が少ない・減少しているエリアは、商業・通過利用が中心で住環境としての需要は限定的と判断しやすいです。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補駅の規模感を確認し、住宅特化型・商業特化型・混在型のどれに近いかの目安を得られます。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅の乗降者数推移を確認すれば、利用者が安定しているか変動しているかが分かります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>で人口推移を確認し、乗降者数と組み合わせることで、そのエリアが「住む街」なのか「訪れる街」なのかを判断しやすくなります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            住宅地と商業地では、駅の使われ方・人口構造・生活利便性の質がまったく異なります。便利に見える商業地が住みやすいとは限らず、地味に見える住宅地の方が日常の満足度が高いケースは珍しくありません。乗降者数と人口推移をデータで確認し、そのエリアが自分の生活スタイルに合っているかを見極めることが大切です。
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
