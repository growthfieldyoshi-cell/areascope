import { neon } from '@neondatabase/serverless';
import type { MetadataRoute } from 'next';

const sql = neon(process.env.DATABASE_URL!);

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://areascope.vercel.app';

const PREF_SLUGS = [
  'hokkaido','aomori','iwate','miyagi','akita','yamagata','fukushima',
  'ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa',
  'niigata','toyama','ishikawa','fukui','yamanashi','nagano','gifu',
  'shizuoka','aichi','mie','shiga','kyoto','osaka','hyogo','nara',
  'wakayama','tottori','shimane','okayama','hiroshima','yamaguchi',
  'tokushima','kagawa','ehime','kochi','fukuoka','saga','nagasaki',
  'kumamoto','oita','miyazaki','kagoshima','okinawa',
];

const LINE_SLUGS = [
  'yamanote','chuo','toyoko','keio-inokashira','keio','odakyu',
  'tokaido','sobu','saikyo','marunouchi',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stations = await sql`
    SELECT slug
    FROM stations
    WHERE slug IS NOT NULL
  `;

  const stationUrls: MetadataRoute.Sitemap = stations.map((s) => ({
    url: `${BASE_URL}/station/${s.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const prefUrls: MetadataRoute.Sitemap = PREF_SLUGS.map((slug) => ({
    url: `${BASE_URL}/prefecture/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const lineUrls: MetadataRoute.Sitemap = LINE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/line/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/station`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/station/list`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/population`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...prefUrls,
    ...lineUrls,
    ...stationUrls,
  ];
}