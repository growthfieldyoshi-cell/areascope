import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'お問い合わせ | AreaScope',
  description: 'AreaScopeに関するお問い合わせページです。',
  alternates: {
    canonical: 'https://areascope.jp/contact',
  },
};

export default function ContactPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <Breadcrumb items={[
          { label: 'TOP', href: '/' },
          { label: 'お問い合わせ' },
        ]} />

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>
          お問い合わせ
        </h1>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px' }}>
            当サイトに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
          </p>
          <p style={{ fontSize: '16px', fontWeight: 700 }}>
            <a href="mailto:areascope.info@gmail.com" style={{ color: '#00d4aa', textDecoration: 'none' }}>
              areascope.info@gmail.com
            </a>
          </p>
        </div>

        <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '12px', padding: '28px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#00d4aa', marginBottom: '12px' }}>
            運営者
          </h2>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.8, marginBottom: 0 }}>
            グロースフィールド株式会社
          </p>
        </div>
      </div>
    </main>
  );
}
