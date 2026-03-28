import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '郊外と都心どっちが住みやすい？データで比較 | AreaScope',
  description: '郊外と都心の住みやすさをデータで比較。通勤・生活利便・住宅環境の3つの視点から、あなたに合ったエリア選びの考え方を解説します。',
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
