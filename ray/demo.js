var THREE         = require('three');
var glslify       = require('glslify');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');

/*
SHADERS
*/

var defaultVertex = glslify('./shaders/default.vert');
var defaultFrag = glslify('./shaders/fragment.frag');

/**/

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

var renderer, camera, scene;
var time = 0, clock = new THREE.Clock();

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0x000000
} );

document.body.appendChild(renderer.domElement)

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 240);
controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 500;

scene = new THREE.Scene();
var shader = new THREE.ShaderMaterial({
    uniforms: {
        resolution : {type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
        color      : {type: 'c', value: new THREE.Color(0xFFFFFF) },
        time       : {type: 'f', value: 0},
        iMouse     : {type: 'v2', value: new THREE.Vector2(0,0)}
    }, 
    attributes: {},
    vertexShader : defaultVertex,
    fragmentShader: defaultFrag
});

var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), shader);
scene.add(plane);

function update()
{
    stats.begin();

    shader.uniforms.time.value += clock.getDelta();

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
window.onmousemove = function(event){
    shader.uniforms.iMouse.value = new THREE.Vector2(event.clientX, event.clientY);
}
window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}