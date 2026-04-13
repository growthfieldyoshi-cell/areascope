import type { NextConfig } from "next";

const PREF_SLUGS = [
  'hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
  'ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa',
  'niigata', 'toyama', 'ishikawa', 'fukui', 'yamanashi', 'nagano',
  'gifu', 'shizuoka', 'aichi', 'mie', 'shiga', 'kyoto', 'osaka', 'hyogo',
  'nara', 'wakayama', 'tottori', 'shimane', 'okayama', 'hiroshima',
  'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi',
  'fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki',
  'kagoshima', 'okinawa',
];

const nextConfig: NextConfig = {
  async redirects() {
    return PREF_SLUGS.map((slug) => ({
      source: `/city/${slug}`,
      destination: `/prefecture/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
