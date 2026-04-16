import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '郊外と都心どっちが住みやすい？データで比較｜AreaScope',
  description: '通勤・生活利便・住宅環境の3視点から郊外と都心を比較し条件別に整理します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/suburb-vs-city-livability',
  },
};

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

export default function SuburbVsCityLivabilityPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '郊外と都心どっちが住みやすい？' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          郊外と都心どっちが住みやすい？<br /><span style={{ color: '#00d4aa' }}>データで比較</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          郊外が正解でも、都心が正解でもありません。住みやすさは「何を優先するか」によって答えが変わります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          「都心は便利だけど高い」「郊外は広いけど不便」。こうした印象は一面的です。通勤負荷・生活利便性・住宅環境の3軸で比較すると、それぞれのメリットとデメリットが具体的に見えてきます。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>比較の3つの軸</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            郊外と都心を比較するとき、漠然と「便利か不便か」で考えると判断がぶれます。以下の3つの軸に分けて評価することで、自分の条件に合ったエリアが見えやすくなります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>① 通勤負荷</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>都心</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              職場が近く通勤時間は短い傾向がありますが、最寄り駅がターミナル型（1日30万人以上）の場合、ラッシュ時の混雑は激しくなります。乗降者数が多い駅ほど、ホームや改札周辺のストレスが増える傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>郊外</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              通勤時間は長くなりがちですが、直通路線があれば座って通勤できるケースもあります。距離が遠くても乗り換えなしの路線沿いなら、体感の負担はターミナル駅乗り換えより軽いことがあります。<Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補駅の混雑規模を比較できます。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>② 生活利便性</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>都心</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              商業施設・飲食店・医療機関が集積しており、選択肢は豊富です。ただし、ターミナル駅周辺は来街者向けの施設が多く、住民の日常利用に向いたスーパーやクリニックが駅前にないケースもあります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>郊外</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              駅前の商業施設は都心ほど充実していないことが多いですが、住民向けのスーパー・ドラッグストア・クリニックが揃っているエリアもあります。乗降者数5万〜15万人程度の中規模駅周辺は、生活利便性と住環境のバランスが取れやすい傾向があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>③ 住宅環境</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>都心</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              家賃・不動産価格が高く、同じ予算では狭い住居になりがちです。単身者やDINKSには十分でも、子育て世帯にはスペースが不足するケースがあります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>郊外</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              同じ予算でより広い住居を確保しやすく、子育て環境としての評価が高い傾向があります。人口が安定〜増加傾向のエリアは住宅需要が維持されており、将来的な資産価値の面でも一定の安心感があります。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：都心 or 郊外の二元論で判断するケース</h2>
          <p style={pStyle}>
            「都心に住めば間違いない」と考えてターミナル駅の近くを選んだ結果、混雑・騒音・家賃の高さに苦しむケースがあります。逆に「郊外なら広くて快適」と郊外を選んだものの、最寄り駅の本数が少なく通勤が想像以上に辛かったという声もあります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            都心と郊外はどちらが正解かではなく、通勤先・家族構成・予算・車の有無といった個人の条件によって最適解が変わります。データで候補エリアの実態を確認した上で判断することが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補駅の規模感を比較できます。都心のターミナル駅と郊外の中規模駅を並べて見ることで、混雑度の差が具体的に分かります。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅の乗降者数推移を確認できます。増加傾向の郊外駅は、エリアの発展を示すサインになりえます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>で人口推移を確認し、駅データと合わせて見ることで、候補エリアが「成長中か」「安定しているか」「縮小傾向か」を判断できます。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            郊外と都心のどちらが住みやすいかは、通勤負荷・生活利便性・住宅環境のどれを優先するかで変わります。二元論で判断するのではなく、乗降者数・人口推移・駅の規模感をデータで確認し、自分の条件に合ったエリアを選ぶことが後悔しない街選びにつながります。
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
