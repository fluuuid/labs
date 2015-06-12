var THREE             = require('three');
var createOrbitViewer = require('three-orbit-viewer')(THREE);
var Physijs = require('physijs-browserify')(THREE);

Physijs.scripts.worker = 'libs/physi-worker.js';
Physijs.scripts.ammo = 'ammo.js';

var app = createOrbitViewer({
    clearColor       : 0x000000,
    clearAlpha       : 1.0,
    fov              : 65,
    near             : .01,
    far              : 1000,
    position         : new THREE.Vector3(1, 80, 80),
    target           : new THREE.Vector3(0,0,0)
})

app.renderer.shadowMapEnabled = true;
app.renderer.shadowMapSoft = true;
app.renderer.shadowMapAutoUpdate = true;
app.renderer.shadowMapType = THREE.PCFSoftShadowMap;
app.renderer.antialias = true;

app.scene = new Physijs.Scene();
app.scene.setGravity(new THREE.Vector3( 0, -50, 0 ));

var height = 4;
var width = 90;

var materialSides = Physijs.createMaterial( new THREE.MeshPhongMaterial({ color: 0x252525 }),0 ,0 );
plane = new Physijs.BoxMesh(
  new THREE.BoxGeometry(width, width, height, 10, 10),
  Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      color: 0xeeeeee
    }),
    .0, // friction
    1 // restitution
  ),
  0 // mass
);

plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;

function addSides(x, y, z, horizontal)
{

    var plane = new Physijs.BoxMesh(
      new THREE.BoxGeometry(horizontal ? width : height, horizontal ? height : width, height, 10, 10),
      materialSides,
      0 // mass
    );

    plane.position.x = x;
    plane.position.y = y;
    plane.position.z = z;
    plane.receiveShadow = true;
    return plane
}

plane.add( addSides(-(width / 2 - height / 2), 0, height) );
plane.add( addSides((width / 2 - height / 2), 0, height) );
plane.add( addSides(0, (width / 2 - height / 2), height, true) );
plane.add( addSides(0, -(width / 2 - height / 2), height, true)) ;

app.scene.add(plane);

var light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 60, 0);
// light.shadowCameraVisible = true
light.castShadow          = true
light.shadowCameraNear    = 0.001
light.shadowCameraFar     = 1500
light.shadowCameraFov     = 45
light.shadowCameraLeft    = -100
light.shadowCameraRight   =  100
light.shadowCameraTop     =  100
light.shadowCameraBottom  = -100
light.shadowBias          = 0.5
light.shadowDarkness      = 0.3
light.shadowMapWidth      = 1024
light.shadowMapHeight     = 1024

app.scene.add(light);

app.scene.add(new THREE.AmbientLight(0x222222));

material = new THREE.MeshPhongMaterial({color: 0x666666});

var geo = new THREE.SphereGeometry( .6, 16, 16);
var material = Physijs.createMaterial( material, 1, 0 );

var bodies = [];
var numBodies = 250;

function addBall()
{
    var ball = new Physijs.SphereMesh( geo, material, 10 );

    ball.position.x = -10 + Math.random() * 20;
    ball.position.y = 20 + Math.random() * 40;
    ball.position.z = -10 + Math.random() * 20;

    ball.castShadow = true;
    ball.receiveShadow = true;
    app.scene.add(ball)
}

for (var i = numBodies - 1; i >= 0; i--) {
    addBall();
};

/*
table parameters
*/
var amount = 4 * Math.PI / 180;
var stepsX = 300 ;
var stepsY = 300 ;
var currentStepX = 0;
var currentStepY = 0;
var ratioX = amount / stepsX;
var ratioY = amount / stepsY;
var directionX = 1;
var directionY = 1;
var firstX = true;
var firstY = true;

var state = 0;

app.on('tick', function(dt) {

    var i = app.scene.children.length;
    var mesh;

    switch(state)
    {
        case 0:
            plane.rotation.y += (ratioY * directionY);
            currentStepY++;
            break;
        case 1:
            plane.rotation.x += (ratioX * directionX);
            currentStepX++;
            break;
        case 2:
            plane.rotation.x += (ratioX * directionX);
            plane.rotation.y += (ratioY * directionY);

            currentStepX++;
            currentStepY++;

            break;
    }

    plane.__dirtyRotation = true;

    if(currentStepX % stepsX == 0)
    {
        directionX *= -1;
        currentStepX = 0;
        if(firstX) {
            stepsX *= 2; 
            firstX = false;
        }

        state++;
        currentStepX = 0;
    }

    if(currentStepY % stepsY == 0)
    {
        directionY *= -1;
        currentStepY = 0;
        if(firstY) {
            stepsY *= 2; 
            firstY = false;
        }
    }
    state%=3;

    app.scene.simulate();
})