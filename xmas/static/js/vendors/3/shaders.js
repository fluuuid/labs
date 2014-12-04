/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

    uniforms: {},

    vertexShader: [

        "void main() {",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "void main() {",

            "gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

        "}"

    ].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "opacity":  { type: "f", value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "gl_FragColor = opacity * texel;",

        "}"

    ].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

    defines: {

        "KERNEL_SIZE_FLOAT": "25.0",
        "KERNEL_SIZE_INT": "25",

    },

    uniforms: {

        "tDiffuse":        { type: "t", value: null },
        "uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
        "cKernel":         { type: "fv1", value: [] }

    },

    vertexShader: [

        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float cKernel[ KERNEL_SIZE_INT ];",

        "uniform sampler2D tDiffuse;",
        "uniform vec2 uImageIncrement;",

        "varying vec2 vUv;",

        "void main() {",

            "vec2 imageCoord = vUv;",
            "vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

            "for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

                "sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
                "imageCoord += uImageIncrement;",

            "}",

            "gl_FragColor = sum;",

        "}"


    ].join("\n"),

    buildKernel: function ( sigma ) {

        // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

        function gauss( x, sigma ) {

            return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

        }

        var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

        if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
        halfWidth = ( kernelSize - 1 ) * 0.5;

        values = new Array( kernelSize );
        sum = 0.0;
        for ( i = 0; i < kernelSize; ++i ) {

            values[ i ] = gauss( i - halfWidth, sigma );
            sum += values[ i ];

        }

        // normalize the kernel

        for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

        return values;

    }

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

    uniforms: {

        "tDiffuse":   { type: "t", value: null },
        "time":       { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.5 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount":     { type: "f", value: 4096 },
        "grayscale":  { type: "i", value: 1 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        // control parameter
        "uniform float time;",

        "uniform bool grayscale;",

        // noise effect intensity value (0 = no effect, 1 = full effect)
        "uniform float nIntensity;",

        // scanlines effect intensity value (0 = no effect, 1 = full effect)
        "uniform float sIntensity;",

        // scanlines effect count value (0 = no effect, 4096 = full effect)
        "uniform float sCount;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

            // sample the source
            "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

            // make some noise
            "float x = vUv.x * vUv.y * time *  1000.0;",
            "x = mod( x, 13.0 ) * mod( x, 123.0 );",
            "float dx = mod( x, 0.01 );",

            // add noise
            "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

            // get us a sine and cosine
            "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

            // add scanlines
            "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

            // interpolate between source and result by intensity
            "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

            // convert to grayscale if desired
            "if( grayscale ) {",

                "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

            "}",

            "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

        "}"

    ].join("\n")

};
/**
 * @author felixturner / http://airtight.cc/
 *
 * Static effect. Additively blended digital noise.
 *
 * amount - amount of noise to add (0 - 1)
 * size - size of noise grains (pixels)
 *
 */

THREE.StaticShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "time":     { type: "f", value: 0.0 },
        "amount":   { type: "f", value: 0.5 },
        "size":     { type: "f", value: 4.0 }
    },

    vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

    ].join("\n"),

    fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float time;",
    "uniform float amount;",
    "uniform float size;",

    "varying vec2 vUv;",

    "float rand(vec2 co){",
        "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
    "}",

    "void main() {",
        "vec2 p = vUv;",
        "vec4 color = texture2D(tDiffuse, p);",
        "float xs = floor(gl_FragCoord.x / size);",
        "float ys = floor(gl_FragCoord.y / size);",
        "vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",

        //"gl_FragColor = color + amount * ( snow - color );", //interpolate

        "gl_FragColor = color+ snow;", //additive

    "}"

    ].join("\n")

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "offset":   { type: "f", value: 1.0 },
        "darkness": { type: "f", value: 1.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float offset;",
        "uniform float darkness;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

            // Eskil's vignette

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
            "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

            /*
            // alternative version from glfx.js
            // this one makes more "dusty" look (as opposed to "burned")

            "vec4 color = texture2D( tDiffuse, vUv );",
            "float dist = distance( vUv, vec2( 0.5 ) );",
            "color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
            "gl_FragColor = color;",
            */

        "}"

    ].join("\n")

};