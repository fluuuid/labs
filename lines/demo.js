var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');

var audio = new Audio('mp3/lwtua.mp3');
audio.addEventListener('canplaythrough', init.bind(this));

function init()
{
    audio.play()
    update();
}

var audioAnalyser = require('web-audio-analyser')(audio);
audioAnalyser.analyser.fftSize = 2048;

var Line = require('./Line')

var renderer, camera, scene;
var counter = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0
} );
document.body.appendChild(renderer.domElement)

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 240);
controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 500;

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0, 0.00255 );

var SIZE = {x: window.innerWidth / 2, y: 30}

var lines = new Array(22)
for (var i = lines.length - 1; i >= 0; i--) {
    lines[i] = new Line(-SIZE.y/2 + i, 50, i, SIZE, Math.random() * i >> 0, audioAnalyser.frequencies())
    scene.add(lines[i].mesh);
};

function update()
{
    for (var i = lines.length - 1; i >= 0; i--) {
        lines[i].update( audioAnalyser.frequencies() );
    }
    renderer.render(scene, camera);
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