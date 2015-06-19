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
    speed : .4,
    randomY : true,
    particles : 200,
    interval : 25
}

function init()
{
    stats = new Stats(); 
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0';
    document.body.appendChild(stats.domElement);

    renderer = new THREE.WebGLRenderer( {
        antialias  : true,
        clearColor : 0,
        alpha      : true,
        precision  : 'highp'
    } );
    document.getElementById('container').appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4000 );
    camera.position.set(12, 17, 50);

    onResize();

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 5000;
    // controls.minDistance = 50;

    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xfcfcfc));

    reset();
    update();
}

function draw()
{
    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i] = new Particle();
        scene.add(particles[i].mesh);

        setTimeout(function(p){
            p.init();
        }, window.PARAMS.interval * i, particles[i]);
    };
}

function reset()
{
    for (var i = 0; i < particles.length; i++) {
        if(particles[i]) {
            scene.remove(particles[i].mesh);
            particles[i] = null;
        }
    };

    particles = new Array(window.PARAMS.particles >> 0);
    draw();
}

function update()
{
    stats.begin();
    dt = clock.getDelta();

    for (var i = particles.length - 1; i >= 0; i--) {
        if(particles[i]) particles[i].update(dt);
    };

    renderer.render(scene, camera);
    stats.end()
    requestAnimationFrame(update);
}


init();

var gui = new dat.GUI()
gui.add(window.PARAMS, 'speed', .2, .8);
gui.add(window.PARAMS, 'particles', 10, 600).onChange(reset.bind(this));
gui.add(window.PARAMS, 'interval', 0, 400).name('particle step').onChange(reset.bind(this));
gui.add(window.PARAMS, 'randomY').name('random Y start')

window.onresize = onResize;
function onResize(){
    videoLayer = document.getElementsByTagName('video')[0]
    renderer.setSize(videoLayer.width + 100, videoLayer.height + 100);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = renderer.domElement.width / renderer.domElement.height;
    camera.updateProjectionMatrix();
}