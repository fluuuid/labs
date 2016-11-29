import ControlKit from 'controlkit'
import Stats from 'stats-js'
import * as THREE from 'three'

const OrbitControls  = require('three-orbit-controls')(THREE);
const glslify        = require('glslify');
require('./post-processing/EffectComposer')(THREE);

const controller = {
  timeMod: { value: 0.28, range: [0,5], step: 0.0001, label: 'time scale' },
  mod1x : { value: 4, range: [0,100], step: 0.0001, label: 'mod1-x' },
  mod2x : { value: 8, range: [0,100], step: 0.001, label: 'mod2-x' },
  mod3x : { value: 40, range: [0,100], step: 0.001, label: 'mod3-x' },
  
  mod1y : { value: 5, range: [0,100], step: 0.0001, label: 'mod1-y' },
  mod2y : { value: 10, range: [0,100], step: 0.001, label: 'mod2-y' },
  mod3y : { value: 30, range: [0,100], step: 0.001, label: 'mod3-y' },
  
  mod4 : { value: 0.78, range: [-1,1], step: 0.001, label: 'mod4' },
}

class App {

  constructor()
  {
    this.renderer = null;
    this.camera   = null;
    this.scene    = null;
    this.counter  = 0;
    this.controlKit = null;
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
        depth     : false,
    } );

    this.renderer.setClearColor( 0x000000 );
    this.renderer.setClearAlpha( 0 );
    // this.renderer.setPixelRatio( window.devicePixelRatio || 1 )
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(this.renderer);
    this.renderer.gammaInput = true;
    this.renderer.gammaOuput = true;
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement)
  }

  addComposer()
  {
    this.composer = new THREE.EffectComposer(this.renderer);

    let scenePass = new THREE.RenderPass( this.scene, this.camera, false, 0x000000, 0 );

    this.gamma = {
      uniforms: {
        tDiffuse   : {type: "t", value: null },
        resolution : {type: 'v2', value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
          )},
      },
      vertexShader   : glslify('./post-processing/glsl/screen_vert.glsl'),
      fragmentShader : glslify('./post-processing/glsl/gamma.glsl'),
    }

    /*
    passes
    */

    this.composer.addPass(scenePass);

    let gamma = new THREE.ShaderPass(this.gamma);
    gamma.renderToScreen = true;
    this.composer.addPass(gamma);

  }

  createScene()
  {
    const left = window.innerWidth / -2;
		const right = window.innerWidth / 2;
		const top = window.innerHeight / 2;
		const bottom = window.innerHeight / -2;

    // OrthographicCamera
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, -10, 10);
    // this.camera = new THREE.Camera();

    // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    // this.camera.position.set(0, 0, 1);

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;
    // this.controls.maxDistance = 1000;
    // this.controls.minDistance = 0;

    this.scene = new THREE.Scene();
  }

  addObjects()
  {

    this.video = document.createElement('video');
    this.video.src = 'static/videos/clip.mp4';
    this.video.load();
    this.video.loop = true;
    this.video.play();

    this.videoCanvas = document.createElement('canvas');
    this.videoCanvas.width = 1920;
    this.videoCanvas.height = 1080;
    this.ctxVideo = this.videoCanvas.getContext('2d');
    this.ctxVideo.fillRect(0, 0, this.videoCanvas.width, this.videoCanvas.height)

    this.videoTexture = new THREE.Texture( this.videoCanvas );
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    
    const uniforms = {
      delta: {
        type: 'f',
        value: 0,
      },
      color: {
        type: 'c',
        value: new THREE.Color(0xFFFFFF)
      },
      uTime: {
        type: 'f',
        value: 0,
      },
      uResolution: {
        type: 'v2',
        value: new THREE.Vector2( 1, this.SIZE.h / this.SIZE.w),
      },
      map : {
        type: 't',
        value: this.videoTexture
      },
    }
    
    for (const mod in controller) {
      if (controller.hasOwnProperty(mod)) {
        uniforms[mod] = {
          type: 'f',
          value: controller[mod]
        }
      }
    }

    this.shader = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader : glslify('./glsl/video_vert.glsl'),
      fragmentShader : glslify('./glsl/video_frag.glsl'),
      wireframe: false,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
    })

    this.shader.needsUpdate = true;

    const planeGeo = new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight, 1);
    const mesh = new THREE.Mesh(planeGeo, this.shader);
    mesh.rotation.z = -Math.PI;

    this.scene.add(mesh);
  }

  startGUI()
  {
    this.controlKit = new ControlKit();
    const panel = this.controlKit.addPanel();
    
    for (const mod in controller) {
      if (controller.hasOwnProperty(mod)) {
        panel.addSlider(controller[mod], 'value', 'range', {label: controller[mod].label});
      }
    }

    // const range = 1;
    // let modifiers = this.controlKit.addFolder('Modifiers');
    // modifiers.add(mod1, 'value', -range, range).step(0.001);
    // modifiers.add(this.shader.uniforms.mod2, 'value', -range, range).step(0.001);
    // modifiers.add(this.shader.uniforms.mod3, 'value', -range, range).step(0.001);

  }

  update()
  {
    this.stats.begin();

    this.ctxVideo.drawImage(this.video, 0, 0);
    this.videoTexture.needsUpdate = true;

    let el = this.clock.getElapsedTime();
    let d = this.clock.getDelta();

    this.renderer.clear();
    
    for (const mod in controller) {
      if (controller.hasOwnProperty(mod)) {
        this.shader.uniforms[mod].value = controller[mod].value;
      }
    }

    this.shader.uniforms.uTime.value = el;
    this.shader.uniforms.delta.value = d;

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
        if(this.controlKit)      this.controlKit.domElement.style.display = !this.DEBUG ? "none" : "block";
        // if(this.controls) this.controls.enabled = this.DEBUG;
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
    this.camera.left = this.SIZE.w / - 2;
		this.camera.right = this.SIZE.w / 2;
		this.camera.top = this.SIZE.h / 2;
		this.camera.bottom = this.SIZE.h / - 2;

    this.shader.uniforms.uResolution.value.x = 1;
    this.shader.uniforms.uResolution.value.y = this.SIZE.h / this.SIZE.w;

    // this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.SIZE.w, this.SIZE.h);
    // this.camera.aspect = this.SIZE.w / this.SIZE.h;
  }
}

export default App;
