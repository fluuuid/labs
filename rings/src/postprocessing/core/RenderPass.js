/**
 * @author alteredq / http://alteredqualia.com/
 */

module.exports = function(THREE)
{
    THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

        this.debugRenderAlpha = 1;

        this.scene = scene;
        this.camera = camera;

        this.overrideMaterial = overrideMaterial;

        this.clearColor = clearColor;
        this.clearAlpha = this.debugRenderAlpha;
        // this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;

        this.oldClearColor = new THREE.Color();
        this.oldClearAlpha = this.debugRenderAlpha;

        this.enabled = true;
        this.clear = true;
        this.needsSwap = false;

    };

    THREE.RenderPass.prototype = {

        render: function ( renderer, writeBuffer, readBuffer, delta ) {

            this.scene.overrideMaterial = this.overrideMaterial;

            if ( this.clearColor ) {

                this.oldClearColor.copy( renderer.getClearColor() );
                this.oldClearAlpha = this.debugRenderAlpha

                renderer.setClearColor( this.clearColor, this.debugRenderAlpha );

            }

            renderer.render( this.scene, this.camera, readBuffer, this.clear );

            if ( this.clearColor ) {

                renderer.setClearColor( this.oldClearColor, this.debugRenderAlpha );

            }

            this.scene.overrideMaterial = null;

        }

    };

    return THREE.RenderPass;

}