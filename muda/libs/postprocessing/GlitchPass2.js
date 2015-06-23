/*

Glitch Shader.
by dean alex.

 */

module.exports = function( THREE ){

    THREE.GlitchPass2 = function(){

		this.uniforms = {
			'tDiffuse':			{ type: 't', value: null }, // diffuse texture
			'timeCounter':		{ type: 'f', value: 0 }, // time counter (milliseconds)
			'amount':		    { type: 'f', value: 0 }, // amount to apply effect
			'randomseed':	    { type: 'f', value: 0 }, // random seed
			'glitchtype':	    { type: 'f', value: 0 }, // glitch type (0,1,2)
		};

		this.vertexShader =
		'	varying vec2 vUv;'+
		'	void main(){'+
		'		vUv = uv;'+
		'		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );'+
		'	}';

		this.fragmentShader =
		'	uniform sampler2D tDiffuse;'+
		'	varying vec2 vUv;'+

		'	uniform float timeCounter;'+
		'	uniform float amount;'+
		'	uniform float randomseed;'+
		'	uniform float glitchtype;'+

		'	void main(){'+

		// get offsets
		'		float s = vUv.s;'+
		'		float t = vUv.t;'+
		'		float ycut0 = fract( sin( timeCounter * 0.000001 + randomseed ) * 123.456 );'+
		'		float ycut1 = ycut0 + 0.1;'+
		'       float mfA = amount * -cos( timeCounter * 0.001 );'+
		'       float mfB = amount * sin( t * 6.2831 * 3.0 + timeCounter * 0.01 );'+
		'		float mf = mfA;'+
		'		if( t > ycut0 && t < ycut1 ) mf = mfB;'+
		'		float cost = cos( timeCounter * 0.0005 + randomseed );'+
		'		if( mod( abs( cost - 0.5 ), 0.3) > 0.2 ) mf *= 0.2;'+

		// get texel colors
		'		vec4 colFrag1 = texture2D( tDiffuse, vec2( s + 0.10 * mf,t ));'+
		'		vec4 colFrag2 = texture2D( tDiffuse, vec2( s,t ));'+
		'		vec4 colFrag3 = texture2D( tDiffuse, vec2( s - 0.05 * mf,t ));'+

		// mix texels
        '       vec4 colMix1 = vec4( colFrag1.r, colFrag2.g * 0.8 + colFrag1.r * 0.2, colFrag3.b, 1.0 );'+
        '       colMix1.a = max(colMix1.x, max(colMix1.y, colMix1.z)) ;'+
		'       vec4 colMix2 = colFrag2;'+
        '       colMix2.a = max(colMix2.x, max(colMix2.y, colMix2.z)) ;'+
		'       vec4 colMix3 = vec4( colFrag2.r, colFrag2.g * 0.5 + colFrag1.r * 0.2 + colFrag1.b * 0.3, colFrag3.b, 1.0 );'+
        '       colMix3.a = max(colMix3.x, max(colMix3.y, colMix3.z)) ;'+
		'		if( glitchtype < 1.0 ){'+
		'			gl_FragColor = colMix1;'+
		'		}else if( glitchtype < 2.0 ){'+
		'			gl_FragColor = colMix2;'+
		'		}else if( glitchtype < 3.0 ){'+
		'			gl_FragColor = colMix3;'+
		'		}else{'+
		'			gl_FragColor = mix( mix( colMix1, colMix3, fract(abs(sin( t*5.0 + timeCounter * 0.01 ))) ), colMix2, abs(cos(randomseed + timeCounter + t * 8.0 )));'+
		'		}'+
		'	}';

        this.material = new THREE.ShaderMaterial({
        	uniforms: this.uniforms,
        	vertexShader: this.vertexShader,
        	fragmentShader: this.fragmentShader
        });

        this.enabled = true;
        this.renderToScreen = false;
        this.needsSwap = true;

        this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
        this.scene  = new THREE.Scene();

        this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
        this.scene.add( this.quad );
    };

    THREE.GlitchPass2.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ){
        	var now = Date.now();

            this.uniforms[ 'tDiffuse' ].value = readBuffer;
            this.uniforms[ 'timeCounter' ].value = now % (10000 * 4.97);

            if( !this.randomSeed || Math.random()<.01 ) this.randomSeed = Math.random(); // random seed number (that changes randomly but not every frame)
            this.uniforms['randomseed'].value = parseFloat( this.randomSeed );

            var mf = Math.sin( now * 0.005 + this.randomSeed );
            var gt = (( mf*mf*mf * 0.5) + 0.5) * 3 >>0;
            if( this.randomSeed * now % 2000 < 100 ) gt = 3; // randomly set to 3

            // there are three types of glitch - rgb shift, gb shift, none - every time the type changes, reset the amount and make it gradually tween out from zero.
            var oldGlitchType = this.glitchType || 0;
            this.glitchType = gt;
            this.uniforms['glitchtype'].value = this.glitchType;

            if( !this.amountMorph ) this.amountMorph = 0;
            if( oldGlitchType !== this.glitchType ) this.amountMorph = 0;
            this.amountMorph = this.amountMorph * 0.8 + this.maxAmount * 0.2; // approach the maximum, at a rate of 20% per frame.
            this.uniforms['amount'].value = this.amountMorph;

            //
            this.quad.material = this.material;

            if( this.renderToScreen ){
                renderer.render( this.scene, this.camera );
            }else{
                renderer.render( this.scene, this.camera, writeBuffer, false );
            }
        }
    };

    return THREE.GlitchPass2;
};
