var UTILS = {

    // faster Math.floor
    floor   : function(n){ return n >> 0; },                 
    
    // faster Math.round
    round   : function(n){ return ~~(n + .5); },             
    
    // flip a coin
    coin    : function(n){ return Math.random() < .5; },     
    
    // random 1 or -1
    coinN   : function(n){ return Math.random() < .5 ? 1 : -1; },
    
    // to radians
    rad     : function(n){ return n * Math.PI / 180; },      
    
    // random in range
    random  : function(min, max){ max = max || min; return Math.random() * (max - min) + min; },
    
    // clamp number 
    clamp   : function(val, min, max) { return Math.max(min, Math.min(max, val)); },
    
    // check if number is close to another, based on threshold
    near    : function(val , target, threshold) { return (Math.abs(val - target) <= threshold ); },
    
    // map value
    map     : function(value, inMin, inMax, outMin, outMax) { 
        // clamping, then norm, then lerp, in one function to avoid stack calls
        return ((Math.max(inMin, Math.min(inMax, value)) - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin; 
        // return this.lerp( this.norm( this.clamp( value , inMin , inMax ) , inMin , inMax ) , outMin , outMax );
    },
    
    // lerp - get percentage ( 0 - 1 ) between start and end
    lerp    : function(ratio , start , end) { return start + (end - start) * ratio; },
    
    // get normamlized ratio ( 0-1 ) of number in a range ( opposite of lerp )
    norm    : function(val , start , end) { return ( (val-start) / (end-start) ) ; },
    
    // count steps
    steps   : function(val, stepSize , overflow) { return ((val / stepSize >> 0) % overflow); },
    
    // return true/false if number in between
    between : function(n1, n2, n3){ return isNaN(n1) || isNaN(n2) || isNaN(n3) ? NaN : n1 >= Math.min(n2, n3) && n1 <= Math.max(n2, n3); },

    interpolate : {
        spherical : function (current, target, delta) { return current * (1.0 - delta) + target * delta; },
        linear    : function (current, target, delta) { return current + (target - current) * delta; }
    },

     ease: {
        linear: function(t) { return t},

        // accelerating from zero velocity
        inQuad: function(t) { return Math.pow(t, 2)},

        // decelerating to zero velocity
        outQuad: function(t) { return -(Math.pow((t - 1), 2) - 1)},

        // acceleration until halfway, then deceleration
        inOutQuad: function(t){ 
            if ((t /= 0.5) < 1) return 0.5 * Math.pow(t, 2);
            return -0.5 * ((t -= 2) * t - 2);
        },

        inCubic: function(t) { return Math.pow( t, 3)},

        outCubic: function(t) { return Math.pow((t - 1), 3) + 1},
    }

}

// suport for modules
if ( typeof module === 'object' ) module.exports = UTILS;