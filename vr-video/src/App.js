import dat from 'dat-gui'
import Stats from 'stats-js'
import THREE from 'three'

const DeviceOrientationControls = require('./utils/DeviceOrientation')(THREE);
const OrbitControls             = require('three-orbit-controls')(THREE);
const glslify                   = require('glslify');
require('./post-processing/EffectComposer')(THREE);

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
    // this.addComposer();
    this.createTexture();
    // this.startGUI();

    this.onResize();
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

    this.renderer.setClearColor( 0x000000 );
    this.renderer.setClearAlpha( 0 );
    // this.renderer.setPixelRatio( window.devicePixelRatio || 1 )
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaInput = true;
    this.renderer.gammaOuput = true;
    this.renderer.autoClear = false;

    document.body.appendChild(this.renderer.domElement)
  }

  addComposer()
  {
    // this.composer = new THREE.EffectComposer(this.renderer);

    // let scenePass = new THREE.RenderPass( this.scene, this.camera, false, 0x000000, 0 );

    // this.gamma = {
    //   uniforms: {
    //     tDiffuse   : {type: "t", value: null },
    //     resolution : {type: 'v2', value: new THREE.Vector2(
    //       window.innerWidth * (window.devicePixelRatio || 1),
    //       window.innerHeight * (window.devicePixelRatio || 1)
    //       )},
    //   },
    //   vertexShader   : glslify('./post-processing/glsl/screen_vert.glsl'),
    //   fragmentShader : glslify('./post-processing/glsl/gamma.glsl'),
    // }

    // this.vrPass = {
    //   uniforms: {
    //     tDiffuse   : {type: "t", value: null },
    //     resolution : {type: 'v2', value: new THREE.Vector2(
    //         window.innerWidth * (window.devicePixelRatio || 1),
    //         window.innerHeight * (window.devicePixelRatio || 1)
    //       )}
    //     },
    //   vertexShader   : glslify('./post-processing/glsl/screen_vert.glsl'),
    //   fragmentShader : glslify('./post-processing/glsl/vr.glsl'),
    // }

    /*
    passes
    */

    // this.composer.addPass(scenePass);

    // let gamma = new THREE.ShaderPass(this.vrPass);
    // gamma.renderToScreen = true;
    // this.composer.addPass(gamma);

  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 0, 25);

    this.cameraRTT = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
    this.cameraRTT.position.z = 100;

    if(window.ontouchstart !== undefined)
    {
      this.controls = new THREE.DeviceOrientationControls(this.camera);
      this.controls.connect();

    } else {
      this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.enabled = this.DEBUG;
      this.orbitControls.maxDistance = 25;
      this.orbitControls.minDistance = 25;
    }

    this.rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { 
      minFilter: THREE.LinearFilter, 
      magFilter: THREE.LinearFilter, 
      blending: THREE.ScreenBlending,
      // blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      format: THREE.RGBAFormat 
    });

    this.rtt = this.rtTexture.clone();

    this.materialScreenQuad1 = new THREE.ShaderMaterial({
      uniforms: { 
        tDiffuse: { type: "t", value: this.rtt },
        opacity: { type: "f", value: 1 },
      },
      vertexShader: THREE.CopyShader.vertexShader,
      fragmentShader: THREE.CopyShader.fragmentShader,
      transparent: true,
      depthWrite: false,
    })

    this.plane = new THREE.PlaneBufferGeometry(window.innerWidth / 2, window.innerHeight);

    this.leftEye = new THREE.Mesh(this.plane, this.materialScreenQuad1);
    this.leftEye.position.x = -window.innerWidth / 4;

    this.rightEye = new THREE.Mesh(this.plane, this.materialScreenQuad1);
    this.rightEye.position.x = window.innerWidth / 4;

    this.scene = new THREE.Scene();
    this.sceneVR = new THREE.Scene();

    this.sceneVR.add(this.leftEye);
    this.sceneVR.add(this.rightEye);
  }

  createTexture()
  {

    this.video = document.createElement('video');
    this.video.preload = 'auto';
    this.video.width = '640';
    this.video.height = '320';
    this.video.loop = 'true'
    this.video.setAttribute('crossorigin', 'anonymous');
    this.video.src = "video/360-video-example-video-m7aerial-6694e-ea215-421af-7339d.jsv";
    this.video['data-audio'] = "video/360-video-example-video-m7aerial-6694e-ea215-421af-7339d.mp3";

    this.video.addEventListener('canplay', function()
    {
        this.jsv = document.querySelector('jsv > canvas');
        this.jsv.style.display = 'none';
        this.addObjects();
    }.bind(this));

    document.body.appendChild(this.video);

  }

  addObjects()
  {
    let gridHelper = new THREE.GridHelper( 100, 10 );
    // this.scene.add( gridHelper );

    this.texture = new THREE.Texture();
    this.texture.minFilter = THREE.LinearFilter;
		this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.flipY = false;

		// this.texture.format = THREE.RGBFormat;

    let sphere = new THREE.SphereGeometry(70, 32, 32);
    this.material = new THREE.MeshBasicMaterial({
      map : this.texture,
      side: THREE.BackSide
    })

    this.mesh = new THREE.Mesh(sphere, this.material);
    this.mesh.rotation.y = 270 * Math.PI / 180;
    this.mesh.rotation.x = 180 * Math.PI / 180;

    this.scene.add(this.mesh);

    this.update();

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

    let el = this.clock.getElapsedTime() * 0.05;
    let d = this.clock.getDelta();

    this.texture.image = this.jsv;
    this.texture.needsUpdate = true;
    this.material.needsUpdate = true;

    if(this.controls) this.controls.update();
    this.renderer.clear();

    this.renderer.render(this.scene, this.camera, this.rtt, true);
    this.renderer.render(this.sceneVR, this.cameraRTT);
    // this.composer.render(d);

    this.stats.end()
    requestAnimationFrame(this.update.bind(this));

    // this.renderer.render(this.scene, this.camera);
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

  onMouseDown(e)
  {
    this.video.play();
    document.querySelector('.start').style.display = 'none';
    window.onmousedown = null;
    window.ontouchend = null;
  }

  onResize()
  {
    this.SIZE = {
      w  : window.innerWidth ,
      w2 : window.innerWidth / 2,
      h  : window.innerHeight,
      h2 : window.innerHeight / 2
    };

    this.renderer.setSize(this.SIZE.w, this.SIZE.h);
    this.camera.aspect = this.SIZE.w / this.SIZE.h;
    this.camera.updateProjectionMatrix();
  }
}

export default App;
