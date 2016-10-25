import THREE from 'three';

class RenderPass {

  constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {

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
  }

  render ( renderer, writeBuffer, readBuffer, delta ) {

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
}

export default RenderPass;
