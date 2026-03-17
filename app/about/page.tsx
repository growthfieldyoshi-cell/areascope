import type { Metadata } from 'next'
import Link from 'next/link'

const BASE_URL = 'https://areascope.jp'

export const metadata: Metadata = {
  title: '運営者情報｜AreaScope',
  description: 'AreaScopeの運営者情報です。',
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutPage() {
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
      <Link
        href="/"
        style={{
          color: '#00d4aa',
          textDecoration: 'none',
          fontSize: '0.95rem',
        }}
      >
        ← TOPへ戻る
      </Link>

      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          marginTop: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        運営者情報
      </h1>

      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        AreaScope は、駅・路線・市区町村のデータをもとに、エリアの特徴を把握しやすくすることを目的としたデータ閲覧サイトです。
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          サイト名
        </h2>
        <p style={{ color: '#ccc' }}>AreaScope</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          運営者
        </h2>
        <p style={{ color: '#ccc' }}>グロースフィールド株式会社</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          所在地
        </h2>
        <p style={{ color: '#ccc' }}>
          東京都渋谷区恵比寿西1-32-29 風の館103
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          サイト概要
        </h2>
        <p style={{ color: '#ccc' }}>
          全国の駅、路線、市区町村、人口、乗降者数などの公的データをもとに、
          エリア比較や情報収集をしやすくすることを目的としたデータ閲覧サイトです。
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          掲載データ
        </h2>
        <p style={{ color: '#ccc' }}>
          駅別乗降者数、市区町村人口推移、路線別駅一覧、各種ランキング情報など
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          データ出典
        </h2>
        <p style={{ color: '#ccc' }}>
          国土交通省 国土数値情報 / 総務省統計局 e-Stat などの公的データをもとに掲載しています。
        </p>
      </section>

      <section>
        <h2
          style={{
            fontSize: '1.2rem',
            color: '#00d4aa',
            marginBottom: '0.75rem',
          }}
        >
          お問い合わせ
        </h2>
        <p style={{ color: '#ccc' }}>
          本サイトに関するお問い合わせは、今後設置予定のお問い合わせフォームよりお願いいたします。
        </p>
      </section>
    </main>
  )
}
