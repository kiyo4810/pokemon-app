import { useState, useEffect } from 'react'; // これが必要です！
import './Counter.css';

export const Counter = () => {
  // count:中身が変わると再レンダリングされる特別な変数
  // setCount:更新用の関数。値を書き換える専用リモコン。count = 1と代入はNG。setCount(1)やsetCount(count+1) とすべし
  // ここでの0は初期値
  const [count, setCount] = useState(0);

  /*
   * useEffectは、第一引数にcallbackを入れて、第二引数に依存する値の配列を入れる
   * 依存する値が変更される度にcallbackが実行される
   */
  useEffect(() => {
    console.log(count);
  }, [count]);

  return (
    <div className="Counter btn">
      <div>{count}</div>
      <button onClick={() => setCount(count + 1)}>特に意味のないカウンター</button>
      <hr />
    </div>
  );
};
