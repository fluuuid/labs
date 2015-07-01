var createFBO    = require('gl-fbo');
var createShader = require('gl-shader')
var ndarray      = require('ndarray');
var fill         = require("ndarray-fill")
var fillScreen   = require("a-big-triangle")

var GameOfLifeGL = function(bufferSize)
{
    this.state        = null
    this.updateShader = null
    this.drawShader   = null
    this.current      = 0;
    this.bufferSize   = bufferSize;
    this.started      = false;
    this.pixels       = null

    var canvas = document.createElement("canvas")
    this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

    this.init()
}

GameOfLifeGL.prototype.init = function() 
{
    this.started = true;

      //Turn off depth test
    this.gl.disable(this.gl.DEPTH_TEST)

    this.updateShader = createShader(this.gl, {
        vertex: "attribute vec2 position; varying vec2 uv; void main() { gl_Position = vec4(position,0.0,1.0); uv = 0.5 * (position+1.0); }",
        fragment: [
            "precision mediump float;",
            "uniform sampler2D buffer;",
            "uniform vec2 dims;",
            "varying vec2 uv;",

            "void main() {",
            "  float n = 0.0;",
            "  for(int dx=-1; dx<=1; ++dx)",
            "  for(int dy=-1; dy<=1; ++dy) {",
            "    n += texture2D(buffer, uv+vec2(dx,dy)/dims).r;",
            "  }",
            "  float s = texture2D(buffer, uv).r;",
            "  if(n > 3.0+s || n < 3.0) {",
            "    gl_FragColor = vec4(0,0,0,1);",
            "  } else {",
            "    gl_FragColor = vec4(1,1,1,1);",
            "  }",
            "}"].join("\n")
    });

    //Allocate buffers
    this.state = [ createFBO(this.gl, [this.bufferSize, this.bufferSize]), createFBO(this.gl, [this.bufferSize, this.bufferSize]) ]

    //Initialize this.state buffer
    var initial_conditions = ndarray(new Uint8Array(this.bufferSize*this.bufferSize*4), [this.bufferSize, this.bufferSize, 4])
    fill(initial_conditions, function(x,y,c) {
    if(c === 3) {
        return 255
    }
        return Math.random() > 0.7 ? 255 : 0
    })
    this.state[0].color[0].setPixels(initial_conditions)

    // this.drawShader.attributes.position.location =  0
    this.updateShader.attributes.position.location = 0
};

GameOfLifeGL.prototype.update = function() {
    var prevState = this.state[this.current]
    var curState = this.state[this.current ^= 1]

    //Switch to this.state fbo
    curState.bind()

    //Run update shader
    this.updateShader.bind()
    this.updateShader.uniforms.buffer = prevState.color[0].bind()
    this.updateShader.uniforms.dims = prevState.shape

    fillScreen(this.gl)

    this.pixels = new Uint8Array(this.bufferSize * this.bufferSize * 4);
    this.gl.readPixels(0, 0, this.bufferSize, this.bufferSize, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.pixels);

    return this.pixels;
};

module.exports = GameOfLifeGL