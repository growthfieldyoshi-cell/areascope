# AreaScope 引き継ぎメモ

## 1. プロジェクト概要

| 項目 | 値 |
|---|---|
| サービス名 | AreaScope |
| 本番URL | https://areascope.jp |
| フレームワーク | Next.js 16.1.6 (App Router) |
| 言語 | TypeScript |
| DB | Neon PostgreSQL (サーバーレス) |
| ホスティング | Vercel |
| CSS | インラインstyle（Tailwind不使用） |
| 分析 | Google Analytics (G-W711TVYVQT) |
| ビルド | `NEXT_TURBOPACK=0 next build`（Webpack必須。Turbopackだと本番500エラー） |

### 主要 npm パッケージ
- `@neondatabase/serverless` — Webアプリ側のDB接続
- `pg` — スクリプト側のDB接続（.env.local の DATABASE_URL）
- `kuroshiro` / `kuroshiro-analyzer-kuromoji` — 読み仮名生成
- `wanakana` — カタカナ⇔ひらがな⇔ローマ字変換
- `csv-parse` — CSVインポート

---

## 2. DBテーブル構成

### schema_v2.sql に定義

| テーブル | PK | 主な用途 |
|---|---|---|
| `prefectures` | prefecture_code | 都道府県マスタ |
| `municipalities` | municipality_code(6桁) | 市区町村マスタ。`code5`(5桁)でstationsと結合 |
| `lines` | line_key | 路線マスタ |
| `stations` | station_key | 駅マスタ（9,012駅）。`station_group_slug`で同名駅をグループ化 |
| `station_passengers` | id (BIGSERIAL) | 駅別年次乗降者数。UNIQUE(station_key, year) |

### schema_v2.sql 外のテーブル

| テーブル | 用途 |
|---|---|
| `municipality_populations` | 市区町村人口(1995-2020)。municipality_code(5桁)で結合 |
| `station_reading_overrides` | 駅名読み仮名の手動修正。station_group_slugベース |

### 重要な結合キー
- `stations.municipality_code` (5桁) = `municipalities.code5` (5桁) ※code(6桁)ではない
- `station_passengers.station_key` = `stations.station_key`
- `municipality_populations.municipality_code` = `municipalities.code5`

### 駅読み仮名カラム（stationsに追加済み）
- `station_name_hiragana` / `station_name_katakana` / `station_name_initial_kana` / `url_slug`

### 自治体読み仮名カラム（municipalitiesに追加済み）
- `municipality_name_hiragana` / `municipality_name_katakana` / `municipality_name_initial_kana`

---

## 3. 完了した作業一覧

### データ基盤
- [x] 駅読み仮名一括生成（fill-station-readings.mjs）+ 663駅の手動override補正
- [x] 自治体読み仮名一括生成（fill-municipality-readings.mjs）
- [x] 2022年・2023年乗降者数データ投入（import-passengers-2022-2023.mjs）
- [x] 最新年の動的取得（MAX(year)）を全ページに適用

### ページ（データ系）
- [x] 駅検索 `/station`
- [x] 駅詳細 `/station/[slug]`（時系列グラフ付き）
- [x] 駅一覧 `/station/list`（ページネーション付き）
- [x] 駅ランキング `/station-ranking`（最新年動的・都道府県フィルタ）
- [x] 都道府県別駅ランキング `/station-ranking/[prefectureSlug]`（47都道府県SSG）
- [x] かな別駅一覧 `/station/list/[kana]`（11ページSSG）
- [x] かな別駅一覧×都道府県 `/station/list/[kana]/[prefecture_slug]`
- [x] 路線一覧 `/line`・路線詳細 `/line/[slug]`・路線ランキング `/line/[slug]/ranking`
- [x] 都道府県一覧 `/prefecture`・都道府県詳細 `/prefecture/[slug]`
- [x] 市区町村一覧 `/city`
- [x] 市区町村詳細 `/city/[prefecture_slug]/[municipality_slug]`
- [x] かな別市区町村一覧 `/city/list/[kana]`
- [x] かな別市区町村×都道府県 `/city/list/[kana]/[prefecture_slug]`
- [x] 人口分析 `/population`

### ページ（コンテンツ系）
- [x] 難読駅名一覧 `/station/hard-reading`（クイズ形式トグルUI）
- [x] 難読市区町村名一覧 `/city/hard-reading`
- [x] クイズ一覧 `/quiz`
- [x] 難読駅名クイズ `/station/quiz`
- [x] 難読市区町村名クイズ `/city/quiz`
- [x] 都道府県当てクイズ `/station/quiz/prefecture`
- [x] 乗降者数クイズ `/station/quiz/passengers`
- [x] 路線当てクイズ `/station/quiz/line`

### SEO記事（69本）
- [x] エリア分析記事 22本（住みやすさ・通勤・データの見方など）
- [x] 都道府県別駅ランキング記事 47本（全県完了、DB連動）
- [x] 都道府県別ランキングハブ `/articles/prefecture-ranking`
- [x] 記事一覧 `/articles`（カテゴリ分類表示）

### インフラ・SEO
- [x] sitemap.ts（動的生成：駅・市区町村・かな別・都道府県ランキング・記事）
- [x] robots.txt
- [x] 運営者情報 `/about`（データ出典・ライセンス表記付き）
- [x] プライバシーポリシー `/privacy`
- [x] フッター出典表記（国土数値情報）
- [x] Google Analytics 設置
- [x] ビルド修正（Turbopack→Webpack）

---

## 4. 残タスク・未対応

