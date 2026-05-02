import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(databaseUrl)

async function main() {
  console.log('Refreshing mv_station_passenger_rank (CONCURRENTLY)...')
  const start = Date.now()

  await sql.query(`
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_station_passenger_rank
  `)

  console.log(`✅ Refresh complete in ${Date.now() - start}ms`)

  const countResult = await sql.query(`
    SELECT COUNT(*) AS count FROM mv_station_passenger_rank
  `)
  console.log(`Total rows: ${countResult[0].count}`)
}

main().catch((error) => {
  console.error('❌ Refresh failed:', error)
  process.exit(1)
})
