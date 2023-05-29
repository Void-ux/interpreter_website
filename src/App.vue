<script>
import * as monaco from 'monaco-editor';
const {interpret} = wasm_bindgen;


async function run_wasm() {
    // Load the wasm file by awaiting the Promise returned by `wasm_bindgen`
    // `wasm_bindgen` was imported in `index.html`
    await wasm_bindgen();

    console.log('index.js loaded');

    // Run main WASM entry point
    // This will create a worker from within our Rust code compiled to WASM
    interpret('OUTPUT "HI"');
}

run_wasm();

const EDITOR_DEFAULT = `PROCEDURE CountToN(n: INTEGER)
    DECLARE i: INTEGER

    FOR i <- 1 TO n
        OUTPUT i
    NEXT i
ENDPROCEDURE

CALL CountToN(10)`

function consolify(code) {
    // Prefixes every line with a "> "
    let lines = []
    for (let i of code.trim().split('\n')) {
        lines.push(`> ${i}`)
    }

    return lines.join('\n');
}

async function executeCode(code) {
    if (code === "") {
        alert("You silly goose! You can't execute nothing!");
        this.stdout = null;
        return;
    }
    console.debug(`Executing: ${code}`)
    let response = await fetch('/api/execute', {
        method: "POST",
        body: JSON.stringify({'code': code}),
    }).then((response) => response.text());
    // let status = response.status;
    // response = await response.text()
    console.debug(`Received: ${response}`);

    this.stdout = response !== "" ? consolify(response) : 'No output'

}

export default {
    name: 'app',
    async mounted() {
        const el = this.$refs.editor;
        this.editor = monaco.editor.create(el, {
            value: EDITOR_DEFAULT,
            language: 'pseudocode',
            theme: 'vs-dark',
            fontSize: 18
        });
    },
    data() {
        return {
            stdout: null
        }
    },
    methods: {
        executeCode
    }
};
</script>

<template>
    <head>
        <title>Pseudocode Interpreter</title>
    </head>

    <div class="flex gap-0 w-screen h-screen">
        <div ref="editor" class="w-1/2 h-full">
        </div>

        <div class="flex flex-col gap-2 w-1/2 h-full px-10 pt-4 text-xl">
            <p class="text-4xl text-center text-zinc-500 font-semibold">Console</p>
            <hr class="w-60 self-center text-zinc-500 pb-2">
            <pre><code class="whitespace-pre-wrap">{{ stdout || 'Your console output will be redirected here' }}</code></pre>
            <button @click="executeCode(this.editor.getValue())" class="absolute w-32 h-16 bottom-1 left-1/2 bg-zinc-800 rounded-xl text-bold duration-200 ease-in transition-all hover:bg-zinc-700 hover:mb-1.5">
                Execute 🚀
            </button>
        </div>
    </div>
</template>
