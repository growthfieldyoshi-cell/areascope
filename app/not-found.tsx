// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0e1a',
      color: '#e8edf5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ fontSize: '72px', fontWeight: 700, color: '#00d4aa' }}>404</div>
      <div style={{ fontSize: '20px', fontWeight: 600 }}>ページが見つかりませんでした</div>
      <div style={{ fontSize: '14px', color: '#6b7a99' }}>
        URLが変更されたか、削除された可能性があります。
      </div>
      <Link href="/" style={{
        marginTop: '8px',
        padding: '10px 24px',
        backgroundColor: '#00d4aa',
        color: '#0a0e1a',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '14px',
      }}>
        トップへ戻る
      </Link>
    </div>
  )
}