var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');

/*
*/

var Particle = require('./view/Particle');

var renderer, camera, scene;
var counter = 0, stats, dt;
var clock = new THREE.Clock();
var particles = new Array(200);
var PARAMS = window.PARAMS = {
    speed : .2,
    randomY : false
}

function init()
{
    stats = new Stats(); stats.domElement.style.position = 'absolute';
    document.body.appendChild(stats.domElement);

    renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0
    } );
    document.body.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 4000 );
    camera.position.set(0, 0, 70);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 5000;
    // controls.minDistance = 50;
    window.c = controls;

    scene = new THREE.Scene();

    draw();
}

function draw()
{
    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i] = new Particle();
        scene.add(particles[i].mesh);

        setTimeout(function(p){
            p.init();
        }, 25 * i, particles[i]);
    };
}

function update()
{
    stats.begin();
    dt = clock.getDelta();

    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].update(dt);
    };

    renderer.render(scene, camera);
    stats.end()
    requestAnimationFrame(update);
}

init();

var gui = new dat.GUI()
gui.add(window.PARAMS, 'speed', .1, .5);
gui.add(window.PARAMS, 'randomY').name('random Y start')

onResize();
update();
window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}