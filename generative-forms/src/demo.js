import THREE from 'three.js'; 
import dat   from 'dat-gui' ;
import Stats from 'stats-js' ;

const OrbitControls = require('three-orbit-controls')(THREE);

import Box from './Box';

class Demo {
  constructor(args) 
  {
    this.startStats();
    this.startGUI();

    this.renderer = null;
    this.camera   = null;
    this.scene    = null;
    this.counter  = 0;
    this.clock    = new THREE.Clock();

    this.prev = new THREE.Vector3(0,0,0);

    this.createRender();
    this.createScene();
    this.addObjects();

    this.onResize();
    this.listen();
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
        clearColor: 0
    } );

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement)
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 0, 240);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 500;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {
    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    this.raycaster = new THREE.Raycaster();

    this.plane = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight);
    this.hitPlane = new THREE.Mesh(this.plane, new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
    this.scene.add(this.hitPlane);

    this.material = new THREE.MeshPhongMaterial({
      shininess: 5, 
      color: 0xFBA026, 
      emissive: 0xFBA026,
      shading : THREE.FlatShading
    });

    this.light = new THREE.DirectionalLight(0xFFFFFF, 1);
    this.light.position.set(0, 0, 200);
    // this.light.castShadow = true;
    // this.light.shadowCameraNear  = 0.01; 
    // this.light.shadowDarkness = .5;
    // this.light.shadowCameraVisible = true;


    // this.scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 ));
    this.scene.add(this.light);

    this.box = new THREE.SphereGeometry(10, 32, 32);
    this.boxes = [];
  }

  startGUI()
  {
    // var gui = new dat.GUI()
    // gui.add(camera.position, 'x', 0, 400)
    // gui.add(camera.position, 'y', 0, 400)
    // gui.add(camera.position, 'z', 0, 400)
  }

  listen()
  {
    window.onmousemove = this.onMouseMove.bind(this);
  }

  generateBoxes(point)
  {
    let dist = this.prev.distanceTo(point);
    if(dist < 2) return;
    if(this.boxes.length > 500) return;

    point.z = dist / 10;

    let index = this.boxes.length / 2;

    let boxMesh = new Box(this.box, this.material, index);
    boxMesh.mesh.position.copy(point);
    this.scene.add(boxMesh.mesh);
    this.boxes.push(boxMesh);

    let boxMirror = new Box(this.box, this.material, index);
    boxMirror.mesh.position.copy(point);
    boxMirror.mesh.position.x *= -1;
    this.scene.add(boxMirror.mesh);

    this.boxes.push(boxMirror);

    this.prev = point.clone();
  }

  onMouseMove(e)
  {
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    this.raycaster.setFromCamera( mouse, this.camera )

    var intersects = this.raycaster.intersectObjects( [this.hitPlane] );
    
    for (var i = 0; i < intersects.length; i++) {
        this.generateBoxes(intersects[i].point)
    };
  }

  update()
  {
    this.stats.begin();

    let time = this.clock.getElapsedTime();

    for (var i = 0; i < this.boxes.length; i++) {
      this.boxes[i].update(time);
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