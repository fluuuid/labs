 module.exports = function(THREE)
 {

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

    ].join( "\n" ),

    fragmentShader: [

        "uniform float opacity;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "gl_FragColor = opacity * texel;",

        "}"

    ].join( "\n" )

};

THREE.EffectComposer = function ( renderer, renderTarget ) {

    this.renderer = renderer;

    if ( renderTarget === undefined ) {

        var pixelRatio = renderer.getPixelRatio();

        var width  = Math.floor( renderer.context.canvas.width  / pixelRatio ) || 1;
        var height = Math.floor( renderer.context.canvas.height / pixelRatio ) || 1;
        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            stencilBuffer: false ,
            blending: THREE.CustomBlending,
            blendSrc: THREE.SrcAlphaFactor,
            blendDst: THREE.OneFactor,
        };

        renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
        renderTarget.texture.format = THREE.RGBAFormat;
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.passes = [];

    if ( THREE.CopyShader === undefined )
        console.error( "THREE.EffectComposer relies on THREE.CopyShader" );

    this.copyPass = new THREE.ShaderPass( THREE.CopyShader );

};

THREE.EffectComposer.prototype = {

    swapBuffers: function() {

        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;

    },

    addPass: function ( pass ) {

        this.passes.push( pass );

    },

    insertPass: function ( pass, index ) {

        this.passes.splice( index, 0, pass );

    },

    render: function ( delta ) {

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        var maskActive = false;

        var pass, i, il = this.passes.length;

        for ( i = 0; i < il; i ++ ) {

            pass = this.passes[ i ];
            // console.log(pass)

            if ( ! pass.enabled ) continue;

            pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

            if ( pass.needsSwap ) {

                if ( maskActive ) {

                    var context = this.renderer.context;

                    context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

                    this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

                    context.stencilFunc( context.EQUAL, 1, 0xffffffff );

                }

                this.swapBuffers();

            }

            if ( pass instanceof THREE.MaskPass ) {

                maskActive = true;

            } else if ( pass instanceof THREE.ClearMaskPass ) {

                maskActive = false;

            }

        }

    },

    reset: function ( renderTarget ) {

        if ( renderTarget === undefined ) {

            renderTarget = this.renderTarget1.clone();

            var pixelRatio = this.renderer.getPixelRatio();

            renderTarget.width  = Math.floor( this.renderer.context.canvas.width  / pixelRatio );
            renderTarget.height = Math.floor( this.renderer.context.canvas.height / pixelRatio );

        }

        this.renderTarget1.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2.dispose();
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

    },

    setSize: function ( width, height ) {

        this.renderTarget1.setSize( width, height );
        this.renderTarget2.setSize( width, height );

    }

};


THREE.ShaderPass = function ( shader, textureID ) {

    this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.material = new THREE.ShaderMaterial( {

        defines: shader.defines || {},
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,

    } );

    this.renderToScreen = false;

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;


    this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.ShaderPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        if ( this.uniforms[ this.textureID ] ) {

            this.uniforms[ this.textureID ].value = readBuffer;

        }

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        }

    }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

    this.scene = scene;
    this.camera = camera;

    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;

    this.inverse = false;

};

THREE.MaskPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        var context = renderer.context;

        // don't update color or depth

        context.colorMask( false, false, false, false );
        context.depthMask( false );

        // set up stencil

        var writeValue, clearValue;

        if ( this.inverse ) {

            writeValue = 0;
            clearValue = 1;

        } else {

            writeValue = 1;
            clearValue = 0;

        }

        context.enable( context.STENCIL_TEST );
        context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
        context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
        context.clearStencil( clearValue );

        // draw into the stencil buffer

        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        // re-enable update of color and depth

        context.colorMask( true, true, true, true );
        context.depthMask( true );

        // only render where stencil is set to 1

        context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
        context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

    }

};


THREE.ClearMaskPass = function () {

    this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        var context = renderer.context;

        context.disable( context.STENCIL_TEST );

    }

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

    this.oldClearColor = new THREE.Color();
    this.oldClearAlpha = 1;

    this.enabled = true;
    this.clear = true;
    this.needsSwap = false;

};

THREE.RenderPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        this.scene.overrideMaterial = this.overrideMaterial;

        if ( this.clearColor ) {

            this.oldClearColor.copy( renderer.getClearColor() );
            this.oldClearAlpha = renderer.getClearAlpha();

            renderer.setClearColor( this.clearColor, this.clearAlpha );
            renderer.setClearAlpha(0);

        }

        renderer.render( this.scene, this.camera, readBuffer, this.clear );

        if ( this.clearColor ) {

            renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
            renderer.setClearAlpha(0);

        }

        this.scene.overrideMaterial = null;

    }

};


}
