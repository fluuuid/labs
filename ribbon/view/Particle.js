var THREE = require('three');
var Utils = require('../utils/Utils')

var Particle = function()
{
    this.depth   = 20
    
    this.endPosX = Utils.random(-80, 50);
    this.endPosY = 20;
    this.endPosZ = -80;
    
    this.startX  = 26;
    this.startY  = window.PARAMS.randomY ? Utils.random(-10, 10) : 0

    this.imgPos       = new THREE.Vector3(this.endPosX,this.endPosY,this.endPosZ);
    this.maxThickness = Utils.random(.1, .3);
    this.trailPoints  = Utils.random(2, 4) >> 0;

    this.FW           = new THREE.Vector3(0,0,-1);
    this.position     = new THREE.Vector3(this.startX, this.startY, this.depth );
    this.skeleton     = [];
    this.alive        = false;

    for( var i=1; i<=this.trailPoints; i++ ){
        this.skeleton.push(new THREE.Vector3( 0, 0, 0 ).add(this.position));
    }

    this.material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide, 
        color: 0x89CFF0
    });

    this.geometry     = new THREE.Geometry();
    this.mesh         = new THREE.Mesh(this.geometry, this.material);
    this.mesh.overdraw = true;
    
    this.drawRibbon();
}

Particle.prototype.init = function() 
{
    this.startY   = window.PARAMS.randomY ? Utils.random(-10, 10) : 0
    this.position = new THREE.Vector3(this.startX, this.startY, this.depth );
    this.vel      = new THREE.Vector3(Utils.random(-2, 2),Utils.random(-2, 2),Utils.random(-2, 2));

    for( var i=0; i<this.skeleton.length; i++ ){
        this.skeleton[i]=(new THREE.Vector3( 0,  0, 0 ).add(this.position));
    }

    this.alive = true;
};

Particle.prototype.drawRibbon = function() 
{
    this.geometry.vertices.push(this.position.clone());
    this.skeleton.push(this.position.clone());

    // num vertices
    var nVertices = 0;

    // body vertices
    for( var i=1; i<=this.trailPoints; i++ ) {
        var progress = (i-1)/(this.trailPoints-1);
        var height = Math.sin(progress*Math.PI)*this.maxThickness;
        this.geometry.vertices.push( new THREE.Vector3( (i-1)*2, -height, 0 ).add(this.position) ); // 1
        this.geometry.vertices.push( new THREE.Vector3( (i-1)*2,  height, 0 ).add(this.position) ); // 2
        nVertices += 2;
    }

    // tail vertice
    this.geometry.vertices.push(new THREE.Vector3( (this.trailPoints+1)*2,  0, 0 ).add(this.position));
    this.skeleton.push(new THREE.Vector3( (this.trailPoints+1)*2,  0, 0 ).add(this.position));

    // head vertex
    this.geometry.faces.push(new THREE.Face3( 0, 2, 1 ));

    // body vertex
    for( var j=1; j<nVertices-2; j+=2 ){
        this.geometry.faces.push( new THREE.Face3( j, j+1, j+2 ));
        this.geometry.faces.push( new THREE.Face3( j+2, j+1, j+3 ));
    }

    //tail vertex
    this.geometry.faces.push(new THREE.Face3( this.trailPoints*2, this.trailPoints*2+1, this.trailPoints*2-1 ));
};

Particle.prototype.update = function(dt) 
{
    if(!this.alive) return;

    var str = new THREE.Vector3(window.PARAMS.speed, window.PARAMS.speed, window.PARAMS.speed);

    var diff = this.imgPos.clone().sub(this.position);
    var d   = diff.clone();
    var di  = d.normalize().length();
    
    var dimX = dimY = dimZ = di*500.0; //busy mode

    diff.add(new THREE.Vector3( Utils.random(-.2, .2) * dimX,Utils.random(-.2, .2)*dimY,Utils.random(-.2, .2)*dimZ));

    // this.maxThickness = di/10.0;
    this.position.add( diff.multiplyScalar( dt ) );

    this.position.add( this.vel.multiplyScalar(dt) );

    var lengthMax = 2.0;
    var n_vert = this.skeleton.length;
    this.skeleton[0] = this.position;
    this.geometry.vertices[0] = this.position;

    for( var i=1; i<n_vert; i++ ) {

        var pv  = this.skeleton[i-1];
        var v   = this.skeleton[i];
        var diff= pv.clone().sub(v);

        // limit to lengthMax
        if( diff.length() > lengthMax ){
            diff.setLength(lengthMax);
        }

        var th   = Math.sin(( (i-1)/(n_vert-2))*Math.PI )*this.maxThickness;
        var next = diff.clone().multiply(str);
        var norm = diff.clone().cross(this.FW).setLength(th);
        v.add(next);

        var id = (i-1)*2;
        this.geometry.vertices[id]   = v.clone().add( norm );
        this.geometry.vertices[id+1] = v.clone().add( norm.negate() );

    }

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.verticesNeedUpdate = true;
    this.geometry.normalsNeedUpdate = true;

    if(this.geometry.vertices[0].z <= this.endPosZ + 20)
    {
        this.alive = false;
        this.init();
    }

};

module.exports = Particle;