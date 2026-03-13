import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export default async function StationsPage() {

  const stations = await sql`
    SELECT station_name, line_name, prefecture_name
    FROM stations
    LIMIT 50
  `

  return (
    <main style={{ padding: "40px" }}>
      <h1>駅一覧</h1>

      <ul>
        {stations.map((station: any, index: number) => (
          <li key={index}>
            {station.station_name}（{station.line_name} / {station.prefecture_name}）
          </li>
        ))}
      </ul>

    </main>
  )
}