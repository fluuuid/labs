// extending default particle from coffee-physics

function Particle2(ctx, mass) {
    Particle.call( this );
    this.ctx = ctx;
    this.setMass(mass);
    this.color = "#FFFFFF";
}

Particle2.prototype = Object.create(Particle.prototype);

Particle2.prototype.dist = function(p1, p2)
{
    return Math.sqrt(Math.pow(p1.pos.x - p2.pos.x, 2) + Math.pow(p1.pos.y - p2.pos.y, 2));
}

Particle2.prototype.drawConnection = function( p )
{
    var d = this.dist(this, p);
    if(d < 80)
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.pos.x, this.pos.y);
        this.ctx.lineTo(p.pos.x, p.pos.y);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, .1)';
        this.ctx.stroke();
    }
}

Particle2.prototype.draw = function() {
    this.ctx.beginPath();
    this.ctx.arc( this.pos.x, this.pos.y, this.radius, 0, TWO_PI );
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
}

var MAX_PARTICLES = 500;
// var COLOURS = ["#9b59b6", "#e74c3c", "#f1c40f", "#d35400", "#1abc9c", "#95a5a6", "#3498db"];
var COLOURS = ['#FFFFFF'];

var physics = new Physics();
physics.integrator = new Verlet();

var avoidMouse = new Attraction();
var collision = new Collision();

var app = Sketch.create({
    container: document.body
});

app.setup = function() {

    avoidMouse.setRadius( 160 );
    avoidMouse.strength = 50;

    for ( var i = 0; i < MAX_PARTICLES; i++ ) {
        position = new Vector( random( this.width ), random( this.height ) );

        particle = new Particle2(app, Math.random());
        particle.setRadius( particle.mass * 2 );
        particle.moveTo( position );
        var pullToCenter = new Attraction({x: position.x, y: position.y}, particle.radius * 100, particle.mass * 50);
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
            //p.moveTo( p.pos.x + .001, p.pos.y + .001 );
        }
    }
}

app.mousemove = function(){
    avoidMouse.target.x = app.mouse.x;
    avoidMouse.target.y = app.mouse.y;
}

