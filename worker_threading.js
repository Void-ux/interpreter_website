self.importScripts('/node_modules/nodejs-glue/nodejs_glue.js');

self.onmessage = async event => {
  console.log("here");
  // event.data[0] should be the Memory object, and event.data[1] is the value to pass into child_entry_point
  const { worker_entry_point } = wasm_bindgen;
  await wasm_bindgen("/node_modules/nodejs-glue/nodejs_glue_bg.wasm", event.data[0]);
  worker_entry_point(Number(event.data[1]));
}