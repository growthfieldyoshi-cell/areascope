-- ============================================================
-- AreaScope schema v2
-- ============================================================

CREATE TABLE IF NOT EXISTS prefectures (
  prefecture_code    TEXT PRIMARY KEY,
  prefecture_name    TEXT NOT NULL,
  prefecture_slug    TEXT UNIQUE NOT NULL,
  region_name        TEXT,
  station_count      INTEGER DEFAULT 0,
  municipality_count INTEGER DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prefectures_region
  ON prefectures (region_name);


CREATE TABLE IF NOT EXISTS municipalities (
  municipality_code  TEXT PRIMARY KEY,
  municipality_name  TEXT NOT NULL,
  municipality_slug  TEXT NOT NULL,
  prefecture_name    TEXT NOT NULL,
  prefecture_slug    TEXT NOT NULL,
  city_type          TEXT,
  lat                NUMERIC(10, 6),
  lng                NUMERIC(10, 6),
  population_latest  INTEGER CHECK (population_latest IS NULL OR population_latest >= 0),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (prefecture_slug, municipality_slug)
);

CREATE INDEX IF NOT EXISTS idx_municipalities_prefecture_slug
  ON municipalities (prefecture_slug);

CREATE INDEX IF NOT EXISTS idx_municipalities_city_type
  ON municipalities (city_type);


CREATE TABLE IF NOT EXISTS lines (
  line_key        TEXT PRIMARY KEY,
  line_name       TEXT NOT NULL,
  line_slug       TEXT UNIQUE NOT NULL,
  operator_name   TEXT,
  prefecture_name TEXT,
  prefecture_slug TEXT,
  station_count   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lines_operator
  ON lines (operator_name);

CREATE INDEX IF NOT EXISTS idx_lines_prefecture_slug
  ON lines (prefecture_slug);


CREATE TABLE IF NOT EXISTS stations (
  station_key        TEXT PRIMARY KEY,
  station_name       TEXT NOT NULL,
  station_name_kana  TEXT,
  line_key           TEXT,
  line_name          TEXT NOT NULL,
  line_slug          TEXT,
  prefecture_name    TEXT,
  prefecture_slug    TEXT,
  municipality_name  TEXT,
  municipality_slug  TEXT,
  operator_name      TEXT,
  slug               TEXT UNIQUE NOT NULL,
  lat                NUMERIC(10, 6),
  lng                NUMERIC(10, 6),
  station_group_name TEXT,
  data_status        TEXT DEFAULT 'active'
                     CHECK (data_status IN ('active', 'closed', 'planned')),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stations_line_key
  ON stations (line_key);

CREATE INDEX IF NOT EXISTS idx_stations_line_slug
  ON stations (line_slug);

CREATE INDEX IF NOT EXISTS idx_stations_prefecture_slug
  ON stations (prefecture_slug);

CREATE INDEX IF NOT EXISTS idx_stations_municipality_slug
  ON stations (municipality_slug);

CREATE INDEX IF NOT EXISTS idx_stations_data_status
  ON stations (data_status);

CREATE INDEX IF NOT EXISTS idx_stations_name_gin
  ON stations USING gin (
    to_tsvector(
      'simple',
      station_name || ' ' || coalesce(station_name_kana, '') || ' ' || line_name
    )
  );

CREATE INDEX IF NOT EXISTS idx_stations_lat_lng
  ON stations (lat, lng);


CREATE TABLE IF NOT EXISTS station_passengers (
  id              BIGSERIAL PRIMARY KEY,
  station_key     TEXT NOT NULL REFERENCES stations (station_key) ON DELETE CASCADE,
  year            SMALLINT NOT NULL CHECK (year BETWEEN 1990 AND 2099),
  passengers      INTEGER CHECK (passengers >= 0),
  source          TEXT,
  ranking_in_year INTEGER,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (station_key, year)
);

CREATE INDEX IF NOT EXISTS idx_sp_year_passengers
  ON station_passengers (year, passengers DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_sp_year_ranking
  ON station_passengers (year, ranking_in_year ASC NULLS LAST);