import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const API_KEY = 'fd3d6e6af983c5ed5864bb2a173a361960e92bd1';

// e-Stat 人口統計 statsDataId
const STAT_IDS = {
  1995: '0000020101',
  2000: '0000020101', 
  2005: '0000020101',
  2010: '0000020101',
  2015: '0000020101',
  2020: '0000020201',
};

async function fetchPopulation(year) {
  const url = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${API_KEY}&statsDataId=${STAT_IDS[year]}&cdCat01=T001&limit=2000`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

const data2020 = await fetchPopulation(2020);
console.log(JSON.stringify(data2020).slice(0, 500));