self.importScripts('/node_modules/nodejs-glue/nodejs_glue.js');
self.onmessage = async event => {
  const { build_interpret } = wasm_bindgen;
  await  wasm_bindgen("/node_modules/nodejs-glue/nodejs_glue_bg.wasm");
  build_interpret(event.data);
};