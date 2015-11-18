const glslify = require('glslify');

module.exports = function(THREE){

    var PyramidBloomPass = function (custom_func_text) {

        this.vertexShader = [
            "varying vec2 vUv;",
            "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}"
        ].join( "\n" );

        this.bloom_multiplier_color=new THREE.Vector3( 1.0, 1.0, 1.0);
        this.bloom_falloff_color=new THREE.Vector3( 1.0, 0.0, 1.0);

        var params={
            vertexShader: this.vertexShader,
            fragmentShader: glslify('./glsl/bloom/blur_frag.glsl'),
            uniforms:{
                blurAmount : {type: 'f', value:.25},
                d0: {type: 'v2', value:new THREE.Vector2( 0.0, 0.0 )},
                d1: {type: 'v2', value:new THREE.Vector2( 0.0, 0.0 )},
                d2: {type: 'v2', value:new THREE.Vector2( 0.0, 0.0 )},
                d3: {type: 'v2', value:new THREE.Vector2( 0.0, 0.0 )},
                my_color_texture: {type: 't', value:null},
                uv_scale: {type: 'v2', value:new THREE.Vector2( 1.0, 1.0 )}
            }
        }

        this.blur1_shader = new THREE.ShaderMaterial(params);

        if(custom_func_text){
            params.defines={CUSTOM_COLOR_FUNC: custom_func_text};
        }
        
        this.blur1_first_shader=new THREE.ShaderMaterial(params);

        this.plain_draw_shader = new THREE.ShaderMaterial({
            vertexShader: this.vertexShader,
            fragmentShader: glslify('./glsl/bloom/plain_draw.glsl'),
            uniforms:{
                color_multiplier: {type: 'v3', value:new THREE.Vector3(1.0, 1.0, 1.0)},
                my_color_texture: {type: 't', value:null},
                uv_scale: {type: 'v2', value:new THREE.Vector2( 1.0, 1.0 )}
            }
        }
        );

        this.enabled = true;
        this.needsSwap = false;
        this.clear = false;

        this.camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
        this.scene  = new THREE.Scene();

        this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
        this.scene.add( this.quad );

        this.downsampled_buffer=[];

    };

    PyramidBloomPass.prototype = {

        downsample_one : function(src, dest, shader)
        {
            var delta_scale=0.75;

            if(dest.width!=Math.floor(src.width/2) || dest.height!=Math.floor(src.height/2)){
                dest.setSize(Math.floor(src.width/2) , Math.floor(src.height/2));
            }

            this.quad.material=shader;
            shader.uniforms.d0.value=new THREE.Vector2( -delta_scale/src.width, -delta_scale/src.height );
            shader.uniforms.d1.value=new THREE.Vector2( delta_scale/src.width, -delta_scale/src.height );
            shader.uniforms.d2.value=new THREE.Vector2( -delta_scale/src.width, delta_scale/src.height );
            shader.uniforms.d3.value=new THREE.Vector2( delta_scale/src.width, delta_scale/src.height );
            shader.uniforms.my_color_texture.value=src;
            shader.uniforms.uv_scale.value.set((src.width&1>0)? (1.0-1.0/src.width): 1.0, (src.height&1>0)? (1.0-1.0/src.height) : 1.0 );

            this.renderer.render(this.scene, this.camera, dest);
        },

        downsample_all: function(base_fb)
        {
            //console.log("downsampleFB");
            this.downsampled_buffer[0]=base_fb;
            var src=base_fb;
            var i;
            for(i=1; src.width>3 && src.height>3; ++i){
                if(!this.downsampled_buffer[i]){
                    var params={minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
                        format: THREE.RGBFormat, type: base_fb.type, stencilBuffer: false, generateMipmaps: false}
                    this.downsampled_buffer[i]=new THREE.WebGLRenderTarget( Math.floor(src.width/2), Math.floor(src.height/2), params );
                }
                this.downsample_one(src, this.downsampled_buffer[i], i==1?this.blur1_first_shader:this.blur1_shader );
                src=this.downsampled_buffer[i];
            }
            // cleanup
            var n_buffers=i;
            while(i<this.downsampled_buffer.length){
                if(this.downsampled_buffer[i])this.downsampled_buffer[i].dispose();
                delete this.downsampled_buffer[i];
                ++i;
            }
            this.downsampled_buffer.length=n_buffers;
        },

        upsample_one: function(src, dest)
        {
            this.quad.material=this.plain_draw_shader;
            this.plain_draw_shader.uniforms.my_color_texture.value=src;
            this.plain_draw_shader.uniforms.uv_scale.value.set(dest.width/(src.width*2.0), dest.height/(src.height*2.0) );

            var auto_clear=this.renderer.autoClear;
            var auto_clear_color=this.renderer.autoClearColor;
            this.renderer.autoClear=false;
            this.renderer.autoClearColor=false;

            //this.renderer.setClearColor(0xFF0000, 0);
            this.renderer.render(this.scene, this.camera, dest, false);

            this.renderer.autoClear=auto_clear;
            this.renderer.autoClearColor=auto_clear_color;
        },

        upsample_all: function()
        {
            this.plain_draw_shader.transparent=true;
            this.plain_draw_shader.blending=THREE.CustomBlending;
            this.plain_draw_shader.blendSrc=THREE.OneFactor;
            this.plain_draw_shader.blendDst=THREE.OneFactor;
            this.plain_draw_shader.depthTest=false;
            this.plain_draw_shader.depthWrite=false;
            this.plain_draw_shader.uniforms.color_multiplier.value=this.bloom_falloff_color;
            for(var i=this.downsampled_buffer.length-1; i>1; --i){/// stops at i=2
                this.upsample_one(this.downsampled_buffer[i], this.downsampled_buffer[i-1]);
            }
            this.plain_draw_shader.uniforms.color_multiplier.value=this.bloom_multiplier_color;
            //if ( this.maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );
            if(this.downsampled_buffer.length>1)this.upsample_one(this.downsampled_buffer[1], this.downsampled_buffer[0]);
        },

        render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) 
        {
            this.renderer = renderer;
            var context=this.renderer.context;
            var old_setColorWrite=renderer.state.setColorWrite;
            /// turn off alpha
            // if(readBuffer.format==THREE.RGBAFormat){
                //console.log('blah');
                // context.colorMask(true, true, true, false);/// does not seem to work
                // HACK: keep three.js from overriding our colour mask
                // renderer.state.setColorWrite=function(){};
            // }

            this.maskActive=maskActive;

            if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

            this.downsample_all(readBuffer);
            this.upsample_all();

          /// turn on alpha
          if(readBuffer.format==THREE.RGBAFormat){
            context.colorMask(true, true, true, true);
            renderer.state.setColorWrite=old_setColorWrite;
          }
        }
    };

    return PyramidBloomPass;

}