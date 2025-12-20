mod utils;
mod ga;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) {
    // web-sys を使ってブラウザの alert を出す
    let window = web_sys::window().expect("no global `window` exists");
    
    // 実は web_sys の alert は「alert_with_message」という名前である場合があります
    // または &str を要求します。以下が確実な書き方です
    window.alert_with_message(&format!("Hello, {}! from Rust", name))
        .expect("alert failed");
}