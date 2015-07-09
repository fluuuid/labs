var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');

var Globe = require('./Globe');

var stats = new Stats(); stats.domElement.style.position = 'absolute';
// document.body.appendChild(stats.domElement);

var renderer, camera, scene;
var counter = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    alpha: true,
} );
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement)

var distance = 100000, distanceTarget = 100000;

camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set(0, 0, 1000);
controls = new OrbitControls(camera, renderer.domElement);
controls

scene = new THREE.Scene();

var data = [
    [
      "offices",
      [
        51.5,
        0.12,
        0.21
      ]
    ]
]

var globe = new Globe(scene);

for (i=0;i<data.length;i++) {
    globe.addData(data[i][1], {format: 'magnitude', name: data[i][0], animated: false});
}

globe.createPoints();

function update()
{
    stats.begin();

    camera.lookAt(globe.mesh.position);

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