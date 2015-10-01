/*

AntiAlias Shader

 */

module.exports = function( THREE ){

    THREE.AntiAliasPass = function(){

		this.uniforms = {
			'tDiffuse':			{ type: 't', value: null }, // diffuse texture
			'resWidth':		    { type: 'f', value: 0 },
			'resHeight':		{ type: 'f', value: 0 }
		};

		this.vertexShader =
		'	varying vec2 vUv;'+
		'	void main(){'+
		'		vUv = uv;'+
		'		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );'+
		'	}';

		this.fragmentShader =
        'uniform sampler2D tDiffuse;'+
		'uniform float resWidth;'+
		'uniform float resHeight;'+

        'varying vec2 vUv;'+

        'float FXAA_REDUCE_MIN  = (1.0/128.0);'+
        'float FXAA_REDUCE_MUL  = (1.0/8.0);'+
        'float FXAA_SPAN_MAX    = 8.0;'+

        'void main() {'+
    	'	vec2 resolution = vec2( 1.0/resWidth, 1.0/resHeight );'+
    	'	vec2 xyFragCoord = gl_FragCoord.xy;'+

        '	vec3 rgbNW = texture2D( tDiffuse, ( xyFragCoord + vec2( -1.0, -1.0 ) ) * resolution ).xyz;'+
        '	vec3 rgbNE = texture2D( tDiffuse, ( xyFragCoord + vec2( 1.0, -1.0 ) ) * resolution ).xyz;'+
        '	vec3 rgbSW = texture2D( tDiffuse, ( xyFragCoord + vec2( -1.0, 1.0 ) ) * resolution ).xyz;'+
        '	vec3 rgbSE = texture2D( tDiffuse, ( xyFragCoord + vec2( 1.0, 1.0 ) ) * resolution ).xyz;'+
        '	vec4 rgbaM  = texture2D( tDiffuse,  xyFragCoord  * resolution );'+
        '	vec3 rgbM  = rgbaM.xyz;'+
        '	vec3 luma = vec3( 0.299, 0.587, 0.114 );'+

        '	float lumaNW = dot( rgbNW, luma );'+
        '	float lumaNE = dot( rgbNE, luma );'+
        '	float lumaSW = dot( rgbSW, luma );'+
        '	float lumaSE = dot( rgbSE, luma );'+
        '	float lumaM  = dot( rgbM,  luma );'+
        '	float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );'+
        '	float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );'+

        '	vec2 dir;'+
        '	dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));'+
        '	dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));'+

        '	float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );'+
        '	float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );'+
        '	dir = min( vec2( FXAA_SPAN_MAX, FXAA_SPAN_MAX), max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) * resolution;'+
        '	vec4 rgbA = (1.0/2.0) * ('+
        '	texture2D(tDiffuse,  xyFragCoord  * resolution + dir * (1.0/3.0 - 0.5)) +'+
        '	texture2D(tDiffuse,  xyFragCoord  * resolution + dir * (2.0/3.0 - 0.5)));'+
        '	vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * ('+
        '	texture2D(tDiffuse,  xyFragCoord  * resolution + dir * (0.0/3.0 - 0.5)) +'+
        '	texture2D(tDiffuse,  xyFragCoord  * resolution + dir * (3.0/3.0 - 0.5)));'+
        '	float lumaB = dot(rgbB, vec4(luma, 0.0));'+

        '	if(( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {'+
        '		gl_FragColor = rgbA;'+
        '	}else{'+
        '		gl_FragColor = rgbB;'+
        '	}'+
        '}';



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

    THREE.AntiAliasPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ){
            this.uniforms[ 'tDiffuse' ].value = readBuffer;
            this.uniforms[ 'resWidth' ].value = renderer.domElement.width;
            this.uniforms[ 'resHeight' ].value = renderer.domElement.height;

            this.quad.material = this.material;

            if( this.renderToScreen ){

                renderer.render( this.scene, this.camera );

            }else{

                renderer.render( this.scene, this.camera, writeBuffer, false );
            }
        }
    };

    return THREE.AntiAliasPass;
};
