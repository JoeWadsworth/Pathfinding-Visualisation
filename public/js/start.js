//Pixel size of each cell (square)
var cellSize = 25;

//Calculate window size
var screenX = window.innerWidth;
var screenY = window.innerHeight;

//Calculate correct size of table
var widthX = Math.floor(screenX/cellSize);
var heightY = Math.floor((screenY/cellSize)-6);

function Node(i, j, state) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.state = state;
  this.neighbours = [];
  this.previous = undefined;

  this.show = function() {
    document.getElementById(`${this.i}-${this.j}`).className = this.state;
  }

  this.changeState = function(state) {
    this.state = state;
    document.getElementById(`${i}-${j}`).className = this.state;
  }

  this.clear = function() {
    this.changeState("undefined");
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbours = [];
    this.previous = undefined;
  }

  this.addNeighbours = function(grid) {
    var i = this.i;
    var j = this.j;

    if (i < heightY - 1) {
      this.neighbours.push(grid[i+1][j]);
    }
    if (i > 0) {
      this.neighbours.push(grid[i-1][j]);
    }
    if (j < widthX - 1) {
      this.neighbours.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbours.push(grid[i][j - 1]);
    }
  }
}

function Board(width, height) {
  this.width = width;
  this.height = height;
  this.start = null;
  this.finish = null;
  this.iterations = 0;
  this.grid = [];
  this.openSet = [];
  this.closedSet = [];
  this.path = [];
}

Board.prototype.initialise = function() {
  this.createBoard();
  this.generateWalls();
  this.addNeighbours();
  this.userClicks();
}

Board.prototype.createBoard = function() {
  let board = "<table id='table'>";
  
  for (i = 0; i < this.height; i++) {

      this.grid[i] = new Array(this.width);
      board += "<tr>";

      for (j = 0; j < this.width; j++) {

        if (i == 0 && j == 0) {
          var nodeClass = "start";
        } else if (i == (this.height - 1) && j == (this.width - 1)) {
          var nodeClass = "finish";
        } else {
          var nodeClass = "undefined";
        }

        this.grid[i][j] = new Node(i, j, nodeClass);
        board += `<td id='${i}-${j}' class='${nodeClass}'></td>`;

      }
      board += "</tr>";
  }

  document.getElementById('board').innerHTML = board;
}

Board.prototype.restartBoard = function() {
  document.getElementById("start").innerHTML = "Start";
  this.finished = false;
  this.start = null;
  this.finish = null;
  this.iterations = 0;
  this.openSet = [];
  this.closedSet = [];
  this.path = [];

  for (var i = 0; i < this.height; i++) {
    for (var j = 0; j < this.width; j++) {
      this.grid[i][j].clear();
    }
  }

  this.grid[0][0].changeState("start");
  this.grid[this.height - 1][this.width - 1].changeState("finish");
  this.generateWalls();
  this.addNeighbours();
  this.start = this.grid[0][0];
  this.finish = this.grid[this.height - 1][this.width - 1];
  this.openSet.push(this.start);
}

Board.prototype.generateWalls = function() {
  for (var i = 0; i < this.height; i++) {
    for (var j = 0; j < this.width; j++) {
      if (this.grid[i][j].state != "start" && this.grid[i][j].state != "finish") {
        if(Math.random() < 0.2) {
          this.grid[i][j].changeState("wall")
        }
      }
    }
  }
}

Board.prototype.addNeighbours = function() {
  for (var i = 0; i < this.height; i++) {
    for (var j = 0; j < this.width; j++) {
      this.grid[i][j].addNeighbours(this.grid);
    }
  }
}

Board.prototype.userClicks = function() {
  document.getElementById('start').onclick = () => {
    if (this.iterations == 0) {
      document.getElementById('start').disabled = true;
      document.getElementById('start').innerHTML = 'Calculating..';
      aStar(this);
    } else {
      this.restartBoard();
    }
  }
}

Board.prototype.show = function() {
  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {
      document.getElementById(`${i}-${j}`).className = this.grid[i][j].state;
    }
  }
}

Board.prototype.finishAnimation = function(state) {
  this.finished = true;
  document.getElementById('start').disabled = false;
  document.getElementById('start').innerHTML = 'Restart';
}

function removeFromArray(array, item) {
  for (var i = array.length - 1; i >= 0; i--) {
    if(array[i] === item) {
      array.splice(i,1);
    }
  }
}

function euclideanDistance(a, b) {
  var x = Math.abs(b.i - a.i);
  var y = Math.abs(b.j - a.j);
  return Math.sqrt(x*x + y*y);
}

function manhattanDistance(a, b) {
  var x = Math.abs(b.i - a.i);
  var y = Math.abs(b.j - a.j);
  return x + y;
}

function setup() {
  let board = new Board(widthX, heightY);
  board.initialise();
  board.start = board.grid[0][0];
  board.finish = board.grid[heightY - 1][widthX - 1];
  board.openSet.push(board.start);
}

function aStar(board) {
  function timeout(index) {
    setTimeout(function () {

      board.iterations++;

      // Whilst there are nodes in the openSet
      if (board.openSet.length > 0) {

        // Find the node with the smallest f value, set as the current
        var winner = 0;
        for (var i = 0; i < board.openSet.length; i++) {
          if (board.openSet[i].f < board.openSet[winner].f) {
            winner = i;
          }
        }

        var current = board.openSet[winner];

        // If the best option is the end point, finish animation
        if (current === board.finish) {
          board.finishAnimation("Solution");
          return;
        }

        // Move current from openSet to closedSet
        removeFromArray(board.openSet, current);
        if (current.state != "start" && current.state != "finish") {
          current.changeState("closed");
        }
        board.closedSet.push(current);

        // Check each of the neighbours of the current node
        var neighbours = current.neighbours;
        for (var i = 0; i < neighbours.length; i++) {
          var neighbour = neighbours[i];

          // Ignore if neighbour is a wall or in the closedSet
          if (!board.closedSet.includes(neighbour) && neighbour.state != "wall") {

            var tempG = current.g + manhattanDistance(neighbour, current);
            var newPath = false;

            // If neighbour is in the openSet, check g
            if (board.openSet.includes(neighbour)) {
              if (tempG < neighbour.g) {
                newPath = true;
              }
            } else {
              newPath = true;
              if (neighbour.state != "start" && neighbour.state != "finish") {
                neighbour.changeState("closed");
              }
              board.openSet.push(neighbour);
            }

            if (newPath) {
              neighbour.g = tempG;
              neighbour.h = manhattanDistance(neighbour, board.finish);
              neighbour.f = neighbour.g + neighbour.h;
              neighbour.previous = current;
            }
          }
        }
      } else {
        board.finishAnimation("No Solution");
        return;
      }

      // Reset path back to blank
      for (i = 0; i < board.path.length; i++) {
        if (board.path[i].state != "start" && board.path[i].state != "finish") {
          board.path[i].changeState("closed");
        }
      }

      board.path = [];
      board.path.push(current);

      while (current.previous) {
        board.path.push(current.previous);
        current = current.previous;
      }

      for (i = 0; i < board.path.length; i++) {
        if (board.path[i].state != "start" && board.path[i].state != "finish") {
          board.path[i].changeState("path");
        }
      }

      timeout(index++);
    }, 0);
  }
  timeout(0);
}

setup();