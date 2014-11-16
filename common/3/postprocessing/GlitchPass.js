/**
 
 */

THREE.GlitchPass = function ( dt_size, interactions ) {

	if ( THREE.DigitalGlitch === undefined ) console.error( "THREE.GlitchPass relies on THREE.DigitalGlitch" );
	
	var shader = THREE.DigitalGlitch;
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	if(dt_size==undefined) dt_size=64;
	
	
	this.uniforms[ "tDisp"].value=this.generateHeightmap(dt_size);

	this.sequence = [];

	this.material = new THREE.ShaderMaterial({
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});

	this.enabled = true;
	this.renderToScreen = false;
	this.needsSwap = true;

	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();

	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );
	
	this.goWild=false;
	this.curF=0;
	this.interactions = interactions || 80;
	// this.generateTrigger();
	
};

THREE.GlitchPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) 
	{
		this.uniforms[ "tDiffuse" ].value = readBuffer;
		this.uniforms[ 'seed' ].value=Math.random();//default seeding
		this.uniforms[ 'byp' ].value=1;

		if(this.sequence.length > 0)
		{
			if(this.sequence[this.curF] == 0)
			{
				this.uniforms[ 'amount' ].value=Math.random()/30;
				this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
				this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-1,1);
				this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-1,1);
				this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
				this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
				this.uniforms[ 'byp' ].value=0;
			}
			else if(this.sequence[this.curF] == 1)
			{
				this.uniforms[ 'amount' ].value=Math.random()/90;
				this.uniforms[ 'angle' ].value=THREE.Math.randFloat(-Math.PI,Math.PI);
				this.uniforms[ 'distortion_x' ].value=THREE.Math.randFloat(0,1);
				this.uniforms[ 'distortion_y' ].value=THREE.Math.randFloat(0,1);
				this.uniforms[ 'seed_x' ].value=THREE.Math.randFloat(-0.3,0.3);
				this.uniforms[ 'seed_y' ].value=THREE.Math.randFloat(-0.3,0.3);
				this.uniforms[ 'byp' ].value=0;

			} else {
				this.uniforms[ 'byp' ].value=1;
			}

			this.curF++;

			if(this.curF > this.sequence.length)
			{
				this.curF=0;
				this.sequence = [];
				this.uniforms[ 'byp' ].value=0;
			}
		}

		this.quad.material = this.material;
		if ( this.renderToScreen ) 
		{
			renderer.render( this.scene, this.camera );
		} 
		else 
		{
			renderer.render( this.scene, this.camera, writeBuffer, false );
		}
	},
	generateTrigger:function()
	{
		for(i = 0; i<this.interactions; i++)
		{
			this.sequence.push(Math.round(Math.random() * 3))
		}
	},
	generateHeightmap:function(dt_size)
	{
		var data_arr = new Float32Array( dt_size*dt_size * 3 );
		// console.log(dt_size);
		var length=dt_size*dt_size;
		
		for ( var i = 0; i < length; i++) 
		{
			var val=THREE.Math.randFloat(0,1);
			data_arr[ i*3 + 0 ] = val;
			data_arr[ i*3 + 1 ] = val;
			data_arr[ i*3 + 2 ] = val;
		}
		
		var texture = new THREE.DataTexture( data_arr, dt_size, dt_size, THREE.RGBFormat, THREE.FloatType );
		// console.log(texture);
		// console.log(dt_size);
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.needsUpdate = true;
		texture.flipY = false;
		return texture;
	}
};