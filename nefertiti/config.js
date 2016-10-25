System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ],
    "blacklist": []
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  packages: {
    "three": {
      "exports": "THREE",
      "format": "global",
      "map": {
        "./loaders/OBJLoader": "./examples/js/loaders/OBJLoader.js"
      },
      "meta": {
        "examples/js/loaders/OBJLoader.js": {
          "globals": {
            "THREE": "three"
          },
          "exports": "THREE.OBJLoader",
          "format": "global"
        }
      }
    }
  },

  map: {
    "babel": "npm:babel-core@5.8.35",
    "babel-runtime": "npm:babel-runtime@5.8.35",
    "concat-stream": "npm:concat-stream@1.5.1",
    "core-js": "npm:core-js@1.2.6",
    "dat-gui": "npm:dat-gui@0.5.0",
    "fs": "npm:fs@0.0.2",
    "glsl-deparser": "npm:glsl-deparser@1.0.0",
    "glslify": "npm:glslify@5.0.2",
    "glslify-deps": "npm:glslify-deps@1.2.5",
    "glslify-loader": "npm:glslify-loader@1.0.2",
    "glslify-stream": "npm:glslify-stream@1.1.1",
    "multipipe": "npm:multipipe@0.3.0",
    "new-from": "npm:new-from@0.0.3",
    "once": "npm:once@1.3.3",
    "path": "github:jspm/nodelibs-path@0.1.0",
    "peteruithoven/systemjs-debugger": "github:peteruithoven/systemjs-debugger@0.0.1",
    "raw-loader": "npm:raw-loader@0.5.1",
    "resolve": "npm:resolve@1.1.7",
    "stats-js": "npm:stats-js@1.0.0-alpha1",
    "text": "github:systemjs/plugin-text@0.0.4",
    "three": "github:mrdoob/three.js@master",
    "three-orbit-controls": "npm:three-orbit-controls@72.0.0",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-constants@0.1.0": {
      "constants-browserify": "npm:constants-browserify@0.0.1"
    },
    "github:jspm/nodelibs-events@0.1.1": {
      "events": "npm:events@1.0.2"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-stream@0.1.0": {
      "stream-browserify": "npm:stream-browserify@1.0.0"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:acorn@1.2.2": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:amdefine@1.0.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "module": "github:jspm/nodelibs-module@0.1.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.35": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:bl@0.9.5": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "readable-stream": "npm:readable-stream@1.0.33",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:bl@1.1.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "readable-stream": "npm:readable-stream@2.0.5",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.6",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:colors@0.6.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:commander@2.1.0": {
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:commondir@0.0.1": {
      "path": "github:jspm/nodelibs-path@0.1.0"
    },
    "npm:concat-stream@1.4.10": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13",
      "typedarray": "npm:typedarray@0.0.6"
    },
    "npm:concat-stream@1.5.1": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@2.0.5",
      "typedarray": "npm:typedarray@0.0.6"
    },
    "npm:constants-browserify@0.0.1": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:core-util-is@1.0.2": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:cssauron-glsl@0.0.1": {
      "cssauron": "npm:cssauron@0.0.3"
    },
    "npm:cssauron-glsl@1.0.0": {
      "cssauron": "npm:cssauron@1.0.0"
    },
    "npm:cssauron@1.0.0": {
      "through": "npm:through@1.1.2"
    },
    "npm:duplexer2@0.0.2": {
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:duplexer2@0.1.4": {
      "readable-stream": "npm:readable-stream@2.0.5"
    },
    "npm:duplexer@0.0.4": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:emit-function@0.0.2": {
      "events": "github:jspm/nodelibs-events@0.1.1"
    },
    "npm:escodegen@0.0.28": {
      "esprima": "npm:esprima@1.0.4",
      "estraverse": "npm:estraverse@1.3.2",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "source-map": "npm:source-map@0.1.43",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:escodegen@1.3.3": {
      "esprima": "npm:esprima@1.1.1",
      "estraverse": "npm:estraverse@1.5.1",
      "esutils": "npm:esutils@1.0.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "source-map": "npm:source-map@0.1.43",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:esprima@1.0.4": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:esprima@1.1.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:falafel@1.2.0": {
      "acorn": "npm:acorn@1.2.2",
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "foreach": "npm:foreach@2.0.5",
      "isarray": "npm:isarray@0.0.1",
      "object-keys": "npm:object-keys@1.0.9"
    },
    "npm:findup@0.1.5": {
      "colors": "npm:colors@0.6.2",
      "commander": "npm:commander@2.1.0",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:glsl-deparser@1.0.0": {
      "cssauron-glsl": "npm:cssauron-glsl@1.0.0",
      "through": "npm:through@1.1.2"
    },
    "npm:glsl-inject-defines@1.0.3": {
      "glsl-token-inject-block": "npm:glsl-token-inject-block@1.1.0",
      "glsl-token-string": "npm:glsl-token-string@1.0.1",
      "glsl-tokenizer": "npm:glsl-tokenizer@2.0.2"
    },
    "npm:glsl-parser@1.0.1": {
      "glsl-tokenizer": "npm:glsl-tokenizer@1.1.1",
      "through": "npm:through@2.3.4"
    },
    "npm:glsl-resolve@0.0.1": {
      "path": "github:jspm/nodelibs-path@0.1.0",
      "resolve": "npm:resolve@0.6.3",
      "xtend": "npm:xtend@2.2.0"
    },
    "npm:glsl-token-defines@1.0.0": {
      "glsl-tokenizer": "npm:glsl-tokenizer@2.0.2"
    },
    "npm:glsl-token-descope@1.0.2": {
      "glsl-token-assignments": "npm:glsl-token-assignments@2.0.1",
      "glsl-token-depth": "npm:glsl-token-depth@1.1.2",
      "glsl-token-properties": "npm:glsl-token-properties@1.0.1",
      "glsl-token-scope": "npm:glsl-token-scope@1.1.2"
    },
    "npm:glsl-tokenizer@1.1.1": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "through": "npm:through@2.3.4"
    },
    "npm:glsl-tokenizer@2.0.2": {
      "through2": "npm:through2@0.6.5"
    },
    "npm:glslify-bundle@2.0.4": {
      "glsl-inject-defines": "npm:glsl-inject-defines@1.0.3",
      "glsl-token-defines": "npm:glsl-token-defines@1.0.0",
      "glsl-token-depth": "npm:glsl-token-depth@1.1.2",
      "glsl-token-descope": "npm:glsl-token-descope@1.0.2",
      "glsl-token-scope": "npm:glsl-token-scope@1.1.2",
      "glsl-token-string": "npm:glsl-token-string@1.0.1",
      "glsl-tokenizer": "npm:glsl-tokenizer@2.0.2"
    },
    "npm:glslify-bundle@5.0.0": {
      "glsl-inject-defines": "npm:glsl-inject-defines@1.0.3",
      "glsl-token-defines": "npm:glsl-token-defines@1.0.0",
      "glsl-token-depth": "npm:glsl-token-depth@1.1.2",
      "glsl-token-descope": "npm:glsl-token-descope@1.0.2",
      "glsl-token-scope": "npm:glsl-token-scope@1.1.2",
      "glsl-token-string": "npm:glsl-token-string@1.0.1",
      "glsl-token-whitespace-trim": "npm:glsl-token-whitespace-trim@1.0.0",
      "glsl-tokenizer": "npm:glsl-tokenizer@2.0.2",
      "murmurhash-js": "npm:murmurhash-js@1.0.0",
      "shallow-copy": "npm:shallow-copy@0.0.1"
    },
    "npm:glslify-deps@1.2.5": {
      "events": "npm:events@1.0.2",
      "findup": "npm:findup@0.1.5",
      "glsl-resolve": "npm:glsl-resolve@0.0.1",
      "glsl-tokenizer": "npm:glsl-tokenizer@2.0.2",
      "graceful-fs": "npm:graceful-fs@4.1.3",
      "inherits": "npm:inherits@2.0.1",
      "map-limit": "npm:map-limit@0.0.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "resolve": "npm:resolve@1.1.7"
    },
    "npm:glslify-loader@1.0.2": {
      "glslify": "npm:glslify@2.3.1",
      "path": "github:jspm/nodelibs-path@0.1.0"
    },
    "npm:glslify-stream@1.1.1": {
      "commondir": "npm:commondir@0.0.1",
      "cssauron": "npm:cssauron@0.0.3",
      "cssauron-glsl": "npm:cssauron-glsl@0.0.1",
      "emit-function": "npm:emit-function@0.0.2",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "glsl-parser": "npm:glsl-parser@1.0.1",
      "glsl-resolve": "npm:glsl-resolve@0.0.1",
      "glsl-tokenizer": "npm:glsl-tokenizer@1.1.1",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "resolve": "npm:resolve@0.5.1",
      "shortest": "npm:shortest@0.0.0",
      "stream-combiner": "npm:stream-combiner@0.0.2",
      "through": "npm:through@2.3.4",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "wrap-stream": "npm:wrap-stream@0.0.0"
    },
    "npm:glslify@2.3.1": {
      "bl": "npm:bl@0.9.5",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "glsl-resolve": "npm:glsl-resolve@0.0.1",
      "glslify-bundle": "npm:glslify-bundle@2.0.4",
      "glslify-deps": "npm:glslify-deps@1.2.5",
      "minimist": "npm:minimist@1.2.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "resolve": "npm:resolve@1.1.7",
      "static-module": "npm:static-module@1.3.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0",
      "through2": "npm:through2@0.6.5",
      "xtend": "npm:xtend@4.0.1"
    },
    "npm:glslify@5.0.2": {
      "bl": "npm:bl@1.1.2",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "glsl-resolve": "npm:glsl-resolve@0.0.1",
      "glslify-bundle": "npm:glslify-bundle@5.0.0",
      "glslify-deps": "npm:glslify-deps@1.2.5",
      "minimist": "npm:minimist@1.2.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "resolve": "npm:resolve@1.1.7",
      "static-module": "npm:static-module@1.3.0",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0",
      "through2": "npm:through2@0.6.5",
      "xtend": "npm:xtend@4.0.1"
    },
    "npm:graceful-fs@4.1.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "constants": "github:jspm/nodelibs-constants@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:has@1.0.1": {
      "function-bind": "npm:function-bind@1.1.0"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:map-limit@0.0.1": {
      "once": "npm:once@1.3.3"
    },
    "npm:multipipe@0.3.0": {
      "duplexer2": "npm:duplexer2@0.1.4",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:new-from@0.0.3": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "readable-stream": "npm:readable-stream@1.1.13",
      "stream": "github:jspm/nodelibs-stream@0.1.0",
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:once@1.3.3": {
      "wrappy": "npm:wrappy@1.0.1"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process-nextick-args@1.0.6": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:quote-stream@0.0.0": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "minimist": "npm:minimist@0.0.8",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "through2": "npm:through2@0.4.2"
    },
    "npm:readable-stream@1.0.33": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:readable-stream@1.1.13": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream-browserify": "npm:stream-browserify@1.0.0",
      "string_decoder": "npm:string_decoder@0.10.31"
    },
    "npm:readable-stream@2.0.5": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0",
      "core-util-is": "npm:core-util-is@1.0.2",
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "isarray": "npm:isarray@0.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "process-nextick-args": "npm:process-nextick-args@1.0.6",
      "string_decoder": "npm:string_decoder@0.10.31",
      "util-deprecate": "npm:util-deprecate@1.0.2"
    },
    "npm:resolve@0.5.1": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:resolve@0.6.3": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:resolve@1.1.7": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:shortest@0.0.0": {
      "assert": "github:jspm/nodelibs-assert@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:source-map@0.1.43": {
      "amdefine": "npm:amdefine@1.0.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:static-eval@0.2.4": {
      "escodegen": "npm:escodegen@0.0.28"
    },
    "npm:static-module@1.3.0": {
      "concat-stream": "npm:concat-stream@1.4.10",
      "duplexer2": "npm:duplexer2@0.0.2",
      "escodegen": "npm:escodegen@1.3.3",
      "falafel": "npm:falafel@1.2.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "has": "npm:has@1.0.1",
      "object-inspect": "npm:object-inspect@0.4.0",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "quote-stream": "npm:quote-stream@0.0.0",
      "readable-stream": "npm:readable-stream@1.0.33",
      "shallow-copy": "npm:shallow-copy@0.0.1",
      "static-eval": "npm:static-eval@0.2.4",
      "through2": "npm:through2@0.4.2"
    },
    "npm:stream-browserify@1.0.0": {
      "events": "github:jspm/nodelibs-events@0.1.1",
      "inherits": "npm:inherits@2.0.1",
      "readable-stream": "npm:readable-stream@1.1.13"
    },
    "npm:stream-combiner@0.0.2": {
      "duplexer": "npm:duplexer@0.0.4"
    },
    "npm:string_decoder@0.10.31": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:through2@0.4.2": {
      "readable-stream": "npm:readable-stream@1.0.33",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "xtend": "npm:xtend@2.1.2"
    },
    "npm:through2@0.6.5": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "readable-stream": "npm:readable-stream@1.0.33",
      "util": "github:jspm/nodelibs-util@0.1.0",
      "xtend": "npm:xtend@4.0.1"
    },
    "npm:through@1.1.2": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:through@2.3.4": {
      "process": "github:jspm/nodelibs-process@0.1.2",
      "stream": "github:jspm/nodelibs-stream@0.1.0"
    },
    "npm:util-deprecate@1.0.2": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:wrap-stream@0.0.0": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "through": "npm:through@2.3.4"
    },
    "npm:xtend@2.1.2": {
      "object-keys": "npm:object-keys@0.4.0"
    }
  }
});
