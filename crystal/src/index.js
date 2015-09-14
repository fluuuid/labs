var THREE          = require('three');
// var OrbitControls  = require('three-orbit-controls')(THREE);
var dat            = require('dat-gui');
var Stats          = require('stats-js');
var noise          = require('perlin-noise');
var TweenMax       = require('gsap');
var EffectComposer = require('./postprocessing/core/EffectComposer')(THREE);
var NoiseShader    = require('./postprocessing/Noise')(THREE);
var RenderPass     = require('./postprocessing/core/RenderPass')(THREE);

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

var Params = function(){
    this.nodes = 150;
    this.power = 100;
    this.lightColor = '#d7e3ff';
    this.meshColor = '#ebf1ff';
    this.meshSpecular = '#fff3d7';
    this.meshEmissive = '#2d2b26';
    this.shininess = 5;
    this.noiseAmount = .05;
    this.noiseSpeed = 1;
}

var p = new Params();
var gui = new dat.GUI()

gui.add(p, 'nodes', 100, 200).onChange(generatePlane.bind(this));
gui.add(p, 'power', 0, 200).onChange(generatePlane.bind(this));

var folderColors = gui.addFolder('Colours');
folderColors.addColor(p, 'lightColor').onChange(updateColours.bind(this));
folderColors.addColor(p, 'meshColor').onChange(updateColours.bind(this));
folderColors.addColor(p, 'meshSpecular').onChange(updateColours.bind(this));
folderColors.addColor(p, 'meshEmissive').onChange(updateColours.bind(this));
folderColors.add(p, 'shininess', 0, 50).step(1).onChange(updateColours.bind(this));
folderColors.open();

var folderNoise = gui.addFolder('Postprocessing Noise');
folderNoise.add(p, 'noiseAmount', 0, .2);
folderNoise.add(p, 'noiseSpeed', 0, 10);
folderNoise.open();

var renderer, camera, scene;
var counter = 0;
var perlin, nodes, mesh, light, geo;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    gammaInput : true,
    gammeOutput : true
} );

renderer.setClearColor(0xFFFFFF, 1);
document.body.appendChild(renderer.domElement)

composer = new EffectComposer(renderer);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 240);
// controls = new OrbitControls(camera, renderer.domElement);
// controls.maxDistance = 500;

var clock = new THREE.Clock();
scene     = new THREE.Scene();

composer.addPass( new THREE.RenderPass( scene, camera ) );

var noisePass = new THREE.ShaderPass( NoiseShader );
noisePass.uniforms['amount'].value = .08;
noisePass.uniforms['speed'].value = 1;
noisePass.renderToScreen = true;
composer.addPass( noisePass );

function generatePlane()
{
    if(mesh) scene.remove(mesh);
    if(light) scene.remove(light);

    light = new THREE.DirectionalLight(p.lightColor, 1);
    light.position.set( 0, 0, 100 );
    scene.add(light);

    nodes = window.innerWidth / p.nodes >> 0;
    geo  = new THREE.PlaneGeometry(500, 500, nodes, nodes);
    geo.originalVertices = geo.vertices.slice();
    mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
        color: new THREE.Color(p.meshColor),
        specular: new THREE.Color(p.meshSpecular),
        emissive: new THREE.Color(p.meshEmissive),
        shininess: new THREE.Color(p.shininess),
        shading: THREE.FlatShading,
        side: THREE.DoubleSide
    }));

    mesh.rotation.x = -20 * Math.PI / 180;
    generatePerlin();
    scene.add(mesh);

    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        mesh.geometry.vertices[i].z = perlin[i] * -(Math.random() * p.power);
        animateVertice(mesh.geometry.vertices[i], i);
    };

}

function generatePerlin()
{
    perlin = noise.generatePerlinNoise(nodes + 1, nodes + 1, {
        octaveCount : 2,
        amplitude: .5,
        persistence: 1
    });

}

function animateVertice(vert, i)
{
    TweenMax.to(vert, 1.5 + Math.random() * 3, {
        z: perlin[i] * -(Math.random() * p.power), 
        delay: .5 + Math.random(),
        yoyo: true,
        ease: Linear.easeNone,
        onRepeat: generatePerlin.bind(this),
        repeat: -1
    })
}

generatePlane();

function updateColours()
{
    console.log(mesh, p)
    mesh.material.color = new THREE.Color(p.meshColor);
    mesh.material.specular = new THREE.Color(p.meshSpecular);
    mesh.material.emissive = new THREE.Color(p.meshEmissive);
    mesh.material.shininess = p.shininess;
    mesh.material.needsUpdate = true;
}

function update()
{
    stats.begin();

    noisePass.uniforms['amount'].value = p.noiseAmount;
    noisePass.uniforms['speed'].value = p.noiseSpeed;
    noisePass.uniforms['time'].value = clock.getElapsedTime();

    mesh.geometry.verticesNeedUpdate = true;

    // renderer.render(scene, camera);
    composer.render();
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
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}