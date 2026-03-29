// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://areascope.jp'),
  title: 'AreaScope｜駅・エリアデータを可視化',
  description:
    '全国の駅乗降者数・市区町村人口推移を可視化。全国9,012駅・1,256市区町村の公式データを無料で閲覧できます。',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AreaScope｜駅・エリアデータを可視化',
    description:
      '全国の駅乗降者数・市区町村人口推移を可視化。全国9,012駅・1,256市区町村の公式データを無料で閲覧できます。',
    url: 'https://areascope.jp',
    siteName: 'AREASCOPE',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AreaScope｜駅・エリアデータを可視化',
    description:
      '全国の駅乗降者数・市区町村人口推移を可視化。全国9,012駅・1,256市区町村の公式データを無料で閲覧できます。',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <div style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid #1e2d45', background: '#0a0e1a' }}>
          <p style={{ color: '#6b7a99', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
            出典：「国土数値情報（駅別乗降客数データ）」（国土交通省）
          </p>
          <p style={{ color: '#6b7a99', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
            https://nlftp.mlit.go.jp/ksj/
          </p>
        </div>
      </body>
      <GoogleAnalytics gaId="G-W711TVYVQT" />
    </html>
  )
}
