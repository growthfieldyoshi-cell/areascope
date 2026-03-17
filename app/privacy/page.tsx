import type { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://areascope.jp';

export const metadata: Metadata = {
  title: 'プライバシーポリシー｜AreaScope',
  description: 'AreaScopeのプライバシーポリシーです。',
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        background: '#0a0e1a',
        minHeight: '100vh',
        color: '#e8edf5',
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '960px',
        margin: '0 auto',
        lineHeight: 1.9,
      }}
    >
      <Link href="/" style={{ color: '#00d4aa', textDecoration: 'none', fontSize: '0.95rem' }}>
        ← TOPへ戻る
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem', marginBottom: '1.5rem' }}>
        プライバシーポリシー
      </h1>

      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        AreaScope（以下、「当サイト」といいます。）は、ユーザーの個人情報の保護を重要なものと考え、以下のとおりプライバシーポリシーを定めます。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>1. 個人情報の利用目的</h2>
        <p style={{ color: '#ccc' }}>
          当サイトでは、お問い合わせ等の際に、名前やメールアドレス等の個人情報をご入力いただく場合があります。取得した個人情報は、お問い合わせへの回答や必要なご連絡のために利用し、それ以外の目的では利用しません。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>2. 広告について</h2>
        <p style={{ color: '#ccc' }}>
          当サイトは、第三者配信の広告サービス（Google AdSense など）を利用する場合があります。これらの広告配信事業者は、ユーザーの興味に応じた広告を表示するために、Cookie を使用することがあります。
        </p>
        <p style={{ color: '#ccc' }}>
          Cookie を無効にする方法や Google AdSense に関する詳細は、Google の広告に関するポリシーをご確認ください。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>3. アクセス解析ツールについて</h2>
        <p style={{ color: '#ccc' }}>
          当サイトでは、Google Analytics を利用しています。Google Analytics は、トラフィックデータ収集のために Cookie を使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>4. 個人情報の第三者提供</h2>
        <p style={{ color: '#ccc' }}>
          当サイトは、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供することはありません。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>5. 免責事項</h2>
        <p style={{ color: '#ccc' }}>
          当サイトに掲載する情報は、可能な限り正確な情報を提供するよう努めていますが、その正確性・完全性を保証するものではありません。当サイトの情報を利用したことにより生じた損害等について、一切の責任を負いかねます。
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.2rem', color: '#00d4aa', marginBottom: '0.75rem' }}>6. プライバシーポリシーの変更</h2>
        <p style={{ color: '#ccc' }}>
          本ポリシーは、必要に応じて変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
        </p>
      </section>
    </main>
  );
}
