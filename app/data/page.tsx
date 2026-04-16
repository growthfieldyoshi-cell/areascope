import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'AreaScopeが使用するデータ｜出典・ライセンス情報',
  description: 'AreaScopeで使用している駅乗降者数・人口データの出典、ライセンス、注意点を説明します。',
  alternates: {
    canonical: 'https://areascope.jp/data',
  },
  openGraph: {
    type: 'website',
    title: 'AreaScopeが使用するデータ｜出典・ライセンス情報',
    description: 'AreaScopeで使用している駅乗降者数・人口データの出典、ライセンス、注意点を説明します。',
    url: 'https://areascope.jp/data',
    siteName: 'AreaScope',
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

const ulStyle = {
  color: '#aaa',
  fontSize: '15px',
  lineHeight: 2.2,
  paddingLeft: '20px',
  marginBottom: 0,
};

export default function DataPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: 'データについて' },
        ]} />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
          AreaScopeが使用するデータについて
        </h1>

        <p style={{ ...pStyle, marginBottom: '32px' }}>
          AreaScopeは、国や公的機関が公開するオープンデータを活用し、駅の乗降者数や市区町村の人口データを可視化しています。データの出典・ライセンス・注意点を以下にまとめます。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>駅乗降者数データ</h2>
          <p style={pStyle}>
            駅乗降者数データは、国土交通省が整備・公開する「国土数値情報（S12）」を使用しています。このデータは全国の鉄道駅について、年度ごとの乗降者数を記録したもので、オープンデータ（CC BY 4.0）として無償で公開されています。CC BY 4.0ライセンスとは、出典を明記することを条件に、商用・非商用を問わず自由に利用・加工・再配布できるライセンスです。
          </p>
          <ul style={ulStyle}>
            <li>国土交通省「国土数値情報」の駅別乗降客数データを使用</li>
            <li>駅ごとの乗降者数をもとに、駅ページやランキングページを作成</li>
            <li>ライセンスは CC BY 4.0</li>
            <li>出典明記を行えば商用利用が可能</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口データ</h2>
          <p style={pStyle}>
            人口データは、総務省が運営する政府統計ポータルサイト「e-Stat」の国勢調査データを使用しています。国勢調査は5年ごとに実施される日本最大規模の統計調査で、市区町村単位の人口・世帯数・年齢構成などを把握できます。AreaScopeでは1995年〜2020年の推移データを収録し、長期的な人口動態の把握に活用できます。
          </p>
          <ul style={ulStyle}>
            <li>政府統計ポータルサイト e-Stat の国勢調査データを使用</li>
            <li>市区町村ごとの人口推移を掲載</li>
            <li>国勢調査ベースのため、主に5年ごとの統計データ</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データの注意点</h2>
          <p style={pStyle}>
            データをより正確にご活用いただくために、以下の点をご確認ください。特に異なる鉄道事業者の駅同士を比較する際は、算出基準の違いを念頭に置いてください。
          </p>
          <ul style={ulStyle}>
            <li>駅乗降者数は事業者ごとに算出方法が異なる場合があります</li>
            <li>一部の駅ではデータが非公開、または掲載されていない場合があります</li>
            <li>人口データは国勢調査ベースのため、毎年更新されるものではありません</li>
            <li>公的データをもとに掲載していますが、最新の公式情報が必要な場合は各提供元もあわせてご確認ください</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>このデータでできること</h2>
          <p style={pStyle}>
            AreaScopeのデータは、以下のような用途にご活用いただけます。
          </p>
          <ul style={ulStyle}>
            <li>引っ越し・住み替え先の候補エリアの活気・将来性の比較</li>
            <li>店舗出店・商圏調査における集客ポテンシャルの定量評価</li>
            <li>不動産投資におけるエリアの需要動向の把握</li>
            <li>人口増減と駅利用者数の相関による地域特性の分析</li>
            <li>コロナ前後の人流変化の把握と回復状況の確認</li>
          </ul>
          <p style={{ ...pStyle, marginTop: '16px', marginBottom: 0 }}>
            いずれも政府公開の一次データに基づいているため、根拠ある判断材料として信頼性の高い情報をご提供できます。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>出典</h2>
          <ul style={{ ...ulStyle, listStyle: 'none', paddingLeft: 0 }}>
            <li style={{ marginBottom: '12px' }}>
              <div style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '4px' }}>国土交通省 国土数値情報</div>
              <a href="https://nlftp.mlit.go.jp/ksj/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
                https://nlftp.mlit.go.jp/ksj/
              </a>
            </li>
            <li>
              <div style={{ color: '#e8edf5', fontWeight: 600, marginBottom: '4px' }}>e-Stat（政府統計の総合窓口）</div>
              <a href="https://www.e-stat.go.jp/" target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '14px' }}>
                https://www.e-stat.go.jp/
              </a>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
