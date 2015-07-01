var THREE         = require('three');
var dat           = require('dat-gui');
var Stats         = require('stats-js');
var TweenMax      = require('gsap');
var GoL           = require('./GoL');
var OrbitControls = require('three-orbit-controls')(THREE);

var stats = new Stats(); stats.domElement.style.position = 'absolute';
document.body.appendChild(stats.domElement);

var renderer, camera, scene;
var counter = 0;
var sizeBox, resX, box, material, boxes = [], gol, counter;
var parameters = function()
{
    this.sizeBox = 30,
    this.reset = function(){
        for (var i = boxes.length - 1; i >= 0; i--) {
            scene.remove(boxes[i]);
        };

        createWorld();
    }
}

var P = new parameters();

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0,
    precision: 'highp'
} );
document.body.appendChild(renderer.domElement)

// camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 1, 100 );
camera.position.set(0, 0, 100);
// controls = new OrbitControls(camera, renderer.domElement);

onResize();

scene = new THREE.Scene();

var light = new THREE.DirectionalLight(0x303030);
light.position.set(0, 1, 10);
light.lookAt(scene.position);
scene.add(light);
scene.add(new THREE.AmbientLight(0xadadad));

function createWorld()
{
    sizeBox = P.sizeBox;
    resX = ~~(window.innerWidth / sizeBox + .5) - 1

    box = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(sizeBox, sizeBox, sizeBox));
    material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xFFFFFF, 
        // ambient: 0xFFFFFF,
        // specular: 0xFFFFFF,
        side: THREE.DoubleSide
    });
    boxes = [];

    var offset = (sizeBox + 4)
    var totalWidth = offset * resX / 2;

    for (var x = 0; x < resX; x++) {
        for (var y = 0; y < resX; y++) {
            var b = new THREE.Mesh(box, material);
            b.position.x = totalWidth - (x * offset);
            b.position.y = totalWidth - (y * offset);
            scene.add(b)
            boxes.push(b);
        }
    };

    gol = new GoL(resX);
    counter = 0;
}

function update()
{
    stats.begin();

    if(gol.started) 
    {
        if(counter % 10 == 0)
        {
            var grid = gol.update();

            for (var i = 0; i < grid.length; i+=4) {

                var line = grid[i];
                var lineBoxes = boxes[i/4 >> 0];

                var a = 180 * Math.PI / 180;
                var angleY = line == 255 ? a / 2 - Math.random() * a : 0
                var angleZ = line == 255 ? a / 2 - Math.random() * a : 0
                TweenMax.to(lineBoxes.rotation, .3, {y: angleY, z: angleZ});

                // TweenMax.to(lineBoxes.scale, .3, {z: 5 + Math.random() * 5});

                // lineBoxes.rotation.y = line == 255 ? 45 * Math.PI / 180 : 0;
                // lineBoxes.visible = line == 255;
            };
        }

        counter++;
    }

    renderer.render(scene, camera);
    stats.end()
    
    requestAnimationFrame(update);
}

var gui = new dat.GUI()
gui.add(P, 'sizeBox', 10, 50).onChange(P.reset);
gui.add(P, 'reset');
// gui.add(parameters, 'y', 0, 400)
// gui.add(parameters, 'z', 0, 400)

P.reset();
update();
window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    // camera.aspect = window.innerWidth / window.innerHeight;

    camera.left = window.innerWidth / - 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / - 2;

    camera.updateProjectionMatrix();
}