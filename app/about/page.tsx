import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: '運営者情報｜AreaScope',
  description: 'AreaScope（エリアスコープ）の運営会社・サービス概要・データについてご紹介します。グロースフィールド株式会社が運営する駅・エリアデータ可視化サービスです。',
  alternates: {
    canonical: 'https://areascope.jp/about',
  },
};

export default function AboutPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px' }}>
      <Breadcrumb items={[
        { label: 'TOP', href: '/' },
        { label: '運営者情報' },
      ]} />

      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#e8edf5', marginBottom: '24px' }}>
        運営者情報
      </h1>
      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        <Row label="サービス名" value="AreaScope" />
        <Row label="運営会社" value="グロースフィールド株式会社" />
        <Row label="代表取締役" value="増田吉彦" />
        <Row label="設立" value="2025年" />
        <Row label="事業内容" value="コンサルティング業務、広告代理業務、データ分析・Webサービス運営" />
      </div>

      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '16px' }}>AreaScopeについて</h2>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
          AreaScopeは、日本全国の駅乗降者数と市区町村人口推移を誰でも無料で調べられるデータ可視化サービスです。国土交通省・総務省が公開する公式統計データをもとに、全国9,000超の駅と1,200超の市区町村のデータを収録しています。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
          「この街は人が増えているのか、減っているのか」「この駅の利用者数は多いのか、少ないのか」——住み替えや引っ越し、不動産投資、出店計画など、エリアに関わる意思決定の場面で客観的なデータをすぐに確認できる環境を提供することが、AreaScopeのミッションです。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
          データはすべて政府が公開するオープンデータを使用しており、推計や独自集計は行っていません。2011年から2021年にかけての時系列データを収録しているため、コロナ前後の変化や長期的なトレンドの把握にも活用できます。
        </p>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '1px solid #1e2d45', paddingBottom: '12px' }}>
        データについて
      </h2>

      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>駅の乗降者数とは</h3>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
          乗降者数とは、1日あたりにその駅で乗車・降車した人数の合計です。各鉄道事業者が独自の方法で算出しており、事業者間で統一された基準はありません。そのため、異なる事業者の駅同士を厳密に比較する際には注意が必要です。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8 }}>
          AreaScopeでは、同じ駅名で複数路線がある場合は合算して表示しています。乗降者数はエリアの交通需要や商圏規模を把握するための指標として活用できます。
        </p>
      </div>

      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <Row label="データ名" value="駅別乗降客数データ（S12）" />
        <Row label="提供元" value="国土交通省 国土数値情報" />
        <Row label="ライセンス" value="政府標準利用規約（第2.0版）に基づき利用（商用利用可能・出典明記が必要）" />
        <Row label="出典URL" value="https://nlftp.mlit.go.jp/ksj/" />
      </div>

      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', marginBottom: '48px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e8edf5', marginBottom: '12px' }}>データ利用時の注意点</h3>
        <ul style={{ color: '#aaa', fontSize: '14px', lineHeight: 2, margin: 0, paddingLeft: '20px' }}>
          <li>各鉄道事業者が独自に算出しており、統一された基準はありません</li>
          <li>一部非公開の駅があります</li>
          <li>データ年度は整備年度から1年遡った年度が実データ年度です</li>
          <li>2021年度以前のデータはコロナ禍の影響を受けている場合があります</li>
        </ul>
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
        関連ページ
      </h2>
      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px' }}>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
          お問い合わせは <Link href="/contact" style={{ color: '#00d4aa', textDecoration: 'none' }}>Contactページ</Link> をご覧ください。
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.8, marginBottom: 0 }}>
          使用データの出典・ライセンス・注意点は <Link href="/data" style={{ color: '#00d4aa', textDecoration: 'none' }}>Dataページ</Link> をご覧ください。
        </p>
      </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #1e2d45', paddingBottom: '16px' }}>
      <span style={{ color: '#6b7a99', minWidth: '120px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e8edf5' }}>{value}</span>
    </div>
  );
}
