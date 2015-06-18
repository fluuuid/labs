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

function init()
{
    stats = new Stats(); stats.domElement.style.position = 'absolute';
    document.body.appendChild(stats.domElement);

    renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0
    } );
    document.body.appendChild(renderer.domElement)

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 4000 );
    camera.position.set(0, 0, 70);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 500;

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
        }, 50 * i, particles[i]);
    };

    // box = new THREE.Mesh(new THREE.BoxGeometry(100 ,100, 100), new THREE.MeshBasicMaterial({wireframe: true}))
    // scene.add(box);
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

onResize();
update();
window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}