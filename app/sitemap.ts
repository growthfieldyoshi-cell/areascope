import { neon } from '@neondatabase/serverless';
import type { MetadataRoute } from 'next';

const sql = neon(process.env.DATABASE_URL!);
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://areascope.jp';

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
  'tokaido','sobu','marunouchi','hibiya','ginza','hanzomon',
  'fukutoshin','namboku','chiyoda','yurakucho','tozai','mita',
  'shinjuku','asakusa','oedo',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stations = await sql`
    SELECT DISTINCT station_group_slug
    FROM stations
    WHERE station_group_slug IS NOT NULL
      AND station_group_slug ~ '^[a-z0-9][a-z0-9\-]*$'
  `;

  const cities = await sql`
    SELECT DISTINCT prefecture_slug, municipality_slug
    FROM stations
    WHERE prefecture_slug IS NOT NULL
      AND municipality_slug IS NOT NULL
      AND prefecture_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
      AND municipality_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
  `;

  const stationUrls: MetadataRoute.Sitemap = stations.map((s) => ({
    url: `${BASE_URL}/station/${s.station_group_slug}`,
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

  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE_URL}/city/${c.prefecture_slug}/${c.municipality_slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/station`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/station/list`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/station-ranking`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/line`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/prefecture`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/city`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/population`, changeFrequency: 'monthly', priority: 0.7 },
    ...prefUrls,
    ...lineUrls,
    ...cityUrls,
    ...stationUrls,
  ];
}