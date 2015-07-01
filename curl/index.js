var THREE   = require('three/three.min');
var glslify = require('glslify');
var dat     = require('dat-gui');
var Stats   = require('stats-js');
var css     = require('dom-css');
var raf     = require('raf');

var copyVertex = glslify('./shaders/copyShader.vs');
var copyFrag   = glslify('./shaders/copyShader.fs');

var particleVS = glslify('./shaders/particle.vs');
var particleFS = glslify('./shaders/particle.fs');

var velocityFS = glslify('./shaders/velocity.fs');
var positionFS = glslify('./shaders/position.fs');

var stats = new Stats(); document.body.appendChild(stats.domElement);
css(stats.domElement, {top : 0, left: 0, position: 'absolute'});

var time = 0;
var parameters = {
    size : 1,
}

var clock = new THREE.Clock();

var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight)

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
camera.position.z = 500;
var scene = new THREE.Scene();

// var gui = new dat.GUI();
var TEXTURE_SIZE = 512;
var AMOUNT = TEXTURE_SIZE * TEXTURE_SIZE;

var geometry = new THREE.BufferGeometry();
geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(AMOUNT * 3), 3 ));

var fboUV = new Float32Array(AMOUNT * 2);
geometry.addAttribute( 'fboUV', new THREE.BufferAttribute( fboUV, 2 ));
for( var i = 0; i < AMOUNT; i++ ) {
    fboUV[ i * 2     ] = (i % TEXTURE_SIZE) / TEXTURE_SIZE;
    fboUV[ i * 2 + 1 ] = ~~(i / TEXTURE_SIZE) / TEXTURE_SIZE;
}

var material = new THREE.ShaderMaterial( {
    uniforms: {
        texturePosition: { type: 't', value: null },
        color1: { type: 'c', value: new THREE.Color(0xffffff) },
        color2: { type: 'c', value: new THREE.Color(Math.random() * 0xFFFFFF) },
        opacity: { type: 'f', value: 0.15 },
        sizeBase: { type: 'f', value: .1 },
        sizeExtra: { type: 'f', value: 5 },
        hardness: { type: 'f', value: .6 }
    },
    attributes: geometry.attributes,
    vertexShader: particleVS,
    fragmentShader: particleFS,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: true,
    depthTest: false
} );

particles = new THREE.PointCloud( geometry , material);

scene.add( particles );

var copyShader, positionShader, velocityShader;
var fboMesh, positionShader, positionRenderTarget, positionRenderTarget2;

initFBO();

// var meshPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(TEXTURE_SIZE, TEXTURE_SIZE));
// scene.add(meshPlane);

function initFBO()
{
    fboScene = new THREE.Scene();
    fboCamera = new THREE.Camera();
    fboCamera.position.z = 1;

    copyShader = new THREE.ShaderMaterial({
        uniforms: {
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_SIZE, TEXTURE_SIZE ) },
            texture: { type: 't', value: null }
        },
        vertexShader: copyVertex,
        fragmentShader: copyFrag
    });

    velocityShader = new THREE.ShaderMaterial({
        uniforms: {
            speed: { type: 'f', value: 1.0 },
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_SIZE, TEXTURE_SIZE ) },
            texturePosition: { type: 't', value: null }
        },
        vertexShader: copyVertex,
        fragmentShader: velocityFS
    });

    positionShader = new THREE.ShaderMaterial({
        uniforms: {
            delta: { type: 'f', value: 0.0 },
            // time: { type: 'f', value: 0.0 },
            resolution: { type: 'v2', value: new THREE.Vector2( TEXTURE_SIZE, TEXTURE_SIZE ) },
            texturePosition: { type: 't', value: null },
            textureVelocity: { type: 't', value: null }
        },
        vertexShader: copyVertex,
        fragmentShader: positionFS
    });

    fboMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), copyShader );
    fboScene.add( fboMesh );

    velocityRenderTarget = new THREE.WebGLRenderTarget(TEXTURE_SIZE, TEXTURE_SIZE, {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
        stencilBuffer: false
    });

    positionRenderTarget = velocityRenderTarget.clone();
    positionRenderTarget2 = velocityRenderTarget.clone();
    copyTexture(createVelocityTexture(), velocityRenderTarget);
    copyTexture(createPositionTexture(), positionRenderTarget);
    copyTexture(positionRenderTarget, positionRenderTarget2);

}

function copyTexture(input, output) {
    fboMesh.material = copyShader;
    copyShader.uniforms.texture.value = input;
    renderer.render( fboScene, fboCamera, output );
}

function createVelocityTexture() {
    var a = new Float32Array( AMOUNT * 3 );
    var texture = new THREE.DataTexture( a, TEXTURE_SIZE, TEXTURE_SIZE, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
}

function createPositionTexture() {
    var a = new Float32Array( AMOUNT * 3 );
    for ( var i = 0, len = a.length; i < len; i += 3 ) {
        a[ i + 0 ] = 0;
        a[ i + 1 ] = (Math.random() - 0.5) ;
        a[ i + 2 ] = (Math.random() - 0.5) ;
    }
    var texture = new THREE.DataTexture( a, TEXTURE_SIZE, TEXTURE_SIZE, THREE.RGBFormat, THREE.FloatType );
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
}
 
function updatePosition (dt){
    time += dt / 10000;
    fboMesh.material = velocityShader;
    fboMesh.material.uniforms.texturePosition.value = positionRenderTarget;
    fboMesh.material.uniforms.speed.value = 1;
    renderer.render( fboScene, fboCamera, velocityRenderTarget );

    fboMesh.material = positionShader;
    positionShader.uniforms.texturePosition.value = positionRenderTarget;
    positionShader.uniforms.textureVelocity.value = velocityRenderTarget;
    positionShader.uniforms.delta.value = dt || 0;
    renderer.render( fboScene, fboCamera, positionRenderTarget2 );

    // swap
    var tmp = positionRenderTarget;
    positionRenderTarget = positionRenderTarget2;
    positionRenderTarget2 = tmp;
}

function render(dt) {
    updatePosition(dt);

    if(time < 200){
        particles.material.uniforms.texturePosition.value = positionRenderTarget;
    }

    renderer.render( scene, camera );
}

function loop() {
    stats.begin();
    render(clock.getDelta() * 1000);
    stats.end();
    raf(loop);
}

loop();

// gui.add(parameters, "size", 1, 10);
