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

const KANA_LIST = [
  '\u3042','\u304B','\u3055','\u305F','\u306A',
  '\u306F','\u307E','\u3084','\u3089','\u308F','\u305D\u306E\u4ED6',
];

const ARTICLE_SLUGS = [
  'how-to-find-population-growth-area',
  'station-passengers-area-analysis',
  'population-decline-area-analysis',
  'station-passengers-livability',
  'how-to-choose-area-for-moving',
  'how-to-find-livable-city',
  'population-passengers-combination-analysis',
  'population-growth-area-ranking',
  'station-ranking-livability',
  'rural-city-livability',
  'how-to-find-bedroom-community',
  'how-to-choose-commute-area',
  'how-to-read-livability-ranking',
  'what-is-population-growth-rate',
  'is-busy-station-livable',
  'is-population-decline-dangerous',
  'suburb-vs-city-livability',
  'how-to-choose-family-friendly-city',
  'best-city-for-single-living',
  'will-redevelopment-area-grow',
  'residential-vs-commercial-area',
  'popular-vs-hidden-station',
  'tokyo-station-ranking-2023',
  'osaka-station-ranking-2023',
  'kanagawa-station-ranking-2023',
  'aichi-station-ranking-2023',
  'saitama-station-ranking-2023',
  'chiba-station-ranking-2023',
  'fukuoka-station-ranking-2023',
  'kyoto-station-ranking-2023',
  'hyogo-station-ranking-2023',
  'hokkaido-station-ranking-2023',
  'miyagi-station-ranking-2023',
  'hiroshima-station-ranking-2023',
  'niigata-station-ranking-2023',
  'tochigi-station-ranking-2023',
  'gunma-station-ranking-2023',
  'ibaraki-station-ranking-2023',
  'shizuoka-station-ranking-2023',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stations, cities, stationKanaPref, cityKanaPref, rankingPrefs] = await Promise.all([
    sql`
      SELECT DISTINCT station_group_slug
      FROM stations
      WHERE station_group_slug IS NOT NULL
        AND station_group_slug ~ '^[a-z0-9][a-z0-9\-]*$'
    `,
    sql`
      SELECT DISTINCT prefecture_slug, municipality_slug
      FROM stations
      WHERE prefecture_slug IS NOT NULL
        AND municipality_slug IS NOT NULL
        AND prefecture_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
        AND municipality_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
    `,
    sql`
      SELECT DISTINCT station_name_initial_kana, prefecture_slug
      FROM stations
      WHERE station_name_initial_kana IS NOT NULL
        AND prefecture_slug IS NOT NULL
        AND prefecture_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
    `,
    sql`
      SELECT DISTINCT m.municipality_name_initial_kana, s.prefecture_slug
      FROM municipalities m
      JOIN (
        SELECT DISTINCT municipality_code, prefecture_slug
        FROM stations
        WHERE municipality_code IS NOT NULL
          AND prefecture_slug IS NOT NULL
          AND prefecture_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
      ) s
        ON s.municipality_code = m.code5
      WHERE m.municipality_name_initial_kana IS NOT NULL
    `,
    sql`
      SELECT DISTINCT prefecture_slug
      FROM stations
      WHERE prefecture_slug IS NOT NULL
        AND prefecture_slug ~ '^[a-z0-9][a-z0-9\\-]*$'
      ORDER BY prefecture_slug
    `,
  ]);

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

  const lineRankingUrls: MetadataRoute.Sitemap = LINE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/line/${slug}/ranking`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const cityUrls: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE_URL}/city/${c.prefecture_slug}/${c.municipality_slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const stationKanaUrls: MetadataRoute.Sitemap = KANA_LIST.map((kana) => ({
    url: `${BASE_URL}/station/list/${encodeURIComponent(kana)}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const cityKanaUrls: MetadataRoute.Sitemap = KANA_LIST.map((kana) => ({
    url: `${BASE_URL}/city/list/${encodeURIComponent(kana)}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const stationKanaPrefUrls: MetadataRoute.Sitemap = stationKanaPref.map((row) => ({
    url: `${BASE_URL}/station/list/${encodeURIComponent(row.station_name_initial_kana)}/${row.prefecture_slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const cityKanaPrefUrls: MetadataRoute.Sitemap = cityKanaPref.map((row) => ({
    url: `${BASE_URL}/city/list/${encodeURIComponent(row.municipality_name_initial_kana)}/${row.prefecture_slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const stationRankingPrefUrls: MetadataRoute.Sitemap = rankingPrefs.map((r) => ({
    url: `${BASE_URL}/station-ranking/${r.prefecture_slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const articleUrls: MetadataRoute.Sitemap = ARTICLE_SLUGS.map((slug) => ({
    url: `${BASE_URL}/articles/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/station`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/station/list`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/station-ranking`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/articles`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/line`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/prefecture`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/city`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/population`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/station/hard-reading`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/station/quiz`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/station/quiz/prefecture`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/station/quiz/passengers`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/station/quiz/line`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/city/hard-reading`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/city/quiz`, changeFrequency: 'monthly', priority: 0.8 },
    ...articleUrls,
    ...stationRankingPrefUrls,
    ...prefUrls,
    ...lineUrls,
    ...lineRankingUrls,
    ...stationKanaUrls,
    ...cityKanaUrls,
    ...stationKanaPrefUrls,
    ...cityKanaPrefUrls,
    ...cityUrls,
    ...stationUrls,
  ];
}