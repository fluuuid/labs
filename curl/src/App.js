import dat from 'dat-gui'
import Stats from 'stats-js'
import THREE from 'three.js'
import ScenePass from './ScenePass'

const OrbitControls = require('three-orbit-controls')(THREE)
const glslify = require('glslify')
const PyramidBloomPass = require('./PyramidBloomPass')(THREE)

require('./EffectComposer')(THREE)

class App {
  constructor (args) {
    this.renderer = null
    this.camera = null
    this.scene = null
    this.counter = 0
    this.gui = null
    this.clock = new THREE.Clock()
    this.DEBUG = false
    this.SIZE = {
      w: window.innerWidth,
      w2: window.innerWidth / 2,
      h: window.innerHeight,
      h2: window.innerHeight / 2
    }

    this.startStats()
    this.createRender()
    this.createScene()
    this.startGUI()
    this.addObjects()
    this.addComposer()

    this.onResize()
    this.update()
  }

  startStats () {
    this.stats = new Stats()
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.top = 0
    this.stats.domElement.style.display = this.DEBUG ? 'block' : 'none'
    this.stats.domElement.style.left = 0
    this.stats.domElement.style.zIndex = 50
    document.body.appendChild(this.stats.domElement)
    if (document.querySelector('.help')) {
      document.querySelector('.help').style.display = this.stats.domElement.style.display == 'block' ? 'none' : 'block'
    }
  }

  createRender () {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false
    })

    this.renderer.setClearColor(0x000000)
    this.renderer.setClearAlpha(0)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.gammaInput = true
    this.renderer.gammaOuput = false
    this.renderer.autoClear = false

    document.body.appendChild(this.renderer.domElement)
  }

  createScene () {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000)
    this.camera.position.set(0, 0, 15)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.enabled = false;
    this.controls.maxDistance = 500

    this.scene = new THREE.Scene()
  }

  addObjects () {
    // let gridHelper = new THREE.GridHelper( 100, 10 );
    // this.scene.add( gridHelper );

    this.sys = this.createParticleSystem()
    this.scene.add(this.sys)
  }

  addComposer () {
    this.composer = new THREE.EffectComposer(this.renderer)

    let scenePass = new THREE.RenderPass(this.scene, this.camera, false, 0x000000, 0)
    let copyPass = new THREE.ShaderPass(THREE.CopyShader)

    this.gamma = {
      uniforms: {
        tDiffuse: {type: 't', value: null },
        resolution: {type: 'v2', value: new THREE.Vector2(
          window.innerWidth * (window.devicePixelRatio || 1),
          window.innerHeight * (window.devicePixelRatio || 1)
          )}
      },
      vertexShader: glslify('./glsl/screen_vert.glsl'),
      fragmentShader: glslify('./glsl/gamma.glsl')
    }

    /*
    passes
    */

    this.composer.addPass(scenePass)
    this.composer.addPass(copyPass)

    this.bloom = new PyramidBloomPass()
    this.composer.addPass(this.bloom)

    let gamma = new THREE.ShaderPass(this.gamma)
    gamma.renderToScreen = true
    this.composer.addPass(gamma)
  }

  createParticleSystem () {
    let shader = new THREE.ShaderMaterial({
      uniforms: {
        color: {type: 'c', value: new THREE.Color(0xFFFFFF)},
        time: {type: 'f', value: 0}
      },
      transparent: true,
      vertexShader: glslify('./glsl/particle_vert.glsl'),
      fragmentShader: glslify('./glsl/particle_frag.glsl')
    })

    let cluster = Math.pow(512, 2)

    let maxParticles = cluster
    let spread = 550

    let geometry = new THREE.BufferGeometry()

    let pPosition = new Float32Array(maxParticles * 3)
    // let _index = new Float32Array(maxParticles);

    for (let i = 0, a = 0; i < pPosition.length; i += 3, a++) {
      pPosition[i + 0] = this.SIZE.w2 / spread - (Math.random() * this.SIZE.w2 / (spread / 2))
      pPosition[i + 1] = this.SIZE.h2 / spread - (Math.random() * this.SIZE.h2 / (spread / 2))
      pPosition[i + 2] = 0

      // _index[a] = a;

      // this.index[a] = a;
    };

    geometry.addAttribute('position', new THREE.BufferAttribute(pPosition, 3))
    // geometry.addAttribute('_index', new THREE.BufferAttribute(_index, 1));

    return new THREE.Points(geometry, shader)
  }

  startGUI () {
    this.gui = new dat.GUI()
    this.gui.domElement.style.display = this.DEBUG ? 'block' : 'none'

    // let cameraFolder = this.gui.addFolder('Camera');
    // cameraFolder.add(this.camera.position, 'x', -400, 400);
    // cameraFolder.add(this.camera.position, 'y', -400, 400);
    // cameraFolder.add(this.camera.position, 'z', -400, 400);
  }

  update () {
    this.stats.begin()
    let el = this.clock.getElapsedTime() * 0.05
    let d = this.clock.getDelta()

    this.renderer.clear()

    this.sys.material.uniforms.time.value = el
    this.sys.rotation.x += 0.001

    // this.renderer.render(this.scene, this.camera);
    this.composer.render(d)

    this.stats.end()
    requestAnimationFrame(this.update.bind(this))
  }

  /*
  events
  */

  onKeyUp (e) {
    let key = e.which || e.keyCode
    switch (key) {
      // leter D
      case 68:
        this.stats.domElement.style.display = this.stats.domElement.style.display == 'block' ? 'none' : 'block'
        this.gui.domElement.style.display = this.gui.domElement.style.display == 'block' ? 'none' : 'block'
        document.querySelector('.help').style.display = this.gui.domElement.style.display == 'block' ? 'none' : 'block'
        break
    }
  }

  onResize () {
    this.SIZE = {
      w: window.innerWidth,
      w2: window.innerWidth / 2,
      h: window.innerHeight,
      h2: window.innerHeight / 2
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}

export default App
