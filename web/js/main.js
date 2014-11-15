// extending default particle from coffee-physics

function Particle2(ctx, mass, colour) {
    Particle.call( this );
    this.ctx = ctx;
    this.color = colour;
    this.connections = 0;
    this.setMass(mass);
}

Particle2.prototype = Object.create(Particle.prototype);

Particle2.prototype.dist = function(p1, p2)
{
    return Math.sqrt(Math.pow(p1.pos.x - p2.pos.x, 2) + Math.pow(p1.pos.y - p2.pos.y, 2));
}

Particle2.prototype.drawConnection = function( p )
{
    if(this.connections > 10) return;
    var d = this.dist(this, p);
    if(d < 80)
    {
        this.connections++;
        this.ctx.beginPath();
        this.ctx.moveTo(this.pos.x, this.pos.y);
        this.ctx.lineTo(p.pos.x, p.pos.y);
        this.ctx.lineWidth = .15;
        this.ctx.strokeStyle = this.color;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, .5)';
        this.ctx.stroke();
    }
}

Particle2.prototype.draw = function() {
    this.connections = 0;

    this.ctx.beginPath();
    this.ctx.arc( this.pos.x, this.pos.y, this.radius, 0, TWO_PI );
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
}

var MAX_PARTICLES = 500;
// var COLOURS = ["#9b59b6", "#e74c3c", "#f1c40f", "#d35400", "#1abc9c", "#95a5a6", "#3498db"];
// var COLOURS = ["#000000","#030303","#050505","#080808","#0A0A0A","#0D0D0D","#0F0F0F","#121212","#141414","#171717","#1A1A1A","#1C1C1C","#1F1F1F","#212121","#242424","#262626","#292929","#2B2B2B","#363636","#383838","#3B3B3B","#3D3D3D","#404040","#424242","#454545","#474747","#4A4A4A","#4D4D4D","#4F4F4F","#525252","#5C5C5C","#5E5E5E","#616161","#707070","#737373","#757575","#787878","#7A7A7A","#7D7D7D","#828282","#858585","#878787","#8A8A8A","#8C8C8C","#8F8F8F","#919191","#949494","#969696","#A1A1A1","#A3A3A3","#A6A6A6","#B0B0B0","#B3B3B3","#B5B5B5","#B8B8B8","#BABABA","#BDBDBD","#C2C2C2","#C4C4C4","#C7C7C7","#CFCFCF","#D1D1D1","#D4D4D4","#DEDEDE","#E0E0E0","#E3E3E3","#E5E5E5","#E8E8E8","#EBEBEB","#EDEDED","#F0F0F0","#F2F2F2","#C9C9C9","#CCCCCC","#ABABAB","#AAAAAA","#ADADAD"]
var COLOURS = ['#FFFFFF'];


var physics = new Physics();
physics.integrator = new Verlet();

var avoidMouse = new Attraction();
var collision = new Collision();

var app = Sketch.create({
    container: document.body,
    retina: window.devicePixelRatio > 1
});

app.setup = function() {

    avoidMouse.setRadius( 200 );
    avoidMouse.strength = 200;

    for ( var i = 0; i < MAX_PARTICLES; i++ ) {
        // position = new Vector( random( this.width ), random( this.height ) );
        offset = 1
        position = new Vector( random( this.width / offset) + (this.width - this.width / offset) / 2, random( this.height / offset ) + (this.height - this.height / offset) / 2 );

        particle = new Particle2(app, Math.max(.5, Math.random() * 2) , random(COLOURS));
        particle.setRadius( Math.max(1, particle.mass * 4.5) );
        particle.moveTo( position );
        //target, radius, strength
        var pullToCenter = new Attraction({x: position.x, y: position.y}, particle.radius * 200, particle.mass * 150);
        particle.behaviours.push( avoidMouse, pullToCenter, collision );

        collision.pool.push( particle );
        physics.particles.push( particle );
    }
}

app.draw = function() 
{
    physics.step();

    for (var i = 0; i < physics.particles.length; i++) {
        physics.particles[i].draw();

        for ( a = physics.particles.length - 1; a >= 0; a-- ) {
            var p = physics.particles[i];
            p.drawConnection(physics.particles[a]);
        }
    }
}

app.mousemove = function(){
    avoidMouse.target.x = app.mouse.x;
    avoidMouse.target.y = app.mouse.y;
}

