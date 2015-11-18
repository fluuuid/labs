import THREE from 'three.js';
const glslify = require('glslify');

class ScenePass {

  constructor() {

    this.rtt = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );

    this.materialScreen = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { type: "t", value: this.rtt } },
      vertexShader: glslify('./glsl/screen_vert.glsl'),
      fragmentShader: glslify('./glsl/screen_frag.glsl'),
      depthWrite: false
    })

    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight), this.materialScreen );
    this.quad.position.z = -100;
    this.scene.add( this.quad );

  }
}

export default ScenePass;