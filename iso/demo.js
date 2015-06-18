var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var TweenMax      = require('gsap');
var GoF           = require('gof-array');

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
// camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 1000 );
camera.position.set(0, 0, 1000);
controls = new OrbitControls(camera, renderer.domElement);

onResize();

scene = new THREE.Scene();
var light = new THREE.DirectionalLight(0x303030);
light.position.set(0, 1, 10);
light.lookAt(scene.position);
scene.add(light);

var sizeBox = 50;

var resX = ~~(renderer.domElement.width / sizeBox + .5) - 1
var resY = ~~(renderer.domElement.height / sizeBox + .5)

var world = new GoF(resX, 10);
world.restart();

var box = new THREE.BoxGeometry(sizeBox, sizeBox, sizeBox);
var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, side: THREE.DoubleSide});
var boxes = [];

for (var x = 0; x < resX; x++) {

    var line = []

    for (var y = 0; y < resY; y++) {
        var b = new THREE.Mesh(box, material);
        b.position.x = (-renderer.domElement.width / 2) + (x * (sizeBox + 2));
        b.position.y = (-renderer.domElement.height / 2) + (y * (sizeBox + 2));
        scene.add(b)
        line.push(b);
    }

    boxes.push(line);
};

function update()
{
    stats.begin();

    world.update();

    for (var i = 0; i < world.grid.length; i++) {

        var line = world.grid[i];
        var lineBoxes = boxes[i];

        for (var a = 0; a < line.length; a++) {
            if(lineBoxes[a]) 
            {
                TweenMax.to(lineBoxes[a].rotation, .2, {y: line[a] ? 45 * Math.PI / 180 : 0});
                // lineBoxes[a].rotation.y = line[a] ? .5 : 0;
            }
        };

    };

    renderer.render(scene, camera);
    stats.end()
    
    requestAnimationFrame(update);
}

// var gui = new dat.GUI()
// gui.add(camera.position, 'x', 0, 400)
// gui.add(camera.position, 'y', 0, 400)
// gui.add(camera.position, 'z', 0, 400)

update();
window.onresize = onResize;
function onResize(){

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    
}