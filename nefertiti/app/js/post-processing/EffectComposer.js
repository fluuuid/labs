import { CopyShader } from './CopyShader';
import ShaderPass     from './ShaderPass';
import MaskPass       from './MaskPass';
import ClearMaskPass  from './ClearMaskPass';
import RenderPass     from './RenderPass';
import THREE          from 'three';

/**
* @author alteredq / http://alteredqualia.com/
* @modified to ES6 module by @silviopaganini
*
* Full-screen textured quad shader
*/

class EffectComposer {

  constructor(renderer, renderTarget) {

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

    if ( CopyShader === undefined )
        console.error( "THREE.EffectComposer relies on CopyShader" );

    this.copyPass = new ShaderPass( CopyShader );

  }

  swapBuffers() {

      var tmp = this.readBuffer;
      this.readBuffer = this.writeBuffer;
      this.writeBuffer = tmp;

  }

  addPass ( pass ) {

      this.passes.push( pass );

  }

  insertPass ( pass, index ) {

      this.passes.splice( index, 0, pass );

  }

  render ( delta ) {

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

          if ( pass instanceof MaskPass ) {

              maskActive = true;

          } else if ( pass instanceof ClearMaskPass ) {

              maskActive = false;

          }

      }

  }

  reset ( renderTarget ) {

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

  }

  setSize ( width, height ) {

      this.renderTarget1.setSize( width, height );
      this.renderTarget2.setSize( width, height );

  }
}

export default EffectComposer;
