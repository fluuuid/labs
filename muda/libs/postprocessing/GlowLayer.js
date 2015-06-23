var _ = require('underscore');

module.exports = function(THREE)
{
    var GlowLayer = function(radius, position)
    {
        radius = radius || 50;
        position = position || new THREE.Vector3(0, 0, 0);
        this.amount = 0;

        this.mesh = null

        this.vertexShader = [
            "varying vec3 vNormal;",
            "void main() ",
            "{",
            "    vNormal = normalize( normalMatrix * normal );",
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}",
        ].join("\n");

        this.fragment = [
            "varying vec3 vNormal;",
            "uniform vec3 glowColor;",
            "uniform float power;",
            "uniform float amount;",
            "void main() ",
            "{",
            "    float intensity = pow( power - dot( vNormal, vec3( 0.0, 0.0, amount ) ), 5. ); ",
            "    vec3 glow = glowColor * intensity;",
            "    gl_FragColor = vec4( glow, intensity );",
            "}",
        ].join("\n");

        this.glowMaterial = new THREE.ShaderMaterial({
            uniforms : {
                "amount"    : {type: 'f', value: 0.0},
                "glowColor" : {type: "c", value: new THREE.Color( 0xffffff )},
                "power"     : {type: 'f', value: window.installationMode ? 0.17 : .15},
            },
            side           : THREE.BackSide,
            vertexShader   : this.vertexShader,
            fragmentShader : this.fragment,
            blending       : THREE.AdditiveBlending,
            transparent    : true
        });
        
        this.glowGeometry = new THREE.SphereGeometry( radius, 16, 16 );
        this.mesh         = new THREE.Mesh( this.glowGeometry, this.glowMaterial );
        this.mesh.position.copy(position);
    }

    GlowLayer.prototype.update = function( color, amount )
    {
        this.finalAmount = amount || this.finalAmount;
        this.amount = window.installationMode ? 0 : (amount || this.amount);
        this.color = color || this.color;

        this.mesh.material.uniforms.glowColor.value = new THREE.Color( this.color );
        this.mesh.material.uniforms.amount.value = this.amount;
    }

    GlowLayer.prototype.animate = function() {
        this.mesh.material.uniforms.amount.value = this.amount;
    };

    GlowLayer.prototype.reset = function() {
        this.amount = null;
        this.color = null;
        this.finalAmount = null;
    };

    GlowLayer.prototype.animateOut = function() {
        TweenMax.to(this, .6, {amount: 0, onUpdate: _.bind(this.animate, this)});
    };

    GlowLayer.prototype.animateIn = function() {
        if(!this.finalAmount) return;
        TweenMax.to(this, .6, {amount: this.finalAmount, onUpdate: _.bind(this.animate, this)});
    };

    return GlowLayer;

}