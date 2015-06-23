// reference https://github.com/spite/Wagner/blob/master/fragment-shaders/pixelate-fs.glsl

module.exports = {

    uniforms: {

        "tDiffuse" : { type: "t", value: null },
        "amount"   : { type: "f", value: 10. },
        "resolution" : {type: "v2", value: 0}

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "varying vec2 vUv;", 
        "uniform sampler2D tDiffuse;", 
        "uniform vec2 resolution;", 
        "uniform float amount;", 

        "void main() {",
            "float d = 1.0 / amount;",
            "float ar = resolution.x / resolution.y;",
            "float u = floor( vUv.x / d ) * d;",
            "d = ar / amount;",
            "float v = floor( vUv.y / d ) * d;",
            "gl_FragColor = texture2D( tDiffuse, vec2( u, v ) );",

        "}"

    ].join("\n")
}
