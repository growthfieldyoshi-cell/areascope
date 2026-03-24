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
      </body>
      <GoogleAnalytics gaId="G-W711TVYVQT" />
    </html>
  )
}