var THREE    = require('three');
var TweenMax = require('gsap');
var perlin   = require('perlin-noise');

var Line = function(y, amp, index, size, startCounter, fftData)
{
    this.size              = size;
    this.amp               = amp;
    this.index             = index;
    this.points            = this.generatedPoints(fftData);
    
    this.geometry          = new THREE.Geometry();
    this.geometry.vertices = this.points;
    
    this.material          = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: 3});
    
    this.mesh              = new THREE.Line(this.geometry, this.material);
    this.mesh.position.y   = -20 + (y || 0);
    this.mesh.position.z   = (16 - index) * -20 || 0;
    
    this.counter           = 0;
}

Line.prototype.update = function( fftData ) 
{
    // return
    if(!this.geometry.vertices) return;

    this.points = this.generatedPoints( fftData )

    for (var i = this.geometry.vertices.length - 1; i >= 0; i--) {
        this.geometry.vertices[i].y += (this.points[i].y - this.geometry.vertices[i].y) * 0.04
    };

    this.mesh.geometry.verticesNeedUpdate = true
};

Line.prototype.generatedPoints = function(array) {

    if(!array) return;

    var i;

    var straightLines = perlin.generatePerlinNoise(1, 128);
    for (i = straightLines.length - 1; i >= 0; i--) {
        straightLines[i] *= 10;
    };

    // console.log(array)

    // var noise = perlin.generatePerlinNoise(1, 128);
    var noise = [];
    var order = this.index < 11 ? 10 - this.index : this.index

    var range = 512 / 8
    var start = range * (order % 11)

    for (i = range + start; i >= start; i--) {
        var a = array[i] / 5;
        a = a > 20 ? a * 1.5 : a / 50;
        a = Math.max(5, a);
        noise.push(a);
    };

    noise = straightLines.concat(noise);
    var invertedPerlin = noise.slice(0);
    invertedPerlin = invertedPerlin.reverse()
    noise = noise.concat(invertedPerlin);

    var spline = []
    i = 0;

    var ratio = this.size.x / noise.length

    while(i<noise.length){
        spline.push(new THREE.Vector3( -this.size.x/2 + (ratio * i), noise[i], 0 ) )
        i++;
    };

    var curve = new THREE.SplineCurve3(spline);
    return curve.getPoints(511);

    return spline
};


module.exports = Line;