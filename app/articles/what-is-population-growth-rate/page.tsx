import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '人口増加率とは？意味と見方をわかりやすく解説｜AreaScope',
  description: '人口増加率の意味・増加率と絶対数の違い・継続性の重要性をわかりやすく解説します。',
  alternates: {
    canonical: 'https://areascope.jp/articles/what-is-population-growth-rate',
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

export default function WhatIsPopulationGrowthRatePage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: '記事一覧', href: '/articles' },
          { label: '人口増加率とは？意味と見方' },
        ]} />
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人口増加率とは？<br />意味と見方を<span style={{ color: '#00d4aa' }}>わかりやすく解説</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人口増加率は「どれくらいのペースで人が増えているか」を示す指標ですが、この数字だけでエリアの良し悪しは判断できません。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          エリア分析で人口増加率を見る機会は多いですが、正しく読むにはいくつかの注意点があります。この記事では、増加率の意味・計算の仕組み・よくある誤解をわかりやすく整理します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口増加率の基本</h2>
          <p style={pStyle}>
            人口増加率とは、一定期間における人口の変化割合を示す指標です。計算式は「（現在の人口 − 過去の人口）÷ 過去の人口 × 100」で求められます。
          </p>
          <p style={pStyle}>
            たとえば、5年前に10万人だった街が10万5,000人になっていれば、増加率は5%です。同じ5%でも、1万人の街が1万500人になったのとでは、増えた絶対数がまったく異なります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            増加率は「変化のペース」を見る指標であり、「どれだけの人が増えたか」を示す絶対数とは別物です。この違いを理解することが、データを正しく読む第一歩です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>増加率と絶対数の違い</h2>
          <p style={{ ...pStyle, marginBottom: '20px' }}>
            増加率と絶対数は、それぞれ異なる情報を示しています。どちらか一方だけでは判断が偏ります。
          </p>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>増加率が高い × 絶対数が小さい</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              人口1万人の街で500人増えれば増加率5%ですが、大型マンション1棟の竣工で達成できる規模です。エリア全体の需要が伸びているわけではない可能性があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>増加率が低い × 絶対数が大きい</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              人口100万人の都市で5,000人増えても増加率は0.5%です。しかし5,000人という数は中規模の街の人口に匹敵します。構造的に人が集まり続けている可能性が高い傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>両方を見る</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              増加率でペースを把握し、絶対数でスケールを把握する。この2つを合わせて見ることで、人口の変化をより正確に評価できます。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>継続性が最も重要</h2>
          <p style={pStyle}>
            ある年だけ増加率が高くても、それが1年限りであれば一時的な要因（マンション竣工・企業移転など）の可能性があります。
          </p>
          <p style={pStyle}>
            エリアの将来性を判断するには、5年〜10年にわたって増加が続いているかどうかを確認することが不可欠です。継続的に増加しているエリアは、住宅需要・交通需要・商業需要のいずれかが構造的に伸びていると考えやすいです。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            逆に、増加率が高かった時期の後に横ばいや減少に転じているエリアは、一時的なブームだった可能性があります。推移の「形」を見ることが重要です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：増加率だけで判断するケース</h2>
          <p style={pStyle}>
            人口増加率ランキングで上位に入っていたエリアに注目し、引越しや投資を検討するケースがあります。しかし、そのエリアの人口が5,000人以下であれば、わずかな変動で増加率が大きく動きます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            実際には大型開発が1件あっただけで、翌年には横ばいに戻ったという事例は少なくありません。増加率の「数字の大きさ」だけで判断するのではなく、絶対数・期間・推移の形を合わせて確認する必要があります。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>から対象エリアを選ぶと、1995年〜2020年の人口推移グラフを確認できます。増加率だけでなく、推移の形や継続性を視覚的に把握できます。
          </p>
          <p style={pStyle}>
            人口推移と合わせて、<Link href="/station/list" style={linkStyle}>駅一覧</Link>から最寄り駅の乗降者数推移を確認すれば、人口増加が交通需要の増加にもつながっているかを判断できます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で、候補エリアの駅が全国的にどの規模にあるか比較するのも有効です。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人口増加率は「変化のペース」を示す指標であり、絶対数とは別物です。増加率が高くても母数が小さければ一時的な変動の可能性があり、増加率が低くても絶対数で数千人規模の増加があれば構造的な需要のサインです。増加率・絶対数・継続性の3点を合わせて確認することで、エリアの実態をデータで判断できるようになります。
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
