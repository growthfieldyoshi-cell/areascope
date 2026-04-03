import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AreaScope 記事一覧 | エリア分析・駅データ・人口推移',
  description: '駅の乗降者数・市区町村の人口推移を活用したエリア分析の記事一覧。引越し・投資・出店検討に役立つデータの読み方を解説します。',
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <nav style={{
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        padding: '20px 24px',
        marginTop: '48px',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '48px',
      }}>
        <div style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '12px' }}>テーマ別の記事一覧</div>
        <Link href="/articles/growth-areas" style={{ display: 'block', color: '#00d4aa', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>成長エリア分析の記事一覧</Link>
        <Link href="/articles/passenger-analysis" style={{ display: 'block', color: '#00d4aa', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>人流分析の記事一覧</Link>
        <Link href="/articles/population-analysis" style={{ display: 'block', color: '#00d4aa', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>人口分析の記事一覧</Link>
        <Link href="/articles/prefecture-rankings" style={{ display: 'block', color: '#00d4aa', fontSize: '14px', textDecoration: 'none', marginBottom: '8px' }}>都道府県別ランキング一覧</Link>
        <Link href="/articles" style={{ display: 'block', color: '#00d4aa', fontSize: '14px', textDecoration: 'none' }}>記事一覧トップ</Link>
      </nav>
    </>
  );
}