### 優先度高
- [ ] AdSense審査対応（申請→審査待ち or 再申請）
- [ ] 東京記事のハードコードランキング→DB連動化（他46県は対応済み）
- [ ] `how-to-find-livable-city` の記事ページが存在しない可能性（ARTICLE_SLUGSにあるが未確認）

### 優先度中
- [ ] OGP画像の設定（og-default.jpg の実ファイル）
- [ ] 404ページのカスタマイズ
- [ ] パフォーマンス最適化（DB接続プーリング等）
- [ ] 記事一覧ページのページネーション（現在は全件表示）

### 将来
- [ ] 不動産価格データとの連携
- [ ] 駅周辺の商業施設情報追加
- [ ] AIによるエリア将来予測
- [ ] LINE_MAP の全路線整備（現在21路線のみ）
- [ ] 埼京線のDB上line_name分散問題の解決

---

## 5. 重要な技術メモ

### ビルド（最重要）
```bash
# 必ずWebpackでビルド。Turbopackだと .next/server/app/ が生成されず全ページ500
npm run build  # = NEXT_TURBOPACK=0 next build
```

### DB接続
- Webアプリ: `@neondatabase/serverless` の `neon(process.env.DATABASE_URL!)`
- スクリプト: `pg` の `Client` + `.env.local`

### slug規則
- 駅: `station_group_slug`（例: `shinjuku-tokyo-shinjukuku`）
- 都道府県: `prefecture_slug`（例: `tokyo`, `kanagawa`）
- 市区町村: `municipality_slug`（例: `kawasakishi`）
- 路線: LINE_MAP のキー（例: `yamanote`, `keio-inokashira`）

### 最新年の取得パターン（全ページ共通）
```typescript
async function getLatestYear(): Promise<number> {
  const rows = await sql`SELECT MAX(year) AS year FROM station_passengers`;
  return rows[0]?.year ?? 2021;
}
```

### デザイン仕様（インラインstyle統一）
| 要素 | 値 |
|---|---|
| 背景 | `#0a0e1a` |
| アクセント | `#00d4aa` |
| テキスト(メイン) | `#e8edf5` |
| テキスト(サブ) | `#aaa` |
| カード背景 | `#111827` |
| ボーダー | `#1e2d45` |
| 補助テキスト | `#6b7a99` |

### かな行グループ（11種）
`あ / か / さ / た / な / は / ま / や / ら / わ / その他`

### municipalities 結合の注意
- `municipalities.code` = 6桁（チェックディジット付き）
- `municipalities.code5` = 5桁（JISコード）
- `stations.municipality_code` = 5桁
- **JOIN時は必ず `m.code5 = s.municipality_code`**

---

## 6. ファイル構成の要点

```
app/
├── page.tsx                          # TOPページ（async、DB接続あり）
├── layout.tsx                        # ルートレイアウト（GA・フッター出典）
├── sitemap.ts                        # 動的sitemap生成
├── about/page.tsx                    # 運営者情報+データ出典
├── privacy/page.tsx                  # プライバシーポリシー
├── station/
│   ├── page.tsx                      # 駅検索
│   ├── [slug]/page.tsx               # 駅詳細（時系列グラフ）
│   ├── list/page.tsx                 # 駅一覧
│   ├── list/[kana]/page.tsx          # かな別駅一覧
│   ├── list/[kana]/[prefecture_slug] # かな別×都道府県
│   ├── hard-reading/                 # 難読駅名一覧
│   └── quiz/                         # クイズ4種
├── station-ranking/
│   ├── page.tsx                      # 全国ランキング
│   └── [prefectureSlug]/page.tsx     # 都道府県別ランキング
├── city/
│   ├── page.tsx                      # 市区町村一覧
│   ├── [prefecture_slug]/[municipality_slug] # 市区町村詳細
│   ├── list/[kana]/                  # かな別市区町村
│   ├── hard-reading/                 # 難読市区町村名
│   └── quiz/                         # 難読クイズ
├── line/                             # 路線一覧・詳細・ランキング
├── prefecture/[slug]                 # 都道府県詳細
├── population/                       # 人口分析
├── quiz/page.tsx                     # クイズ一覧ハブ
└── articles/
    ├── page.tsx                      # 記事一覧（カテゴリ分類）
    ├── prefecture-ranking/           # 都道府県別ランキングハブ
    ├── *-station-ranking-2023/       # 47都道府県ランキング記事（DB連動）
    └── [テーマ別記事22本]/            # エリア分析記事（静的）

scripts/
├── fill-station-readings.mjs         # 駅読み仮名一括生成
├── fill-municipality-readings.mjs    # 自治体読み仮名一括生成
├── import-passengers-2022-2023.mjs   # 2022-2023年乗降者数投入
├── build-overrides-from-csv.mjs      # 読み仮名override SQL生成
├── export-review-candidates.mjs      # 読み仮名レビュー候補CSV出力
└── [その他インポート系スクリプト]

components/
└── Breadcrumb.tsx                    # パンくずコンポーネント
```

---

## 補足

### sitemap.ts の ARTICLE_SLUGS
記事追加時は以下2箇所を更新：
1. `app/sitemap.ts` の `ARTICLE_SLUGS` 配列
2. `app/articles/page.tsx` の `CATEGORIES` または `OTHER_ARTICLES` 配列

### 出典・ライセンス
- 駅乗降者数: 国土数値情報 S12（政府標準利用規約 第2.0版）
- 人口データ: 総務省 e-Stat
- 出典URLは app/about/page.tsx と app/layout.tsx（フッター）に記載済み
