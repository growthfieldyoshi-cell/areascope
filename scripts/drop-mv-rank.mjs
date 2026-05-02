import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(databaseUrl)

async function main() {
  console.log('⚠️  Dropping mv_station_passenger_rank...')
  console.log('You will need to re-run setup:rank-mv after this.')

  await sql.query(`
    DROP MATERIALIZED VIEW IF EXISTS mv_station_passenger_rank
  `)

  console.log('✅ Drop complete')
}

main().catch((error) => {
  console.error('❌ Drop failed:', error)
  process.exit(1)
})
