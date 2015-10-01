/*

Distort Shader.
by dean alex.

 */

module.exports = function( THREE ){

    THREE.DistortPass = function(){

        this.alpha = 1;

		this.uniforms = {
			'tDiffuse':			{ type: 't', value: null }, // diffuse texture
			'timeCounter':		{ type: 'f', value: 0 }, // time counter (milliseconds)
            'alphaTransition':  { type: 'f', value: 1 }, // time counter (milliseconds)
		};

		this.vertexShader =
		'	varying vec2 vUv;'+
		'	void main(){'+
		'		vUv = uv;'+
		'		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );'+
		'	}';

		this.fragmentShader =
		'	uniform sampler2D tDiffuse;'+
		'	uniform float timeCounter;'+
        '   uniform float alphaTransition;'+
		'	varying vec2 vUv;'+

		'	void main(){'+

		// get polar coordinates of source texel
		'		float ds = vUv.s - 0.5;'+
		'		float dt = vUv.t - 0.5;'+
		'		float dis = sqrt( ds*ds + dt*dt );'+
		'		float ang = atan( dt, ds );'+

		// make distortion
		'		float dismf = sin( dis * 6.283185307179586 );'+ // strength of filter varies with distance from center
		'       float harmonic1 = sin( ds * 15.5 + dt * 27.7 + timeCounter * 0.006) * 0.004;'+ // main harmonic. (numbers dont mean anything special, just do it by eye)
		'       float harmonic2 = sin( ds * 135.5 + timeCounter * 0.005) * sin( dt * 25.00 + timeCounter * 0.007 ) * 0.002;'+ // sub harmonic. (numbers dont mean anything special, just do it by eye)

		// calculate new source texel
		'       float fade = clamp( (dismf - 0.65) / (0.75 - 0.65), 0.0, 1.0 );'+ // filter fades in between 0.65 and 0.75
		'		dis += (harmonic1 + harmonic2) * dismf * fade;'+
		'		float s = cos( ang ) * dis + 0.5;'+
		'		float t = sin( ang ) * dis + 0.5;'+

		// get texel color
		'		vec4 colFrag = texture2D( tDiffuse, vec2( s,t ));'+
        '       colFrag.a = alphaTransition;'+
		'		gl_FragColor = colFrag;'+
		'	}';


        this.material = new THREE.ShaderMaterial({
        	uniforms: this.uniforms,
        	vertexShader: this.vertexShader,
        	fragmentShader: this.fragmentShader,
            transparent: true
        });

        this.enabled = true;
        this.renderToScreen = false;
        this.needsSwap = true;

        this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
        this.scene  = new THREE.Scene();

        this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
        this.scene.add( this.quad );
    };

    THREE.DistortPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ){
            this.uniforms[ 'tDiffuse' ].value = readBuffer;
            this.uniforms[ 'timeCounter' ].value = Date.now() % (10000 * 4.97);
            this.uniforms[ 'alphaTransition' ].value = this.alpha;
            
            this.quad.material = this.material;

            if( this.renderToScreen ){

                renderer.render( this.scene, this.camera );

            }else{

                renderer.render( this.scene, this.camera, writeBuffer, false );
            }
        },

        animate : function(out) 
        {
            if(!out) this.alpha = 0;
            return TweenMax.to(this, .8, {alpha: out ? 0 : 1});
        },
    };

    return THREE.DistortPass;
};
