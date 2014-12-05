/*
@silviopaganini | utils
*/

PIXMAS = {} || PIXMAS;
PIXMAS.SkyShader = {
    vertexShader : [
        "varying vec3 vWorldPosition;",

        "void main() {",

        "    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
        "    vWorldPosition = worldPosition.xyz;",

        "    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"
    ].join("\n"),

    fragmentShader : [
        "uniform vec3 topColor;",
        "uniform vec3 bottomColor;",
        "uniform float offset;",
        "uniform float exponent;",

        "varying vec3 vWorldPosition;",

        "void main() {",

        "   float h = normalize( vWorldPosition + offset ).y;",
        "   gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );",

        "}"
    ].join("\n")
}

var ToRad = Math.PI / 180;

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function computeColours(canvas, context, pix, size)
{
    for (var x = 1; x < canvas.width; x+=size) {
        for (var y = 1; y < canvas.height; y+=size) {
            d = context.getImageData(x, y, 1, 1).data
            if(d[3] > 0) pix.push({x: x, y: y, color: "#" + rgbToHex(d[0], d[1], d[2])});
        }
    };
}

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
     n = parseInt(n,10);
     if (isNaN(n)) return "00";
     n = Math.max(0,Math.min(n,255));
     return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
}

function randomRange(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
stats.domElement.style.display = 'none';
document.body.appendChild(stats.domElement);

var sound = new Howl({
  urls: ['static/audio/track.mp3'],
  loop: true,
  volume: 0
});

var soundSlow = new Howl({
  urls: ['static/audio/bullet.mp3'],
  volume: 1
});

var soundReverse = new Howl({
  urls: ['static/audio/reverse.mp3'],
  loop: false,
  volume: 0.7,
  rate: .6
});

var soundClick = new Howl({
  urls: ['static/audio/click.mp3'],
  loop: false,
  volume: 0.7
});

sound.on('load', function(a){
    $($(document.body).find(".spinner")[0]).addClass('spinner-hide')
    setTimeout(function(){
        $('#buttonChange').addClass('button-active');
        $('#headphones').addClass('headphone-active');
        
        $('#buttonChange').textillate({ in: { effect: 'fadeInUp' } });
        $(window).one("click", window.init);
    }, 1000);
})

function onWindowKeyUp(e){
    switch(e.keyCode){
        case 83: 
            stats.domElement.style.display = stats.domElement.style.display == 'none' ? 'block' : 'none'
        break;
    }
}

window.addEventListener("keyup", onWindowKeyUp, false);