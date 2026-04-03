import { useEffect, useState } from 'react';
import './App.css';
import { getAllPokemon, getPokemon } from './utils/pokemon';
import Card from './components/Card/Card';
import Navbar from './components/Navbar/Navbar';

function App() {
  const initialURL = 'https://pokeapi.co/api/v2/pokemon';
  const [loading, setLoading] = useState(true);
  const [pokemonData, setPokemonData] = useState([]);
  const [nextURL, setNextURL] = useState('');
  const [prevURL, setPrevURL] = useState('');
  /*
   * useEffectは、第一引数にcallbackを入れて、第二引数に依存する値の配列を入れる
   * 依存する値が変更される度にcallbackが実行される
   */
  useEffect(() => {
    const fetchPokemonData = async () => {
      // すべてのポケモンデータを取得
      // ① データを取ってくる（時間がかかる作業）
      let res = await getAllPokemon(initialURL);
      // 各ポケモンの詳細なデータを取得
      // ② 詳細データを取ってくる（これも時間がかかる作業）
      await loadPokemon(res.results);
      console.log(res.next);
      setNextURL(res.next);
      setPrevURL(res.previous);

      // ③ ここがポイント！
      // 上の ① と ② が終わるまで、プログラムはここで「待機」します。
      // 無事にデータが全部揃ったら、ようやく次の行に進めます。
      setLoading(false); // ← ここであなたが「よし、終わったから false にして！」と命令した
    };
    fetchPokemonData();
    // #### 空の配列を第二引数に仕込む重要な意味
    // 「いいかいReactくん。これから loading が false になったり、
    // ポケモンデータが書き換わったりユーザーが文字入力したりして、
    // 何度も App 関数をやり直すことになるだろう。
    // でも、この『APIからデータを取ってくる作業』だけは、
    // 最初の一回だけで十分だから、2回目以降は無視してスルーしてくれよ！」
  }, []);
  const loadPokemon = async (data) => {
    // allの意味は今回、20件すべてのfetchが終わるまでの意味。
    // Promise.all()カギ括弧の中には配列を入れる
    let _pokemonData = await Promise.all(
      data.map((pokemon) => {
        // console.log(pokemon);
        let pokemonRecord = getPokemon(pokemon.url);
        return pokemonRecord;
      }),
    );
    setPokemonData(_pokemonData);
  };

  // console.log(pokemonData);
  const handleNextPage = async () => {
    setLoading(true);
    let data = await getAllPokemon(nextURL);
    console.log(data);
    await loadPokemon(data.results);
    setNextURL(data.next);
    setPrevURL(data.previous);
    setLoading(false);
  };
  const handlePrevPage = async () => {
    if (!prevURL) return;
    setLoading(true);
    let data = await getAllPokemon(prevURL);
    await loadPokemon(data.results);
    setNextURL(data.next);
    setPrevURL(data.previous);
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="App">
        {loading ? (
          <h1>ロード中・・・</h1>
        ) : (
          <>
            <div className="pokemonCardContainer">
              {pokemonData.map((pokemon, i) => {
                return <Card key={i} pokemon={pokemon} />;
              })}
            </div>
            <div className="btn">
              <button onClick={handlePrevPage}>前へ</button>
              <button onClick={handleNextPage}>次へ</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;

/* ================================================================
【完全解説：ポケモン図鑑アプリが動く 4つのフェーズ】
================================================================

第1フェーズ：準備（アプリが立ち上がった瞬間）
--------------------------------------------------
プログラムが読み込まれると、State（データの保管箱）が用意されます。
・loading: 最初は true（あなたが「今は準備中だよ！」と定義した状態）
・pokemonData: 最初は []（空っぽの配列）
この時点では、画面には「ロード中・・・」だけが表示されています。

第2フェーズ：useEffect の発動（最初の一回だけ実行）
--------------------------------------------------
画面に「ロード中」が出た直後、useEffect が動き出します。
・fetchPokemonData() が実行され、APIから「20件の名前とURLのリスト」を取得。
・名前だけでは画像がないため、次の詳細データ取得ステップへバトンタッチします。

第3フェーズ：詳細データの「一斉取得」（Promise.all）
--------------------------------------------------
・data.map で20匹分の「詳細情報を取ってきてね」という予約リストを作成。
・Promise.all を使い、「20匹全員分が揃うまで待つよ！」と一斉に取得（Fetch）。
・全員分が揃った瞬間に、保管箱（setPokemonData）へドサッと保存します。
・最後に setLoading(false) を実行。ここで「準備完了！」のスイッチを押します。

第4フェーズ：再レンダリング（画面の完成）
--------------------------------------------------
Stateが更新されたので、Reactがもう一度画面を描き直します。
・loading が false になったので、画面の表示が「カードを表示する側」に切り替わる。
・保管箱のデータを1つずつ取り出し、<Card /> コンポーネントを20枚並べます。
・これで、画面にポケモンたちがズラッと並んで完成です！

💡 初学者が「おっ」となるポイント
--------------------------------------------------
1. なぜ async/await を使うの？
   API通信は返事に時間がかかるため、「返事が来るまで次の行に行かずに待っててね」
   という指示です。これがないとデータが届く前に次の処理が進んでエラーになります。

2. なぜわざわざ loadPokemon を分けるの？
   「全体のリストを取る作業」と「1匹ずつの詳細を取る作業」は別物だからです。
   分けて書くことで、後で読み返した時に理解しやすくなります。

3. console.log(pokemonData) が2回動くのはなぜ？
   1回目は「空のとき（最初の描画）」、2回目は「データが入ったとき（再描画後）」
   に動くからです。Reactが状態の変化を正しく検知している証拠です！

この「データを取ってきて、Stateに入れ、画面を切り替える」という流れは、
モダンなWeb開発で必ず使う【最強の王道パターン】です。
================================================================ */
