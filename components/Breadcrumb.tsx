import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: Props) {
  return (
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
  );
}