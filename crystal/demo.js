var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var noise         = require('perlin-noise');
var TweenMax      = require('gsap');

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

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

var clock = new THREE.Clock();

var nodes = 32;

scene    = new THREE.Scene();
var geo  = new THREE.PlaneGeometry(500, 500, nodes, nodes);
geo.originalVertices = geo.vertices.slice();
var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({wireframe:true}));
mesh.rotation.x = 90 * Math.PI / 180;

var perlin = noise.generatePerlinNoise(nodes + 1, nodes + 1, {
    octaveCount : 2,
    amplitude: .5,
    persistence: 1
});

scene.add(mesh);

var power = 10;

for (var i = 0; i < mesh.geometry.vertices.length; i++) {
    animateVertice(mesh.geometry.vertices[i]);
};

function animateVertice(vert)
{
    TweenMax.to(vert, 1.5 + Math.random() * 3, {
        z: perlin[i] * -(Math.random() * power), 
        delay: .5 + Math.random(),
        yoyo: true,
        repeat: -1
    })
}

function update()
{
    stats.begin();

    mesh.geometry.verticesNeedUpdate = true;

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