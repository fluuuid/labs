module.exports = function(THREE)
{
    THREE.NoiseShader = {

        uniforms: {

            "tDiffuse": { type: "t", value: null },
            "amount":  { type: "f", value: .57 },
            "speed":   { type: "f", value: 0 },
            "time":    { type: "f", value: 0 },

        },

        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "uniform float amount;",
            "uniform float speed;",
            "uniform float time;",

            "uniform sampler2D tDiffuse;",

            "varying vec2 vUv;",

            "float random(vec2 n, float offset ){",
            "    //return fract(sin(dot(gl_FragCoord.xyz+seed,scale))*43758.5453);",
            "    return .5 - fract(sin(dot(n.xy + vec2( offset, 0. ), vec2(12.9898, 78.233)))* 43758.5453);",
            "}",

            "void main() {",
            "   vec4 color = texture2D( tDiffuse, vUv );",
            "   color += vec4( vec3( amount * random( vUv, .000005 * speed * time ) ), .5 );",
            "   gl_FragColor = color;",
            "}",

        ].join("\n")

    };

    return THREE.NoiseShader;

}