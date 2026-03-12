import { NextRequest, NextResponse } from 'next/server';

const API_KEY = 'fd3d6e6af983c5ed5864bb2a173a361960e92bd1';

const CENSUS_TABLES = [
  { year: 2020, id: '0003445078' },
  { year: 2015, id: '0003412420' },
  { year: 2010, id: '0003412419' },
  { year: 2005, id: '0003412418' },
  { year: 2000, id: '0003412417' },
  { year: 1995, id: '0003412416' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cityCode = searchParams.get('cityCode');

  if (!cityCode) {
    return NextResponse.json({ error: 'cityCode required' }, { status: 400 });
  }

  const results = await Promise.allSettled(
    CENSUS_TABLES.map(async ({ year, id }) => {
      const apiUrl = `https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=${API_KEY}&lang=J&statsDataId=${id}&cdArea=${cityCode}&metaGetFlg=N&cntGetFlg=N&limit=10`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.GET_STATS_DATA?.RESULT?.STATUS !== 0) throw new Error('no data');
      const values = data.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE;
      if (!values) throw new Error('no values');
      const arr = Array.isArray(values) ? values : [values];
      let pop = 0;
      for (const v of arr) {
        const cat = v['@cat01'] || '';
        if (cat === '0' || cat === '00' || cat === '000') {
          pop = parseInt((v['$'] || '').replace(/[^0-9]/g, ''));
          break;
        }
      }
      if (!pop) {
        for (const v of arr) {
          const n = parseInt((v['$'] || '').replace(/[^0-9]/g, ''));
          if (!isNaN(n) && n > pop) pop = n;
        }
      }
      if (!pop || pop <= 1000) throw new Error('invalid pop');
      return { year, pop };
    })
  );

  const popData = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as any).value)
    .sort((a, b) => a.year - b.year);

  return NextResponse.json({ popData });
}