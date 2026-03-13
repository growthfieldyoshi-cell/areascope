INSERT INTO stations (
  station_key,
  station_name,
  station_name_kana,
  line_key,
  line_name,
  line_slug,
  prefecture_name,
  prefecture_slug,
  municipality_name,
  municipality_slug,
  operator_name,
  slug,
  lat,
  lng,
  station_group_name,
  data_status,
  created_at,
  updated_at
)
SELECT
  station_key,
  station_name,
  NULL AS station_name_kana,
  NULL AS line_key,
  line_name,
  NULL AS line_slug,
  prefecture AS prefecture_name,
  CASE prefecture
    WHEN '北海道' THEN 'hokkaido'
    WHEN '青森県' THEN 'aomori'
    WHEN '岩手県' THEN 'iwate'
    WHEN '宮城県' THEN 'miyagi'
    WHEN '秋田県' THEN 'akita'
    WHEN '山形県' THEN 'yamagata'
    WHEN '福島県' THEN 'fukushima'
    WHEN '茨城県' THEN 'ibaraki'
    WHEN '栃木県' THEN 'tochigi'
    WHEN '群馬県' THEN 'gunma'
    WHEN '埼玉県' THEN 'saitama'
    WHEN '千葉県' THEN 'chiba'
    WHEN '東京都' THEN 'tokyo'
    WHEN '神奈川県' THEN 'kanagawa'
    WHEN '新潟県' THEN 'niigata'
    WHEN '富山県' THEN 'toyama'
    WHEN '石川県' THEN 'ishikawa'
    WHEN '福井県' THEN 'fukui'
    WHEN '山梨県' THEN 'yamanashi'
    WHEN '長野県' THEN 'nagano'
    WHEN '岐阜県' THEN 'gifu'
    WHEN '静岡県' THEN 'shizuoka'
    WHEN '愛知県' THEN 'aichi'
    WHEN '三重県' THEN 'mie'
    WHEN '滋賀県' THEN 'shiga'
    WHEN '京都府' THEN 'kyoto'
    WHEN '大阪府' THEN 'osaka'
    WHEN '兵庫県' THEN 'hyogo'
    WHEN '奈良県' THEN 'nara'
    WHEN '和歌山県' THEN 'wakayama'
    WHEN '鳥取県' THEN 'tottori'
    WHEN '島根県' THEN 'shimane'
    WHEN '岡山県' THEN 'okayama'
    WHEN '広島県' THEN 'hiroshima'
    WHEN '山口県' THEN 'yamaguchi'
    WHEN '徳島県' THEN 'tokushima'
    WHEN '香川県' THEN 'kagawa'
    WHEN '愛媛県' THEN 'ehime'
    WHEN '高知県' THEN 'kochi'
    WHEN '福岡県' THEN 'fukuoka'
    WHEN '佐賀県' THEN 'saga'
    WHEN '長崎県' THEN 'nagasaki'
    WHEN '熊本県' THEN 'kumamoto'
    WHEN '大分県' THEN 'oita'
    WHEN '宮崎県' THEN 'miyazaki'
    WHEN '鹿児島県' THEN 'kagoshima'
    WHEN '沖縄県' THEN 'okinawa'
    ELSE NULL
  END AS prefecture_slug,
  NULL AS municipality_name,
  NULL AS municipality_slug,
  operator_name,
  slug,
  lat,
  lng,
  station_name AS station_group_name,
  'active' AS data_status,
  created_at,
  now() AS updated_at
FROM stations_master
ON CONFLICT (station_key) DO NOTHING;