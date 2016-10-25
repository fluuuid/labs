"use strict";

import dat     from 'dat-gui'
import Stats   from 'stats-js'

import OBJLoader from 'three/loaders/OBJLoader';

import OC from 'three-orbit-controls';
const OrbitControls = OC(THREE);

// import OL from ;
// console.log(OL);

import RenderPass from './post-processing/RenderPass';
import ShaderPass from './post-processing/ShaderPass';
import EffectComposer from './post-processing/EffectComposer';

import ScreenVertShader from './post-processing/glsl/screen_vert.glsl!text'
import ScreenFragShader from './post-processing/glsl/screen_frag.glsl!text'

class App {

  constructor()
  {
    this.renderer = null;
    this.camera   = null;
    this.scene    = null;
    this.counter  = 0;
    this.gui      = null;
    this.clock    = new THREE.Clock();
    this.DEBUG    = true;
    this.SIZE     = {
      w  : window.innerWidth ,
      w2 : window.innerWidth / 2,
      h  : window.innerHeight,
      h2 : window.innerHeight / 2
    };

    this.startStats();
    this.createRender();
    this.createScene();
    this.addComposer();
    this.addObjects();
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

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : false,
        depth     : true,
    } );

    this.renderer.setClearColor( 0xFFFFFF );
    // this.renderer.setClearAlpha( 0 );
    // this.renderer.setPixelRatio( window.devicePixelRatio || 1 )
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaInput = true;
    this.renderer.gammaOuput = true;
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement)
  }

  loadMesh()
  {
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (item, loaded, total) => {
      console.log(item, loaded, total);
    }

    this.loader = new THREE.OBJLoader( this.manager );
    this.loader.load('app/model/nefertiti.obj', (object) => {

      this.mesh = object.children[0];
      this.mesh.rotation.x = -90 * Math.PI / 180;
      this.mesh.scale.set(.3, .3, .3);
      this.mesh.material.wireframe = true;
      this.mesh.material.needsUpdate = true;
      this.scene.add(this.mesh)
    })
  }

  addComposer()
  {
    this.composer = new EffectComposer(this.renderer);

    let scenePass = new RenderPass( this.scene, this.camera, false, 0x000000, 0 );

    this.gamma = {
      uniforms: {
        tDiffuse   : {type: "t", value: null },
        resolution : {type: 'v2', value: new THREE.Vector2(
          window.innerWidth * (window.devicePixelRatio || 1),
          window.innerHeight * (window.devicePixelRatio || 1)
          )},
      },
      vertexShader   : ScreenVertShader,
      fragmentShader : ScreenFragShader,
    }

    /*
    passes
    */

    this.composer.addPass(scenePass);

    let gamma = new ShaderPass(this.gamma);
    gamma.renderToScreen = true;
    this.composer.addPass(gamma);

  }

  createScene()
  {
    // OrthographicCamera
    // this.camera = new THREE.OrthographicCamera( this.SIZE.w / - 2, this.SIZE.w / 2, this.SIZE.h / 2, this.SIZE.h / - 2, 1, 1000 );

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 40, 200);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = this.DEBUG;
    this.controls.maxDistance = 500;
    this.controls.minDistance = 50;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {
    // let gridHelper = new THREE.GridHelper( 100, 10 );
    // this.scene.add( gridHelper );

    this.scene.add(new THREE.AmbientLight(0xFFFFFF, .1));

    this.light = new THREE.DirectionalLight(0xFFFFFF, .4);
    this.light.position.set(0, 0, 100);

    this.scene.add(this.light);

    this.loadMesh();

    /*
    example of shader material using glslify

    this.shader = new THREE.ShaderMaterial({
      vertexShader : glslify('./glsl/basic_vert.glsl'),
      fragmentShader : glslify('./glsl/basic_frag.glsl'),
    })

    */
  }

  startGUI()
  {
    this.gui = new dat.GUI()
    this.gui.domElement.style.display = this.DEBUG ? 'block' : 'none';

    let cameraFolder = this.gui.addFolder('Camera');
    cameraFolder.add(this.camera.position, 'x', -400, 400);
    cameraFolder.add(this.camera.position, 'y', -400, 400);
    cameraFolder.add(this.camera.position, 'z', -400, 400);

  }

  update()
  {
    this.stats.begin();

    let el = this.clock.getElapsedTime() * .05;
    let d = this.clock.getDelta();

    this.renderer.clear();

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
        if(this.stats)    this.stats.domElement.style.display = !this.DEBUG ? "none" : "block";
        if(this.gui)      this.gui.domElement.style.display = !this.DEBUG ? "none" : "block";
        if(this.controls) this.controls.enabled = this.DEBUG;
        if(document.querySelector('.help')) document.querySelector('.help').style.display = this.DEBUG ? "none" : "block";
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

    // OrthographicCamera
    // this.camera.left = this.SIZE.w / - 2;
		// this.camera.right = this.SIZE.w / 2;
		// this.camera.top = this.SIZE.h / 2;
		// this.camera.bottom = this.SIZE.h / - 2;

    this.renderer.setSize(this.SIZE.w, this.SIZE.h);
    this.camera.aspect = this.SIZE.w / this.SIZE.h;
    this.camera.updateProjectionMatrix();
  }
}

export default App;
