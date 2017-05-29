var THREE         = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var soundManager  = require('soundmanager2').soundManager;
var Line = require('./Line')
var isMobile = require('ismobilejs');
var audioAnalyser, audio, lines, renderer, camera, scene;

function init() {
  document.querySelector('button').remove();
  audioAnalyser = require('web-audio-analyser')(audio._a);
  audioAnalyser.analyser.fftSize = isMobile.any ? 256 : 2048;
  createLines();
  update();
}

var counter = 0;

renderer = new THREE.WebGLRenderer( {
    antialias : true,
    clearColor: 0
} );

renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
document.body.appendChild(renderer.domElement)

var material = new THREE.LineBasicMaterial({color: 0xFFFFFF, linewidth: isMobile.any ? 1.5 : 3});

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000 );
camera.position.set(0, 45, 240);
controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 500;

scene = new THREE.Scene();
scene.fog = new THREE.FogExp2( 0, 0.00255 );

var SIZE = {x: Math.max(window.innerHeight, window.innerWidth) / 2, y: 30}

function createLines() {
  lines = new Array(22)
  for (var i = lines.length - 1; i >= 0; i--) {
    lines[i] = new Line(-SIZE.y/2 + i, 50, i, SIZE, Math.random() * i >> 0, audioAnalyser.frequencies(), material)
    scene.add(lines[i].mesh);
  };  
}

function update() {
  if(!renderer) {
    requestAnimationFrame(update);
    return;
  }
  
  for (var i = lines.length - 1; i >= 0; i--) {
    if(lines[i]) lines[i].update( audioAnalyser.frequencies(), material );
  }
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

onResize();

soundManager.setup({
  onready: function() {
    document.querySelector('button').classList.remove('button-loading');
    document.querySelector('button').innerText = "Start";
  },
});

window.onStartClick = function() {
  
  audio = soundManager.createSound({
    id: 'music', // optional: provide your own unique id
    url: 'mp3/lwtua.mp3',
    onload: init.bind(this),
    whileloading: function(e) {
      var perc = Math.round((this.bytesLoaded / this.bytesTotal) * 100);
      if(document.querySelector('button')) document.querySelector('button').innerText = 'loading ' + perc + "%";
    }
    // other options here..
  });

  audio.play();
  window.audio = audio;
}

window.onresize = onResize;
function onResize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}