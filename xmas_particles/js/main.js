(function(){

var canvas,context,proton,renderer,emitter,stats;
var mouseObj = {x: 0, y: 0};
var pixiRender;
var behaviours = []

var wabbitTexture = new PIXI.Texture.fromImage("img/bunny.png");

function init() {

    proton = new Proton;

    createRenderer();
    loadImage()
    addStats();
    tick();
}

function loadImage() {

    canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context = canvas.getContext('2d');
    context.globalCompositeOperation = "lighter";

    var image = new Image()
    image.onload = function(e) {
        var rect = new Proton.Rectangle((canvas.width - e.target.width) / 2, (canvas.height - e.target.height) / 2, e.target.width, e.target.height);
        context.drawImage(e.target, rect.x, rect.y);
        createProton(rect);
        tick();
    }
    image.src = 'img/message.png';
}


function addStats() {
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.display = 'none';
    document.body.appendChild(stats.domElement);
}

function createProton(rect) {

    var texture = new PIXI.Texture.fromImage("img/particle.png");

    emitter = new Proton.Emitter();
    // emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.01, .015));

    // emitter.rate = new Proton.Rate(new Proton.Span(100, 1));

    emitter.rate = new Proton.Rate(new Proton.Span(10, 75), new Proton.Span(.02));
    emitter.addInitialize(new Proton.Position(new Proton.PointZone(0, 0)));

    emitter.addInitialize(new Proton.ImageTarget(texture));
    emitter.addInitialize(new Proton.Mass(1.5));
    emitter.addInitialize(new Proton.Life(1,5));
    emitter.addInitialize(new Proton.V(new Proton.Span(.05, .1), new Proton.Span(0, 360), 'polar'));

    emitter.addBehaviour(new Proton.Gravity(0));

    var imagedata = context.getImageData(rect.x, rect.y, rect.width, rect.height);
    emitter.addInitialize(new Proton.P(new Proton.ImageZone(imagedata, rect.x, rect.y - 100)));

    emitter.addInitialize(new Proton.Velocity(new Proton.Span(.5, 1), new Proton.Span(-20, 20), 'polar'));
    emitter.addBehaviour(new Proton.RandomDrift(3, 3, .05));
    emitter.addBehaviour(new Proton.Scale(1, [.5, .3, 0]));


    emitter.addBehaviour(new Proton.Alpha(.5, [.5, 0]));
    emitter.addBehaviour(new Proton.Scale(.05, .1));
    // emitter.addBehaviour(new Proton.Color('#000000', '#FFFFFF'));
    // emitter.addBehaviour(new Proton.Color('random', 'random', Infinity, Proton.easeInSine));

    // emitter.p.x = window.innerWidth / 2;
    // emitter.p.y = window.innerHeight / 2;
    emitter.emit();
    proton.addEmitter(emitter);

}

function createRenderer()
{
    renderer = new Proton.Renderer('other', proton);
    pixiRender = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    document.body.appendChild(pixiRender.view);
    
    pixiRender.view.addEventListener('mousemove', mousemoveHandler, false);
    pixiRender.view.addEventListener('mouseup', mouseupHandler, false);

    pixiStage = new PIXI.Stage;

    container = new PIXI.SpriteBatch();
    pixiStage.addChild(container);

    renderer.onProtonUpdate = function() {

    };
    renderer.onParticleCreated = function(particle) {
        var particleSprite = new PIXI.Sprite(particle.target);
        particle.sprite = particleSprite;
        container.addChild(particle.sprite);
    };

    renderer.onParticleUpdate = function(particle) {
        transformSprite(particle.sprite, particle);
    };

    renderer.onParticleDead = function(particle) {
        container.removeChild(particle.sprite);
    };

    renderer.start();

}

function transformSprite(particleSprite, particle) {
    particleSprite.position.x = particle.p.x;
    particleSprite.position.y = particle.p.y;
    particleSprite.scale.x = particle.scale;
    particleSprite.scale.y = particle.scale;
    particleSprite.anchor.x = 0.5;
    particleSprite.anchor.y = 0.5;
    particleSprite.alpha = particle.alpha;
    particleSprite.rotation = particle.rotation*Math.PI/180;
}


function mousemoveHandler(e) {
    if (e.layerX || e.layerX == 0) {
        mouseObj.x = e.layerX;
        mouseObj.y = e.layerY;
    } else if (e.offsetX || e.offsetX == 0) {
        mouseObj.x = e.offsetX;
        mouseObj.y = e.offsetY;
    }
}

function mouseupHandler(){

    var pos = {
        x : mouseObj.x,
        y : mouseObj.y
    };

    attractPoint = new Proton.Attraction(pos, .5, 1000);
    emitter.addBehaviour(attractPoint);

    var bunny = new PIXI.Sprite(wabbitTexture)
    bunny.position.x = pos.x;
    bunny.position.y = pos.y;
    pixiStage.addChild(bunny)

    // behaviours.push(attractPoint);
}


function tick() {

    requestAnimationFrame(tick);

    stats.begin();
    proton.update();
    pixiRender.render(pixiStage);

    stats.end();
}

init();

})();
