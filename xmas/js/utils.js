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

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}
function toHex(n) {
     n = parseInt(n,10);
     if (isNaN(n)) return "00";
     n = Math.max(0,Math.min(n,255));
     return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
}

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
// stats.domElement.style.display = 'none';
document.body.appendChild(stats.domElement);
