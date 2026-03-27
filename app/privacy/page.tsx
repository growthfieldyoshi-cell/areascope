export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', color: '#e8edf5' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '40px', borderBottom: '1px solid #1e2d45', paddingBottom: '16px' }}>
        プライバシーポリシー
      </h1>
      <p style={{ color: '#aaa', lineHeight: '1.8', marginBottom: '32px' }}>
        AreaScope（以下「当サイト」）では、個人情報の保護に関する法令を遵守し、適切な管理に努めます。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Section title="個人情報の利用目的">
          当サイトでは、お問い合わせの際に、名前やメールアドレス等の個人情報をご入力いただく場合があります。これらの情報は、お問い合わせへの回答や必要な情報をご連絡するために利用し、それ以外の目的では利用いたしません。
        </Section>
        <Section title="広告について">
          当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する予定です。広告配信事業者は、ユーザーの興味に応じた広告を表示するため、Cookie（クッキー）を使用することがあります。
        </Section>
        <Section title="アクセス解析ツールについて">
          当サイトでは、Google Analytics等のアクセス解析ツールを利用する場合があります。これらのツールはトラフィックデータの収集のためにCookieを使用することがありますが、個人を特定するものではありません。
        </Section>
        <Section title="Cookieについて">
          Cookieとは、サイト利用者のブラウザに保存される情報です。ユーザーはブラウザの設定によりCookieの使用を拒否することが可能です。
        </Section>
        <Section title="免責事項">
          当サイトのコンテンツ・情報については、可能な限り正確な情報を掲載するよう努めていますが、正確性や安全性を保証するものではありません。当サイトの情報によって生じた損害等については、一切の責任を負いかねます。
        </Section>
        <Section title="著作権について">
          当サイトに掲載されている文章・画像等の著作物の無断転載を禁止します。
        </Section>
        <Section title="プライバシーポリシーの変更">
          本ポリシーは、必要に応じて予告なく変更されることがあります。
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#111827', borderRadius: '12px', padding: '28px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#00d4aa', marginBottom: '12px' }}>{title}</h2>
      <p style={{ color: '#aaa', lineHeight: '1.8', margin: 0 }}>{children}</p>
    </div>
  );
}
