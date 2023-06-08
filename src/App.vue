<script>
import * as monaco from 'monaco-editor';

const EDITOR_DEFAULT = `PROCEDURE CountToN(n: INTEGER)
    DECLARE i: INTEGER

    FOR i <- 1 TO n
        OUTPUT i
    NEXT i
ENDPROCEDURE

CALL CountToN(10)
`

monaco.languages.register({ id: 'pseudocode' });
let keywords = [
  'AND', 'APPEND', 'ARRAY', 'BOOLEAN', 'BYREF', 'BYVAL', 'CALL', 'CASE OF',
  'CHAR', 'CLOSEFILE', 'CONSTANT', 'DATE', 'DECLARE', 'DIV', 'ELSE', 'ENDCASE',
  'ENDFUNCTION', 'ENDIF', 'ENDPROCEDURE', 'ENDTYPE', 'ENDWHILE', 'EOF', 'FALSE',
  'FOR', 'TO', 'FUNCTION', 'GETRECORD', 'IF', 'INPUT', 'INTEGER', 'LCASE', 'LENGTH',
  'MID', 'MOD', 'NEXT', 'NOT', 'OPENFILE', 'OR', 'OTHERWISE', 'OUTPUT', 'PROCEDURE',
  'PUTRECORD', 'READ', 'READFILE', 'REAL', 'REPEAT', 'RETURN', 'RETURNS', 'RIGHT',
  'RND', 'SEEK', 'STEP', 'STRING', 'THEN', 'TRUE', 'TYPE', 'UCASE', 'UNTIL',
  'WHILE', 'WRITE', 'WRITEFILE'
];
monaco.languages.setLanguageConfiguration('pseudocode', {
	brackets: [
		['(', ')']
	],
  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: 'PROCEDURE', close: 'ENDPROCEDURE' },
    { open: 'FUNCTION', close: 'ENDFUNCTION'},
    { open: 'IF', close: 'ENDIF' },
    { open: 'CASE OF', close: 'ENDCASE' },
    { open: 'WHILE', close: 'ENDWHILE' }
  ],
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: 'PROCEDURE', close: 'ENDPROCEDURE' },
    { open: 'FUNCTION', close: 'ENDFUNCTION'},
    { open: 'IF', close: 'ENDIF' },
    { open: 'CASE OF', close: 'ENDCASE' },
    { open: 'WHILE', close: 'ENDWHILE' }
  ],
	onEnterRules: [
		{
			beforeText: new RegExp(
				'^\\s*(?:PROCEDURE|FUNCTION).*?:\\s*$'
			),
			action: { indentAction: monaco.languages.IndentAction.Indent }
		}
	],
	folding: {
		offSide: true,
		markers: {
			start: new RegExp('^\\s*#region\\b'),
			end: new RegExp('^\\s*#endregion\\b')
		}
	}
})
monaco.languages.setMonarchTokensProvider('pseudocode', {
  defaultToken: '',
  keywords: keywords,
  brackets: [
    { open: '(', close: ')', token: 'delimiter.parenthesis'}
  ],
  operators: ['<-', '+', '-', '*', '/', '>', '<', '>=', '<=', '<>', '=', '&'],

  tokenizer: {
    root: [
      { include: '@whitespace' },
			{ include: '@numbers' },
			{ include: '@strings' },

			[/@[a-zA-Z_]\w*/, 'tag'],
			[
				/[a-zA-Z_]\w*/,
				{
					cases: {
						'@keywords': 'keyword',
						'@default': 'identifier'
					}
				}
			]
    ],

		// Deal with white space, including single and multi-line comments
		whitespace: [
			[/\s+/, 'white'],
			[/(^\/\/.*$)/, 'comment'],
		],

		// Recognize strings, including those broken across lines with \ (but not without)
		strings: [
			[/"$/, 'string.escape', '@popall'],
			[/"/, 'string.escape', '@dblStringBody']
		],
		dblStringBody: [
			[/[^\\"]+$/, 'string', '@popall'],
			[/[^\\"]+/, 'string'],
			[/"/, 'string.escape', '@popall'],
		],
    numbers: [
			[/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number']
		],
  }
});

function consolify(code) {
  // Prefixes every line with a "> "
  let lines = []
  for (let i of code.trim().split('\n')) {
    lines.push(`>>> ${i}`)
  }

  return lines.join('\n');
}

async function executeCode(code) {
  if (code === "") {
    alert("You silly goose! You can't execute nothing!");
    this.stdout = null;
    return;
  }
  this.rendering = true;
  this.stdout = null;

  console.debug(`Executing: ${code}`)
  let response = await fetch('/api/execute', {
    method: "POST",
    body: JSON.stringify({'code': code}),
  }).then((response) => response.text());
  // let status = response.status;
  // response = await response.text()
  console.debug(`Received: ${response}`);

  this.rendering = false;
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
      stdout: 'Your console output will be redirected here',
      rendering: false
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
      <p class="text-4xl text-center text-zinc-400 font-semibold">Console</p>
      <hr class="w-60 self-center text-zinc-500 pb-2">
      <pre v-if="!rendering"><code class="whitespace-pre-wrap">{{ stdout }}</code></pre>
      <div v-else class="w-40 h-40 border-zinc-800 border-t-green-600 border-8 border-solid relative rounded-full m-auto mt-40 animate-spin"></div>
      <button @click="executeCode(this.editor.getValue())" class="m-auto relative mb-4 text-xl font-sans w-32 h-16 bg-zinc-800 rounded-xl text-bold duration-200 ease-in transition-all hover:bg-zinc-700 hover:mb-6">
        Execute 🚀
      </button>
    </div>
  </div>
</template>
