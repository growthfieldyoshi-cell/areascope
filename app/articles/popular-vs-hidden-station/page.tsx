import Link from 'next/link';

const sectionStyle = {
  background: '#111827',
  border: '1px solid #1e2d45',
  borderRadius: '12px',
  padding: '28px',
  marginBottom: '24px',
};

const h2Style = {
  fontSize: '20px',
  fontWeight: 700 as const,
  color: '#00d4aa',
  marginBottom: '16px',
};

const pStyle = {
  color: '#aaa',
  fontSize: '15px',
  lineHeight: 1.8,
  marginBottom: '12px',
};

const linkStyle = {
  color: '#00d4aa',
  textDecoration: 'underline' as const,
};

export default function PopularVsHiddenStationPage() {
  return (
    <main style={{ background: '#0a0e1a', minHeight: '100vh', color: '#e8edf5', fontFamily: 'sans-serif' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.4 }}>
          人気駅と穴場駅の<br /><span style={{ color: '#00d4aa' }}>違いとは？</span>
        </h1>

        <p style={{ color: '#e8edf5', fontSize: '16px', lineHeight: 1.8, marginBottom: '12px', fontWeight: 600 }}>
          人気駅＝自分にとって最適な駅、ではありません。人気の高さは競争の激しさでもあります。
        </p>
        <p style={{ ...pStyle, marginBottom: '32px' }}>
          住みたい街ランキングで名前が挙がる駅は注目度が高い反面、家賃が高騰し、物件の競争率も上がります。一方で、知名度は低いが利便性は十分という「穴場駅」は、条件次第で人気駅より快適な選択肢になりえます。この記事では、人気駅と穴場駅の違いをデータで整理します。
        </p>

        <div style={sectionStyle}>
          <h2 style={h2Style}>人気駅の特徴</h2>
          <p style={pStyle}>
            人気駅は乗降者数が多く、商業施設が充実し、メディアで取り上げられる頻度が高い駅です。交通利便性が高く、複数路線が使えるケースが多い傾向があります。
          </p>
          <p style={pStyle}>
            しかし、人気が高いということは需要が供給を上回りやすいことを意味します。家賃は周辺駅より高く、物件の空きが出にくく、引越しのタイミングが限られます。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            また、乗降者数が多い駅ほど混雑・騒音が日常的になり、住環境としてはデメリットも伴います。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>穴場駅の3つの条件</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>① 利便性はあるが知名度が低い</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              乗降者数が3万〜10万人程度で運行本数も十分だが、ランキングやメディアにはあまり登場しない駅です。通勤先へのアクセスは人気駅と遜色ないのに、注目度が低いため家賃が抑えられている傾向があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>② 人口が安定〜増加傾向</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              穴場駅の周辺で人口が安定または緩やかに増加しているなら、住宅需要は維持されている証拠です。生活インフラが急に縮小するリスクは低い傾向があります。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>③ 日常向けの商業が揃っている</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              大型商業施設や話題の飲食店はなくても、スーパー・コンビニ・クリニック・ドラッグストアが駅周辺に揃っているなら、日常生活の利便性は十分です。派手さはないが実用的、というのが穴場駅の特徴です。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>駅の4パターン</h2>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人気 × 利便性高い</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              知名度も利便性も高い駅。ただし家賃・混雑・競争率も高い。予算に余裕がある場合の選択肢です。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>人気 × 利便性は普通</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              メディアのイメージで人気があるが、実際の利便性は周辺駅と大差ないケース。ブランド料が家賃に上乗せされている可能性があります。
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>穴場 × 利便性高い（狙い目）</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              知名度は低いが利便性は十分な駅。家賃と住環境のバランスが最も取れやすいパターンです。乗降者数と人口推移をデータで確認することで見つけられます。
            </p>
          </div>

          <div>
            <p style={{ color: '#e8edf5', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>穴場 × 利便性低い</p>
            <p style={{ ...pStyle, marginBottom: 0 }}>
              家賃は安いが運行本数が少ない、商業施設がないなど、安いなりの理由があるケース。コスト以外の条件を確認しないと後悔しやすいです。
            </p>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>NG例：人気駅＝最適という判断</h2>
          <p style={pStyle}>
            「住みたい街ランキングで上位だから」という理由で人気駅を選んだ結果、家賃が予算を圧迫し、通勤路線は混雑が激しく、結局1年で引越したというケースがあります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人気駅は「多くの人にとって魅力的に見える駅」であり、自分の条件（通勤先・予算・生活スタイル）に合うかは別問題です。人気と最適は同義ではありません。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>AreaScopeでの調べ方</h2>
          <p style={pStyle}>
            <Link href="/station-ranking" style={linkStyle}>駅乗降者数ランキング</Link>で候補エリアの駅の規模感を確認できます。人気駅の周辺で乗降者数がやや少ない駅を探すと、穴場候補が見つかりやすい傾向があります。
          </p>
          <p style={pStyle}>
            <Link href="/station/list" style={linkStyle}>駅一覧</Link>から個別の駅の乗降者数推移を確認すれば、利用者が安定〜増加しているかを判断できます。増加傾向の穴場駅は、今後さらに便利になる可能性があります。
          </p>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            <Link href="/city" style={linkStyle}>市区町村一覧</Link>で周辺の人口推移を確認し、人口が安定しているかどうかを合わせて見ることで、穴場の実態がより正確に把握できます。
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>まとめ</h2>
          <p style={{ ...pStyle, marginBottom: 0 }}>
            人気駅は利便性が高い反面、家賃・混雑・競争率のデメリットがあります。穴場駅は知名度こそ低いものの、利便性・人口安定性・日常商業の条件が揃っていれば、人気駅より快適な選択肢になりえます。乗降者数と人口推移をデータで確認し、「人気かどうか」ではなく「自分の条件に合うかどうか」で駅を選ぶことが重要です。
          </p>
        </div>

        <div style={{ ...sectionStyle, textAlign: 'center' as const }}>
          <h2 style={{ ...h2Style, marginBottom: '12px' }}>データでエリアを確認してみる</h2>
          <p style={{ color: '#6b7a99', fontSize: '13px', marginBottom: '16px' }}>
            気になるエリアがあれば、まずデータを確認するところから始めてみてください。
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/city" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>市区町村から探す</Link>
            <Link href="/station/list" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>駅から探す</Link>
            <Link href="/station-ranking" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>ランキングを見る</Link>
            <Link href="/articles" style={{ display: 'inline-block', color: '#00d4aa', border: '1px solid #00d4aa', borderRadius: '6px', padding: '10px 20px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>他の記事を見る</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
