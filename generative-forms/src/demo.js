import THREE from 'three.js'; 
import dat   from 'dat-gui' ;
import Stats from 'stats-js' ;

const OrbitControls  = require('three-orbit-controls')(THREE);
const EffectComposer = require('./postprocessing/core/EffectComposer')(THREE);
const RenderPass     = require('./postprocessing/core/RenderPass')(THREE);
const SSAOShader     = require('./postprocessing/SSAOShader')(THREE);
const AntiAliasPass  = require('./postprocessing/AntiAliasPass')(THREE);

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
    this.addPasses();

    this.restartButton = document.querySelector('.restart');
    this.restartButton.addEventListener('click', this.restart.bind(this));

    this.onResize();
    this.listen();
    this.update();
  }

  startStats()
  {
    this.stats = new Stats(); 
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.display = 'none';
    document.body.appendChild(this.stats.domElement);
  }

  createRender()
  {
    this.renderer = new THREE.WebGLRenderer( {
        antialias : false,
        clearColor: 0,
    } );

    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement)
  }

  createScene()
  {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
    this.camera.position.set(0, 0, 100);
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
      shininess: .1, 
      color: 0x5CACE2, 
      emissive: 0x5196c5,
      specular: 0x5CACE2,
      // side: THREE.DoubleSide
      // shading : THREE.FlatShading
    });

    this.light = new THREE.SpotLight(0xFFFFFF, .4);
    this.light.position.set(0, 0, 200);
    // this.light.castShadow = true;
    // this.light.shadowCameraNear  = 0.01; 
    // this.light.shadowDarkness = .5;
    // this.light.shadowCameraVisible = true;


    // this.scene.add(new THREE.HemisphereLight( 0xffffbb, 0x080820, .3 ));
    this.scene.add(this.light);

    this.box = new THREE.SphereGeometry(5, 32, 32);
    this.boxes = [];
  }

  addPasses()
  {
    var renderPass = new THREE.RenderPass( this.scene, this.camera );
    var depthShader = THREE.ShaderLib[ "depthRGBA" ];
    var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );

    this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader,
      uniforms: depthUniforms, blending: THREE.NoBlending } );

    var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    this.depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );

    // Setup SSAO pass
    this.ssaoPass = new THREE.ShaderPass( THREE.SSAOShader );
    // this.ssaoPass.renderToScreen = true;
    //this.ssaoPass.uniforms[ "tDiffuse" ].value will be set by ShaderPass
    this.ssaoPass.uniforms[ "tDepth" ].value = this.depthRenderTarget;
    this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    this.ssaoPass.uniforms[ 'cameraNear' ].value = this.camera.near;
    this.ssaoPass.uniforms[ 'cameraFar' ].value = this.camera.far;
    this.ssaoPass.uniforms[ 'onlyAO' ].value = false;
    this.ssaoPass.uniforms[ 'aoClamp' ].value = 100.5;
    this.ssaoPass.uniforms[ 'lumInfluence' ].value = 0.5;

    // Add pass to effect composer
    this.effectComposer = new THREE.EffectComposer( this.renderer );
    this.effectComposer.addPass( renderPass );
    this.effectComposer.addPass( this.ssaoPass );

    var antiPass = new AntiAliasPass();
    antiPass.name = 'anti-alias';
    antiPass.renderToScreen = true;
    this.effectComposer.addPass( antiPass );
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

  restart()
  {
    for (var i = 0; i < this.boxes.length; i++) {
      this.scene.remove(this.boxes[i].mesh);
    };

    this.restartButton.style.opacity = 0;

    this.boxes = [];
  }

  generateBoxes(point)
  {
    let dist = this.prev.distanceTo(point);
    if(dist < 2) return;
    if(this.boxes.length > 250) 
    {
      this.restartButton.style.opacity = 1;
      return;
    }

    // point.z = dist / 10;

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
    if(document.querySelector('.cta')) document.querySelector('.cta').classList.add('remove')
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

    this.scene.overrideMaterial = this.depthMaterial;
    this.renderer.render( this.scene, this.camera, this.depthRenderTarget, true );

    // Render renderPass and SSAO shaderPass
    this.scene.overrideMaterial = null;
    this.effectComposer.render();

    // this.renderer.render(this.scene, this.camera);

    this.stats.end()
    requestAnimationFrame(this.update.bind(this));
  }

  onResize()
  {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.ssaoPass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );

    var pixelRatio = this.renderer.getPixelRatio();
    var newWidth  = Math.floor( window.innerWidth / pixelRatio ) || 1;
    var newHeight = Math.floor( window.innerHeight / pixelRatio ) || 1;
    this.depthRenderTarget.setSize( newWidth, newHeight );
    this.effectComposer.setSize( newWidth, newHeight );
  }
}

export default Demo;