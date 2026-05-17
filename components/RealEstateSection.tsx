// 市区町村ページ用: 不動産情報ライブラリ(国交省)の取引価格集計を小さく表示するセクション。
// データ (real_estate_market_stats) が無い市区町村では何も描画しない。

// annual / quarterly どちらの集計行も共通で受けられる表示用の型。
export type RealEstateStatRow = {
  property_type: string;
  transaction_count: number;
  median_price: number | string | null;
  median_price_per_sqm: number | string | null;
  median_price_per_tsubo: number | string | null;
  median_area_sqm: number | string | null;
  is_low_sample: boolean;
};

// property_type の表示名マッピング (アプリ側定数)
const PROPERTY_TYPE_LABEL: Record<string, string> = {
  land: '土地',
  land_and_building: '土地＋建物',
  used_condominium: '中古マンション等',
  farmland: '農地',
  forest: '林地',
};

// 円 -> 万円。数値化できなければ null。
function toMan(yen: number | string | null): number | null {
  if (yen == null) return null;
  const n = Number(yen);
  return Number.isFinite(n) ? n / 10000 : null;
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ color: '#6b7a99' }}>{label}</span>
      <span style={{ color: '#e8edf5', fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function RealEstateSection({
  rows,
  prefectureName,
  municipalityName,
  periodLabel,
}: {
  rows: RealEstateStatRow[];
  prefectureName: string;
  municipalityName: string;
  // 集計期間ラベル (例: '2024年通年' / '2024年第4四半期')。呼び出し側で決定する。
  periodLabel: string;
}) {
  // median_price が NULL の種別は表示しない
  const visible = rows.filter((r) => r.median_price != null);
  // データが無ければセクション自体を描画しない
  if (visible.length === 0) return null;

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.3rem', color: '#00d4aa', marginBottom: '0.5rem' }}>
        不動産取引価格の目安
      </h2>
      <p style={{ fontSize: '13px', color: '#6b7a99', marginBottom: '1rem', lineHeight: 1.7 }}>
        国土交通省 不動産情報ライブラリの不動産取引価格情報をもとに、
        {prefectureName}{municipalityName}の取引価格中央値を表示しています。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {visible.map((r) => {
          const label = PROPERTY_TYPE_LABEL[r.property_type] ?? r.property_type;
          const price = toMan(r.median_price);
          const perSqm = toMan(r.median_price_per_sqm);
          const perTsubo = toMan(r.median_price_per_tsubo);
          const area = r.median_area_sqm != null ? Number(r.median_area_sqm) : null;
          return (
            <div
              key={r.property_type}
              style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: '8px', padding: '14px 16px' }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>{label}</div>
              <div style={{ fontSize: '13px', lineHeight: 1.9, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {price != null && (
                  <StatItem label="取引価格中央値" value={`${Math.round(price).toLocaleString()}万円`} />
                )}
                {perSqm != null && (
                  <StatItem label="㎡単価中央値" value={`${perSqm.toFixed(1)}万円/㎡`} />
                )}
                {perTsubo != null && (
                  <StatItem label="坪単価中央値" value={`${perTsubo.toFixed(1)}万円/坪`} />
                )}
                {area != null && Number.isFinite(area) && (
                  <StatItem label="面積中央値" value={`${Math.round(area).toLocaleString()}㎡`} />
                )}
                <StatItem label="取引件数" value={`${r.transaction_count.toLocaleString()}件`} />
              </div>
              {r.is_low_sample && (
                <p style={{ fontSize: '11px', color: '#ffae42', marginTop: '8px', marginBottom: 0 }}>
                  取引件数が少ないため参考値です
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: '11px', color: '#6b7a99', marginTop: '12px', lineHeight: 1.7 }}>
        集計期間：{periodLabel}
        <br />
        出典：国土交通省 不動産情報ライブラリ（不動産取引価格情報）
      </p>
    </section>
  );
}
