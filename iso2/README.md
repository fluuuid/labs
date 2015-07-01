## Conway's Game of Life Browserify module 


### Install

```
$ npm install gof-gpu --save-dev

```


### Usage

```
var GoL = require('gof-array');
var world = new GoL(sizeOfYourBuffer);

function update()
{
    if(gol.started) 
    {
        var grid = world.update();
        for (var i = 0; i < grid.length; i+=4) {
            var line = grid[i];
            var lineBoxes = boxes[i/4 >> 0];
            // line[a] element true/false
        }
    }
    
    requestAnimationFrame(update);
}

```

![image](http://labs.fluuu.id/iso/gof.jpg)

[Live Demo](http://labs.fluuu.id/iso)
