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
          <ul style={ulStyle}>
            <li>国土交通省「国土数値情報」の駅別乗降客数データを使用</li>
            <li>駅ごとの乗降者数をもとに、駅ページやランキングページを作成</li>
            <li>ライセンスは CC BY 4.0</li>
            <li>出典明記を行えば商用利用が可能</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人口データ</h2>
          <ul style={ulStyle}>
            <li>政府統計ポータルサイト e-Stat の国勢調査データを使用</li>
            <li>市区町村ごとの人口推移を掲載</li>
            <li>国勢調査ベースのため、主に5年ごとの統計データ</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>データの注意点</h2>
          <ul style={ulStyle}>
            <li>駅乗降者数は事業者ごとに算出方法が異なる場合があります</li>
            <li>一部の駅ではデータが非公開、または掲載されていない場合があります</li>
            <li>人口データは国勢調査ベースのため、毎年更新されるものではありません</li>
            <li>公的データをもとに掲載していますが、最新の公式情報が必要な場合は各提供元もあわせてご確認ください</li>
          </ul>
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
