export default function AboutPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', color: '#e8edf5' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '40px', borderBottom: '1px solid #1e2d45', paddingBottom: '16px' }}>
        運営者情報
      </h1>
      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Row label="サービス名" value="AreaScope" />
        <Row label="運営会社" value="グロースフィールド株式会社" />
        <Row label="代表取締役" value="増田吉彦" />
        <Row label="設立" value="2025年" />
        <Row label="事業内容" value="コンサルティング業務、広告代理業務、データ分析・Webサービス運営" />
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
