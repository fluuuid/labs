var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var MC            = require('./MC')(THREE);
var perlin        = require('perlin-noise');
var utils = require('utils-perf');

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

var resolution = 40;
var numBlobs = 8;

var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
var light = new THREE.DirectionalLight(0xFFFFFF, .5);
light.position.set(0, 1, 0);
scene.add(light);

effect = new MC( resolution, material, true, false );
effect.position.set( 0, 0, 0 );
effect.scale.set( 500, 500, 1500 );

scene.add( effect );

var noise = perlin.generatePerlinNoise(numBlobs, 1);

var distanceX = utils.random(.1, .2);
var distanceY = utils.random(.1, .2);
var distanceZ = utils.random(0, .1);

var props = [];
for (var i = 0; i < numBlobs; i++) {
    props.push( {s : utils.random(.3, .8), sub : utils.random(10, 20) } );
};

function updateCubes( object, time, numblobs ) {

    object.reset();

    // fill the field with some metaballs

    var i, ballx, bally, ballz, subtract, strength;
    
    var angle = 360 / (numblobs - 1);
    var rads = angle * Math.PI / 180;
    var sinTime = Math.sin(time);
    var cosTime = Math.cos(time);

    for ( i = 0; i < numblobs; i ++ ) {

        if(i == 0)
        {
            ballx = bally = ballz = 0.5;

            subtract = 10;
            strength = 1.2;

        } else {
            ballx = .5 + Math.cos(rads * i) * (distanceX * (sinTime * noise[i]))
            bally = .5 + Math.sin(rads * i) * (distanceY * (sinTime * noise[i + 1]))
            ballz = .5 + Math.cos(rads * i) * (distanceZ * (cosTime * noise[i + 2]))
            subtract = props[i].sub;
            strength = props[i].s;
            // strength = .8 / ( ( Math.sqrt( numblobs - 1 ) - 1 ) / 4 + 1 );
        }

        // ballx = Math.abs(Math.sin(i + .5 * time));
        // if(i == 0) console.log(ballx)
        // bally = Math.abs( Math.cos( i + 1.01 * time * Math.cos( 1.01 + 0.0024 * i ) ) ) * .87; // dip into the floor

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

    updateCubes( effect, clock.getElapsedTime(), numBlobs);

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