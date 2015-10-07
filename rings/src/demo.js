import THREE from 'three.js'; 
import dat   from 'dat-gui' ;
import Stats from 'stats-js' ;
import MathP from 'utils-perf';

const OrbitControls = require('three-orbit-controls')(THREE);

class Demo {
  constructor(args) 
  {
    this.spin = 1;
    this.numCircles = 100;
    this.circles = [];

    this.startStats();
    this.startGUI();

    this.renderer = null;
    this.camera   = null;
    this.scene    = null;
    this.counter  = 0;
    this.clock    = new THREE.Clock();


    this.createRender();
    this.createScene();
    this.addObjects();

    this.onResize();
    this.update();
  }

  startStats()
  {
    this.stats = new Stats(); 
    this.stats.domElement.style.position = 'absolute';
    document.body.appendChild(this.stats.domElement);
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : true,
        clearColor: 0, 
    } );
    this.renderer.autoClear = false;
    this.renderer.gammaInput = true;
    document.body.appendChild(this.renderer.domElement)
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 0, 200);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 500;

    this.scene = new THREE.Scene();
  }

  generateMaterial(color)
  {
    return new THREE.MeshBasicMaterial({ color : color, wireframe: false});
  }

  addObjects()
  {
    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    this.circleGeometry = new THREE.RingGeometry( 50, 50.5, 50 );
    this.materials = [];

    // let colours = [0x1ABC9C, 0x2ECC71, 0x3498DB, 0x9B59B6, 0x34495D, 0xF1C40F, 0xE47E30, 0xE74C3C, 0xBDC3C7]
    let colours = [0xD04836, 0x3C73AB, 0x39D2EC, 0xFDBE42, 0x20ADC4]
    for (var i = 0; i < colours.length; i++) {
      this.materials.push(this.generateMaterial(colours[i]));
    };

    this.createCircles();

  }

  createCircles()
  {
    let i = 0;

    for (i = 0; i < this.circles.length; i++) this.scene.remove(this.circles[i]);

    this.circles = [];

    let angle = (360 / this.numCircles) * (Math.PI / 180);

    for (i = 0; i < this.numCircles; i++) {
      var circle = new THREE.Mesh( this.circleGeometry, this.materials[i%(this.materials.length-1)] );
      this.scene.add( circle );
      circle.rotation.y = angle * i;
      this.circles.push(circle);
    };

  }

  startGUI()
  {
    var gui = new dat.GUI()
    gui.add(this, 'spin', 0, 10);
    gui.add(this, 'numCircles', 0, 300).onChange(this.createCircles.bind(this));
    gui.open();
  }

  update()
  {
    this.stats.begin();

    for (var i = 0; i < this.circles.length; i++) {
      this.circles[i].rotation.y += (this.spin / (100 * (i / 10)));
    };

    this.renderer.render(this.scene, this.camera);

    this.stats.end()
    requestAnimationFrame(this.update.bind(this));
  }

  onResize()
  {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default Demo;