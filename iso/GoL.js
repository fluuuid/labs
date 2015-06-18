var GameOfLife;

GameOfLife = (function() {
    
  function GameOfLife(res, speed) {
    this.res = res;
    this.grid = this.createCells();
    this.updateStep = speed >> 0;
    this.step = 0;
    this.buffer = [0, 1, 2, 0];
    this.startTime = Date.now() * .001;
  }

  GameOfLife.prototype.createCells = function() {
    var i, ref, results;
    results = [];
    for (x = i = 1, ref = this.res; 1 <= ref ? i <= ref : i >= ref; x = 1 <= ref ? ++i : --i) {

      var j, ref1, line = [];
      for (y = j = 1, ref1 = this.res; 1 <= ref1 ? j <= ref1 : j >= ref1; y = 1 <= ref1 ? ++j : --j) {
        line.push(false);
      }

      results.push(line);
    }

    return results;
  };

  GameOfLife.prototype.update = function() {
    var alive, d, g, i, j, k, l, m, n, o, ref, ref1, t;
    this.step = (this.step + 1) % this.updateStep;
    if (this.step > 0) {
      return;
    }
    g = this.grid.slice(0);
    for (i = l = 0, ref = this.res; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
      for (j = m = 0, ref1 = this.res; 0 <= ref1 ? m < ref1 : m > ref1; j = 0 <= ref1 ? ++m : --m) {
        n = this.getNeighbours(g, i, j);
        alive = 0;
        for (k = o = 0; o <= 7; k = ++o) {
          if (n[k] === true) {
            alive++;
          }
        }
        if (g[i][j]) {
          if (alive < 2 || alive > 3) {
            this.grid[i][j] = false;
          }
        } else {
          if (alive === 3) {
            this.grid[i][j] = true;
          }
        }
      }
    }
    this.buffer[0] = this.buffer[1];
    this.buffer[1] = this.buffer[2];
    this.buffer[2] = this.res;
    if (this.buffer[0] === this.buffer[1] || this.buffer[0] === this.buffer[2]) {
      this.buffer[3]++;
    } else {
      this.buffer[3] = 0;
    }

    t = Date.now() * .001;

    if (this.res < 2 || t - this.startTime > 16) {
      return this.restart();
    }
  };

  GameOfLife.prototype.getNeighbours = function(array, i, j) {
    var n;
    n = [null, null, null, null, null, null, null, null];
    if (i > 0) {
      n[0] = array[i - 1][j];
      if (j < this.res - 1) {
        n[1] = array[i - 1][j + 1];
      }
    }
    if (j < this.res - 1) {
      n[2] = array[i][j + 1];
      if (i < this.res - 1) {
        n[3] = array[i + 1][j + 1];
      }
    }
    if (i < this.res - 1) {
      n[4] = array[i + 1][j];
      if (j > 0) {
        n[5] = array[i + 1][j - 1];
      }
    }
    if (j > 0) {
      n[6] = array[i][j - 1];
      if (i > 0) {
        n[7] = array[i - 1][j - 1];
      }
    }
    return n;
  }

  GameOfLife.prototype.markRandomCells = function() {
    var i, j, ref, ref1, x, y;

    for (x = i = 0, ref = this.res; 0 <= ref ? i < ref : i > ref; x = 0 <= ref ? ++i : --i) {
      for (y = j = 0, ref1 = this.res; 0 <= ref1 ? j < ref1 : j > ref1; y = 0 <= ref1 ? ++j : --j) {
        this.grid[x][y] = Math.random() < .9;
      }
    }

  };

  GameOfLife.prototype.restart = function() {
    this.startTime = Date.now() * .001;
    this.markRandomCells();
  };

  return GameOfLife;

})();

module.exports = GameOfLife;