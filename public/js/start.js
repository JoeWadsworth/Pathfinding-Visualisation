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

function StopStart() {
  if(doDraw) {
    doDraw = false;
    document.getElementById('StopStart').innerHTML = 'Start';
    document.getElementById('Status').innerHTML = 'Paused';
  } else {
    doDraw = true;
    document.getElementById('StopStart').innerHTML = 'Pause';
    document.getElementById('Status').innerHTML = 'Calculating..';
  }
}

function Node(i, j, state) {
  this.i = i;
  this.j = j;
  this.state = state;

  this.f = 0;
  this.g = 0;
  this.h = 0;

  this.neighbours = [];
  this.previous = undefined;
  this.wall = false;

  // this.show = function(colour) {
  //   if (this.wall) {
  //     document.getElementById('table').rows[this.i].cells[this.j].style.backgroundColor = "#000";
  //   } else if (colour) {
  //     document.getElementById('table').rows[this.i].cells[this.j].style.backgroundColor = colour;
  //   }
  // }

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

  this.addneighbours = function(grid) {
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
  //return board;
}

Board.prototype.generateWalls = function() {
  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {

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
      this.grid[i][j].addneighbours(this.grid);
    }
  }
}

Board.prototype.userClicks = function() {
  document.getElementById('StopStart').onclick = () => {
    startIt(this);
  }
}

Board.prototype.show = function() {
  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {
      document.getElementById(`${i}-${j}`).className = this.grid[i][j].state;
    }
  }
}

// function Show() {
//   for (var i = 0; i < heightY; i++) {
//     for (var j = 0; j < widthX; j++) {
//       board.grid[i][j].newShow();
//     }
//   }

//   // for (var i = 0; i < ClosedSet.length; i++) {
//   //   ClosedSet[i].show("#008080");
//   // }

//   // for (var i = 0; i < OpenSet.length; i++) {
//   //   OpenSet[i].show("#105060");
//   // }
// }

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
  //$("#board").append(Board(widthX, heightY));
  let board = new Board(widthX, heightY);
  board.initialise();

  // for (var i = 0; i < heightY; i++) {
  //   grid[i] = new Array(widthX);
  // }

  // for (var i = 0; i < heightY; i++) {
  //   for (var j = 0; j < widthX; j++) {
  //     grid[i][j] = new Node(i,j);
  //   }
  // }

  board.start = board.grid[0][0];
  board.finish = board.grid[heightY - 1][widthX - 1];

  // start.wall = false;
  // end.wall = false;

  board.OpenSet.push(board.start);

  //Show();
  // for (var i = 0; i < heightY; i++) {
  //   for (var j = 0; j < widthX; j++) {
  //     board.grid[i][j].newShow();
  //   }
  // }

  //Add event to state when the table was clicked.
  // $("td").click(function() {
  //     var index = $("td").index(this);
  //     var row = Math.floor((index)/widthX);
  //     var col = (index % widthX);
  //     console.log("Row Index: "+row+", Col Index: "+col);

  //     var clickedWall = grid[row][col].wall;

  //     if(current) {
  //       grid[row][col].wall = false;
  //       $(this).css('background-color', '#FFF');
  //     } else {
  //       grid[row][col].wall = true;
  //       $(this).css('background-color', '#000');
  //     }
  // });
}

function startIt(board) {
  function timeout(index) {
    setTimeout(function () {

      if (finished) {
        return;
      }

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
          document.getElementById('Status').innerHTML = 'Solution Found';
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
        document.getElementById('Status').innerHTML = 'No Solution';
        return;
      }

      //Show();

      var Path = [];
      var temp = current;
      // temp.state = "path";
      Path.push(temp);

      while(temp.previous) {
        // temp.previous.state = "path";
        Path.push(temp.previous);
        temp = temp.previous;
      }

      for (i = 0; i < Path.length; i++) {
        // Path[i].show();
      }

      timeout(index + 1);
    }, 0);
  }
  timeout(0);
}