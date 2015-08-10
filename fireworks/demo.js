var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var TweenMax      = require('gsap');
var Utils         = require('utils-perf');

var stats = new Stats(); stats.domElement.style.position = 'absolute';
if(window.location.href.indexOf('localhost') > -1)document.body.appendChild(stats.domElement);

var prev = new THREE.Vector3(0,0,0);
var renderer, camera, scene;
var counter = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0
} );
document.body.appendChild(renderer.domElement)

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 240);

scene = new THREE.Scene();

var raycaster = new THREE.Raycaster();

var plane = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
var mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
scene.add(mesh);

function generateLines(point)
{
    var distance = prev.distanceTo(point);
    var geo = new THREE.Geometry();

    var numLines = Utils.random(10, 200);

    var angle = 360 / numLines;
    var rad = Utils.rad(angle);

    geo.finalVertices = [];

    for (var i = 0; i < numLines; i++) {

        var x = point.x + (distance * Math.cos(rad * i));
        var y = point.y + (distance * Math.sin(rad * i));

        geo.finalVertices.push(
            new THREE.Vector3( point.x, point.y, point.z ),
            new THREE.Vector3( x , y , 0 )
        );

        geo.vertices.push(
            new THREE.Vector3( point.x, point.y, point.z ),
            new THREE.Vector3( point.x, point.y, point.z )
        );
    };

    var line = new THREE.Line(geo, 
        new THREE.LineBasicMaterial({color: 0xFFFFFF, transparent: true})
    )
    line.numLines = numLines;

    // console.log(line.geometry)

    prev = point.clone();

    scene.add( line );
    animateLine(line);
}

function animateLine(line)
{
    // console.log(line.vertice)

    for (var i = 1; i < line.numLines * 2; i+=2) 
    {
        TweenMax.to(line.geometry.vertices[i], Math.random(), {
            x: line.geometry.finalVertices[i].x,
            y: line.geometry.finalVertices[i].y,
            ease: Power4.easeOut
        ,onUpdate: function(line){
            line.geometry.verticesNeedUpdate = true;
        }, onUpdateParams: [line], onComplete: removeLines, onCompleteParams: [line]});
    };

    // TweenMax.to(line, Math.random(), {propToAnimate: 1, onComplete: function(line){
    //     scene.remove(line);
    // }, onCompleteParams: [line], onUpdate: function(line){

    //     for (var i = 1; i < 100; i+2) {
    //         line.geometry[i] = 
    //     };

    //     line.material.needsUpdate = true;

    // }, onUpdateParams: [line]});
}

function removeLines(line)
{
    TweenMax.to(line.material, .3 + Math.random(), {opacity: 0, onUpdate: function(line){
        line.material.needsUpdate = true;
    }, onUpdateParams: [line], onComplete: function(line){
        scene.remove(line);
    }, onCompleteParams: [line]});
}

function update()
{
    stats.begin();

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
window.onmousemove = onMouseMove;
function onMouseMove(event)
{
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera )

    var intersects = raycaster.intersectObjects( [mesh] );
    
    for (var i = 0; i < intersects.length; i++) {
        generateLines(intersects[i].point)
    };
}
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}