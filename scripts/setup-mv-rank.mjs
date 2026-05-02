import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(databaseUrl)

async function main() {
  console.log('Creating materialized view mv_station_passenger_rank...')
  const startMV = Date.now()

  await sql.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS mv_station_passenger_rank AS
    WITH station_year_totals AS (
      SELECT
        s.station_group_slug,
        sp.year,
        CAST(SUM(sp.passengers) AS bigint) AS total_passengers
      FROM stations s
      JOIN station_passengers sp ON sp.station_key = s.station_key
      WHERE s.station_group_slug IS NOT NULL
        AND sp.passengers IS NOT NULL
      GROUP BY s.station_group_slug, sp.year
    )
    SELECT
      station_group_slug,
      year,
      total_passengers,
      RANK() OVER (
        PARTITION BY year
        ORDER BY total_passengers DESC NULLS LAST
      ) AS national_rank
    FROM station_year_totals
  `)

  console.log(`✅ MV created in ${Date.now() - startMV}ms`)

  console.log('\nCreating unique index idx_mv_rank_pk...')
  const startIdx1 = Date.now()
  await sql.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_rank_pk
    ON mv_station_passenger_rank (station_group_slug, year)
  `)
  console.log(`✅ in ${Date.now() - startIdx1}ms`)

  console.log('\nCreating index idx_mv_rank_year_rank...')
  const startIdx2 = Date.now()
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_mv_rank_year_rank
    ON mv_station_passenger_rank (year, national_rank)
  `)
  console.log(`✅ in ${Date.now() - startIdx2}ms`)

  console.log('\nCreating index idx_mv_rank_year_passengers...')
  const startIdx3 = Date.now()
  await sql.query(`
    CREATE INDEX IF NOT EXISTS idx_mv_rank_year_passengers
    ON mv_station_passenger_rank (year, total_passengers DESC)
  `)
  console.log(`✅ in ${Date.now() - startIdx3}ms`)

  console.log('\n--- Verification ---')

  const countResult = await sql.query(`
    SELECT COUNT(*) AS count FROM mv_station_passenger_rank
  `)
  console.log(`Total rows: ${countResult[0].count}`)

  const sample = await sql.query(`
    SELECT station_group_slug, year, total_passengers, national_rank
    FROM mv_station_passenger_rank
    WHERE year = (SELECT MAX(year) FROM mv_station_passenger_rank)
    ORDER BY national_rank
    LIMIT 5
  `)
  console.log('\nTop 5 stations (latest year):')
  console.table(sample)

  console.log('\n✅ Setup complete')
}

main().catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
