import dat  from 'dat-gui'
import Stats  from 'stats-js'
import THREE  from 'three.js'
import Utils  from 'utils-perf'

const OrbitControls = require('three-orbit-controls')(THREE);
const glslify       = require('glslify');

require('./EffectComposer')(THREE);

class App {
  constructor(args)
  {
    this.renderer = null;
    this.camera   = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;
    this.clock    = new THREE.Clock();
    this.DEBUG    = false;
    this.SIZE     = {
      w  : window.innerWidth ,
      w2 : window.innerWidth / 2,
      h  : window.innerHeight,
      h2 : window.innerHeight / 2
    };

    this.startStats();
    this.createRender();
    this.createScene();
    this.addObjects();
    this.addComposer();
    this.startGUI();

    this.onResize();
    this.update();
  }

  startStats()
  {
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = 0;
    this.stats.domElement.style.display = this.DEBUG ? 'block' : 'none';
    this.stats.domElement.style.left = 0;
    this.stats.domElement.style.zIndex = 50;
    document.body.appendChild(this.stats.domElement);
    document.querySelector('.help').style.display = this.stats.domElement.style.display == 'block' ? "none" : "block";
  }

  addComposer()
  {
    this.composer = new THREE.EffectComposer(this.renderer);

    let scenePass = new THREE.RenderPass( this.scene, this.camera, false, 0x000000, 0 );
    let copyPass = new THREE.ShaderPass( THREE.CopyShader );

    this.gamma = {
      uniforms: {
        tDiffuse   : {type: "t", value: null },
        resolution : {type: 'v2', value: new THREE.Vector2(
          window.innerWidth * (window.devicePixelRatio || 1),
          window.innerHeight * (window.devicePixelRatio || 1)
          )},
      },
      vertexShader   : glslify('./glsl/screen_vert.glsl'),
      fragmentShader : glslify('./glsl/gamma.glsl'),
    }

    this.composer.addPass(scenePass);
    this.composer.addPass(copyPass);

    let gamma = new THREE.ShaderPass(this.gamma);
    gamma.renderToScreen = true;
    this.composer.addPass(gamma);
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        // antialias : true,
        clearColor: 0,
    } );

    this.renderer.setClearColor( 0x000000 );
    this.renderer.setClearAlpha( 0 );
    // this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement)
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    // this.camera = new THREE.OrthographicCamera( this.SIZE.w / - 2, this.SIZE.w2, this.SIZE.h2, this.SIZE.h / - 2, 1, 1000 );
    this.camera.position.set(0, 0, 240);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = this.DEBUG;
    this.controls.maxDistance = 300;
    this.controls.minDistance = 100;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {
    let gridHelper = new THREE.GridHelper( 100, 10 );
    // this.scene.add( gridHelper );

    let light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.z = 1;
    this.scene.add(light);

    this.group = new THREE.Object3D();
    this.scene.add(this.group);

    this.shader = new THREE.ShaderMaterial({
      vertexShader : glslify('./glsl/basic_vert.glsl'),
      fragmentShader : glslify('./glsl/basic_frag.glsl'),
    });

    this.size         = 5;
    this.maxLines     = 30;
    this.prog         = 2;
    this.counter      = 0;
    this.currentBatch = 1;
    this.shapes       = [];

    this.shapeGeom    = new THREE.SphereGeometry(this.size, 16, 8);
    this.material     = new THREE.MeshPhongMaterial({
      color: 0x797979,
      specular: 0x111111,
      emissive : 0x000000,
    });

    while(this.currentBatch < this.maxLines) {
      let shape = new THREE.Mesh(this.shapeGeom, this.material);
      let angle = (this.counter * (360 / this.prog)) * Math.PI / 180;
      let spacing = this.currentBatch * this.size * 1.2;

      shape.position.x = spacing * Math.sin(angle);
      shape.position.y = spacing * Math.cos(angle);
      shape.interval = Utils.round( Utils.distance({x: shape.position.x, y: shape.position.y}, {x: 0, y: 0}) ) ;

      let scale = Utils.map(this.currentBatch, 0, this.maxLines, 1.5, 2);
      // scale = 1.8;
      shape.scale.set(scale, scale, scale);

      this.counter++;
      this.shapes.push(shape);

      if(this.counter >= this.prog)
      {
        this.currentBatch++;
        this.prog += 4;
        this.counter = 0;
      }

      this.group.add(shape);
    }

    this.group.rotation.x = -.7;
    this.group.rotation.y = .5;
  }

  startGUI()
  {
    // this.gui = new dat.GUI()
    // this.gui.domElement.style.display = this.DEBUG ? 'block' : 'none';

    // let groupPosition = this.gui.addFolder('Group');
    // groupPosition.add(this.group.rotation, 'x', -2, 2);
    // groupPosition.add(this.group.rotation, 'y', -2, 2);
    // groupPosition.add(this.group.rotation, 'z', -2, 2);

  }

  update()
  {
    this.stats.begin();

    let time = this.clock.getElapsedTime();
    let d = this.clock.getDelta();

    this.renderer.clear();

    for (var i = 0; i < this.shapes.length; i++) {
      // this.shapes[i].position.x += (this.shapes[i].position.x * .01) * Math.cos( time + this.shapes[i].interval * .1 );
      // this.shapes[i].position.y += (this.shapes[i].position.y * .01) * Math.sin( time + this.shapes[i].interval * .1 );
      this.shapes[i].position.z = 40 * Math.sin( time + this.shapes[i].interval );
    }

    // this.renderer.render(this.scene, this.camera);
    this.composer.render(d);

    this.stats.end()
    requestAnimationFrame(this.update.bind(this));
  }

  /*
  events
  */

  onKeyUp(e)
  {
    let key = e.which || e.keyCode;
    switch(key)
    {
      // leter D
      case 68:
        this.DEBUG = !this.DEBUG;
        this.stats.domElement.style.display = !this.DEBUG ? "none" : "block";
        if(this.gui) this.gui.domElement.style.display = !this.DEBUG ? "none" : "block";
        this.controls.enabled = this.DEBUG;
        document.querySelector('.help').style.display = this.DEBUG ? "none" : "block";
        break;
    }
  }

  onResize()
  {
    this.SIZE = {
      w  : window.innerWidth ,
      w2 : window.innerWidth / 2,
      h  : window.innerHeight,
      h2 : window.innerHeight / 2
    };

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default App;
