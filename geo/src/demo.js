import THREE from 'three'; 
import OC    from 'three-orbit-controls';
import dat   from 'dat-gui' ;
import Stats from 'stats-js' ;
import MathF from 'utils-perf';

class Demo {
  constructor(args) 
  {
    this.type         = "square";
    this.materialType = "MeshBasicMaterial";
    this.numObjects   = 7;
    this.move         = true;
    this.amount       = 150;
    this.size         = 50;
    this.speed        = .05;
    this.spacing      = 4;

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
        clearColor: 0
    } );
    document.body.appendChild(this.renderer.domElement)
  }

  createScene()
  {
    const OrbitControls = OC(THREE);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 0, 800);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxDistance = 800;

    this.scene = new THREE.Scene();
  }

  createGeometry()
  {
    this.shape = new THREE.Shape();
    // var light = new THREE.DirectionalLight(0xFFFFFF, .5);
    // light.position.set(0, 1, 0);
    // this.scene.remove(light);

    switch(this.type)
    {
      case "triangle":
        this.shape.moveTo( -this.size / 2, 0 );
        this.shape.lineTo(0, this.size / 2 * Math.PI / 2 );
        this.shape.lineTo(this.size / 2, 0);
        this.shape.lineTo(-this.size / 2, 0);
        break;

      case "inverted":
        this.shape.moveTo(0,0);
        this.shape.lineTo(-this.size / 2, this.size / 2 );
        this.shape.lineTo(this.size / 2, this.size / 2);
        this.shape.lineTo(0, 0);
        break;

      case "square":
        this.shape.moveTo(-this.size, -this.size);

        this.shape.lineTo(-this.size, this.size);
        this.shape.lineTo(this.size, this.size );
        this.shape.lineTo(this.size, -this.size );
        this.shape.lineTo(-this.size, -this.size );
        break;
    }

    this.rectGeom = new THREE.ShapeGeometry( this.shape );
  }

  addObjects()
  {
    while(this.scene.children.length > 0) this.scene.remove(this.scene.children[0]);

    this.material = new THREE[this.materialType]({
      wireframe: true
    });

    this.createGeometry();

    // var gridHelper = new THREE.GridHelper( 100, 10 );        
    // this.scene.add( gridHelper );

    this.container = new THREE.Object3D();

    this.triangles = [];

    for (var i = 0; i < this.numObjects; i++) {
      let a = this.generateObject();
      a.rotation.y = ((360 / this.numObjects) * i) * Math.PI / 180;
      this.container.add(a);
    };

    this.container.rotation.x = 90 * Math.PI / 180;
    this.scene.add(this.container);

  };

  generateObject()
  {
    let obj = new THREE.Object3D();
    
    var rad = MathF.rad(360 / this.amount);

    for (var i = 0; i < this.amount; i++) {
      var rectMesh = new THREE.Mesh( this.rectGeom, this.material ) ;
      var s = (i + 100) / this.amount;
      // rectMesh.rotation.x = rad * i;
      // rectMesh.rotation.y = rad * i;

      if(this.move)
      {
        rectMesh.position.y = -((this.size * Math.PI / 2)) / 2;
        rectMesh.position.z = i * this.spacing;
        rectMesh.scale.set(s, s, s);
      }

      rectMesh.rotation.z = rad * i;

      this.triangles.push(rectMesh);
      obj.add(rectMesh);
    }

    return obj;
  }

  startGUI()
  {
    var gui = new dat.GUI()
    gui.add(this, "type", ['triangle', 'inverted', 'square']).onChange(this.addObjects.bind(this));
    gui.add(this, "materialType", ['MeshBasicMaterial', 'MeshNormalMaterial']).onChange(this.addObjects.bind(this));
    gui.add(this, 'numObjects', 1, 10).step(1).onChange(this.addObjects.bind(this));
    gui.add(this, 'spacing', 1, 10).onChange(this.addObjects.bind(this));
    gui.add(this, 'speed', 0, .15);
    gui.add(this, 'size', 1, 100).onChange(this.addObjects.bind(this));
    gui.add(this, 'amount', 1, 700).step(1).onChange(this.addObjects.bind(this));
  }

  update()
  {
    this.stats.begin();

    for (var i = 0; i < this.triangles.length; i++) {
      // this.triangles[i].rotation.x += this.speed / ( i + 1);
      // this.triangles[i].rotation.y += this.speed ;
      this.triangles[i].rotation.z += this.speed;
      // this.triangles[i].rotation.y += this.speed / i;
      // this.triangles[i].rotation.x += this.speed / Math.cos(this.clock.getElapsedTime()) / i;
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