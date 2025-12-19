import { useEffect } from 'react'
import * as wasm from "crate" 

export default function App() {
  useEffect(() => {
    // 複雑な async 処理をやめて、直接呼んでみる
    try {
      console.log("Wasm modules:", wasm);
      // greet が存在するかチェックしてから実行
      if (wasm.greet) {
        wasm.greet("WebAssembly");
      } else {
        console.error("greet function not found in wasm module");
      }
    } catch (err) {
      console.error("Wasm execution failed:", err);
    }
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Rust + Wasm + React GA Project</h1>
      <p>ブラウザのアラートが表示されたら疎通成功です！</p>
    </div>
  )
}