var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var MC = require('./MC')(THREE);

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

var renderer, camera, scene, clock = new THREE.Clock();
var counter = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0
} );
document.body.appendChild(renderer.domElement)

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 1540);
controls = new OrbitControls(camera, renderer.domElement);
// controls.maxDistance = 500;

scene = new THREE.Scene();

resolution = 50;
numBlobs = 20;

var material = new THREE.MeshNormalMaterial();

effect = new MC( resolution, material, true, false );
effect.position.set( 0, 0, 0 );
effect.scale.set( 500, 500, 500 );

scene.add( effect );

function updateCubes( object, time, numblobs, floor, wallx, wallz ) {

    object.reset();

    // fill the field with some metaballs

    var i, ballx, bally, ballz, subtract, strength;

    subtract = 5;
    strength = 1.2 / ( ( Math.sqrt( numblobs ) - 1 ) / 4 + 1 );

    for ( i = 0; i < numblobs; i ++ ) {

        ballx = Math.sin( i + 1.01 * time * ( 1.03 + 0.5 * Math.cos( 0.21 * i ) ) ) * 0.27 + 0.5;
        bally = Math.abs( Math.cos( i + 1.01 * time * Math.cos( 1.01 + 0.0024 * i ) ) ) * .87; // dip into the floor
        ballz = Math.cos( i + 1.01 * time * 0.1 * Math.sin( ( 0.01 + 0.53 * i ) ) ) * 0.27 + 0.5;

        object.addBall(ballx, bally, ballz, strength, subtract);

    }

    // object.addPlaneY( 2, 12 );
    // object.addPlaneZ( 2, 12 );
    // object.addPlaneX( 2, 12 );

}

function update()
{
    stats.begin();

    // if ( effectController.resolution !== resolution ) {

    //     resolution = effectController.resolution;
    //     effect.init( resolution );

    // }

    // if ( effectController.isolation !== effect.isolation ) {

    //     effect.isolation = effectController.isolation;

    // }

    updateCubes( effect, clock.getElapsedTime(), numBlobs, false, false, false );

    renderer.render(scene, camera);
    stats.end()
    
    requestAnimationFrame(update);
}

// var gui = new dat.GUI()
// gui.add(camera.position, 'x', 0, 400)
// gui.add(camera.position, 'y', 0, 400)
// gui.add(camera.position, 'z', 0, 400)

onResize();
update();
window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}