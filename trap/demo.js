var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var glslify       = require('glslify');

var vert          = glslify('./vertex.vert');
var frag          = glslify('./frag.frag');

var phongShader = THREE.ShaderLib.phong;
var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

var renderer, camera, scene;
var time = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0
} );
document.body.appendChild(renderer.domElement)

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 140);
controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 500;

scene = new THREE.Scene();

uniforms.time = {type: 'f', value: 0};

var plane = new THREE.PlaneBufferGeometry(100, 100, 25, 25);
plane.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

var material = new THREE.ShaderMaterial({
    vertexShader: phongShader.vertexShader,
    fragmentShader: phongShader.fragmentShader,
    wireframe: false,
    shading: THREE.FlatShading,
    side: THREE.DoubleSide,
    lights: true,
    specular: 0xFFFFFF,
    fog: false,
    uniforms: uniforms
})

var mesh = new THREE.Mesh(plane, material);
scene.add(mesh);

scene.add(new THREE.AmbientLight(0x222222))

function update()
{
    stats.begin();

    material.uniforms.time.value += .001;

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