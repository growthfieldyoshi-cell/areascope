import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import Script from 'next/script'
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
  title: 'AREASCOPE | データで選ぶ、投資エリア。',
  description:
    '駅別乗降客数・市区町村人口推移を一目で可視化。全国8,124駅・1,741市区町村の公式データを無料で閲覧できます。',
  openGraph: {
    title: 'AREASCOPE | データで選ぶ、投資エリア。',
    description:
      '駅別乗降客数・市区町村人口推移を一目で可視化。全国8,124駅・1,741市区町村の公式データを無料で閲覧できます。',
    url: 'https://areascope.jp',
    siteName: 'AREASCOPE',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AREASCOPE | データで選ぶ、投資エリア。',
    description:
      '駅別乗降客数・市区町村人口推移を一目で可視化。全国8,124駅・1,741市区町村の公式データを無料で閲覧できます。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5313429744754781"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>

      <GoogleAnalytics gaId="G-W711TVYVQT" />
    </html>
  )
}
