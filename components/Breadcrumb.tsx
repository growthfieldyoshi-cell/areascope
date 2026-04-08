import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

const BASE_URL = 'https://areascope.jp';

export default function Breadcrumb({ items }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href
        ? {
            item: item.href.startsWith('http')
              ? item.href
              : `${BASE_URL}${item.href}`,
          }
        : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="breadcrumb" style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7a99', fontFamily: 'monospace' }}>
        {items.map((item, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin: '0 6px', color: '#3a4a6b' }}>›</span>}
            {item.href ? (
              <Link href={item.href} style={{ color: '#00d4aa', textDecoration: 'none' }}>
                {item.label}
              </Link>
            ) : (
              <span style={{ color: '#aaa' }}>{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
