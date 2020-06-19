//Calculate window size
var screenX = window.innerWidth;
var screenY = window.innerHeight;

//Pixel size of each cell (square)
var cellSize = 25;

//Calculate correct size of table
var widthX = Math.floor(screenX/cellSize);
var heightY = Math.floor((screenY/cellSize)-6);

//Variables set
var start;
var end;
//var widthX = 76;
//var heightY = 29;
// var board = document.getElementById('board');
var board = null;
var grid = new Array(widthX);
var OpenSet = [];
var ClosedSet = [];
var Path = [];
var doDraw = false;
var finished = false;

function Node(i, j, state) {
  this.i = i;
  this.j = j;
  this.f = 0;
  this.g = 0;
  this.h = 0;
  this.state = state;
  this.neighbours = [];
  this.previous = undefined;
  this.wall = false;

  this.show = function() {
    document.getElementById(`${this.i}-${this.j}`).className = this.state;
  }

  this.changeState = function(state) {
    this.state = state;
    document.getElementById(`${i}-${j}`).className = this.state;
    if (this.state == 'wall') {
      this.wall = true;
    } else {
      this.wall = false;
    }
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
  this.calculating = false;
  this.iterations = 0;
  this.grid = [];
  this.OpenSet = [];
  this.ClosedSet = [];
  this.Path = [];
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

        this.grid[i][j] = new Node(i,j, nodeClass);
        board += `<td id='${i}-${j}' class='${nodeClass}'></td>`;

      }
      board += "</tr>";
  }

  document.getElementById('board').innerHTML = board;
}

Board.prototype.restartBoard = function() {
  document.getElementById("start").innerHTML = "Start";
  finished = false;
  this.start = null;
  this.finish = null;
  this.iterations = 0;
  this.OpenSet = [];
  this.ClosedSet = [];
  this.Path = [];

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
  this.OpenSet.push(this.start);
}

Board.prototype.generateWalls = function() {
  for (var i = 0; i < this.height; i++) {
    for (var j = 0; j < this.width; j++) {
      if (this.grid[i][j].state != "start" && this.grid[i][j].state != "finish") {
        if(Math.random() < 0.2) {
          this.grid[i][j].wall = true;
          this.grid[i][j].state = "wall";
          document.getElementById(`${i}-${j}`).className = this.grid[i][j].state;
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

function RemoveFromArray(array, item) {
  for (var i = array.length - 1; i >= 0; i--) {
    if(array[i] === item) {
      array.splice(i,1);
    }
  }
}

function heuristic(a,b) {
  var x = Math.abs(b.i - a.i);
  var y = Math.abs(b.j - a.j);
  var d = Math.sqrt(x*x + y*y);
  return d;
}

function setup() {
  let board = new Board(widthX, heightY);
  board.initialise();

  board.start = board.grid[0][0];
  board.finish = board.grid[heightY - 1][widthX - 1];

  board.OpenSet.push(board.start);
}

function aStar(board) {
  function timeout(index) {
    setTimeout(function () {

      if (finished) {
        board.calculating = false;
        return;
      }

      board.iterations++;

      //Still searching
      if (board.OpenSet.length > 0) {

        //Best next option
        var winner = 0;
        for(var i = 0; i < board.OpenSet.length; i++) {
          if(board.OpenSet[i].f < board.OpenSet[winner].f) {
            winner = i;
          }
        }

        var current = board.OpenSet[winner];

        //If the best option is the end point
        if(current === board.finish) {
          console.log("Solution");
          finished = true;
          document.getElementById('start').disabled = false;
          document.getElementById('start').innerHTML = 'Restart';
          return;
        }

        // Move from openset to closedset
        RemoveFromArray(board.OpenSet,current);
        if(current.state != "start" && current.state != "finish") {
          current.changeState("closed");
        }
        board.ClosedSet.push(current);

        var neighbours = current.neighbours;
        for (var i = 0; i < neighbours.length; i++) {
          var neighbour = neighbours[i];

          //Ensure neighbour is valid
          if(!board.ClosedSet.includes(neighbour) && !neighbour.wall) {
            var tempG = current.g + heuristic(neighbour,current);
            var newPath = false;
            if(board.OpenSet.includes(neighbour)) {
              if(tempG < neighbour.g) {
                neighbour.g = tempG;
                newPath = true;
              }
            } else {
              neighbour.g = tempG;
              newPath = true;
              if(neighbour.state != "start" && neighbour.state != "finish") {
                neighbour.changeState("closed");
              }
              board.OpenSet.push(neighbour);
            }

            if(newPath) {
              neighbour.h = heuristic(neighbour,board.finish);
              neighbour.f = neighbour.g + neighbour.h;
              neighbour.previous = current;
            }
          }
        }
      } else {
        console.log("No Solution");
        finished = true;
        document.getElementById('start').disabled = false;
        document.getElementById('status').innerHTML = 'Restart';
        return;
      }

      timeout(index + 1);

    }, 0);
  }
  timeout(0);
}

setup();