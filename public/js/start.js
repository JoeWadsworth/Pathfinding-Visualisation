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
var board = document.getElementById('board');
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

function Show() {
  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {
      grid[i][j].show();
    }
  }

  for (var i = 0; i < ClosedSet.length; i++) {
    ClosedSet[i].show("#008080");
  }

  for (var i = 0; i < OpenSet.length; i++) {
    OpenSet[i].show("#105060");
  }
}

function CreateGrid(widthX, heightY) {
  var grid = "<table id='table'>";
  
  for ( i = 1; i <= heightY; i++ ) {
      grid += "<tr>";
      for ( j = 1; j <= widthX; j++ ) {
          grid += "<td></td>";
      }
      grid += "</tr>";
  }

  document.getElementById('board').innerHTML = grid;
  return grid;
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

function Spot(i,j) {
  this.i = i;
  this.j = j;

  this.f = 0;
  this.g = 0;
  this.h = 0;

  this.neighbors = [];
  this.previous = undefined;
  this.wall = false;

  if(Math.random() < 0.3) {
    this.wall = true;
  }

  this.show = function(colour) {
    if (this.wall) {
      document.getElementById('table').rows[this.i].cells[this.j].style.backgroundColor = "#000";
    } else if (colour) {
      document.getElementById('table').rows[this.i].cells[this.j].style.backgroundColor = colour;
    }
  }

  this.addNeighbors = function(grid) {
    var i = this.i;
    var j = this.j;

    if (i < heightY - 1) {
      this.neighbors.push(grid[i+1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i-1][j]);
    }
    if (j < widthX - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
  }
}

// function TableClick() {
//   console.log("Clickey Click");
//   console.log(this.parentNode.rowIndex);
// }



function setup() {
  //$("#board").append(CreateGrid(widthX, heightY));
  CreateGrid(widthX, heightY);

  for (var i = 0; i < heightY; i++) {
    grid[i] = new Array(widthX);
  }

  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {
      grid[i][j] = new Spot(i,j);
    }
  }

  for (var i = 0; i < heightY; i++) {
    for (var j = 0; j < widthX; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  start = grid[0][0];
  end = grid[heightY - 1][widthX - 1];

  start.wall = false;
  end.wall = false;

  OpenSet.push(start);

  Show();

  //Add event to state when the table was clicked.
  $("td").click(function() {
      var index = $("td").index(this);
      var row = Math.floor((index)/widthX);
      var col = (index % widthX);
      console.log("Row Index: "+row+", Col Index: "+col);

      var clickedWall = grid[row][col].wall

      if(current) {
        grid[row][col].wall = false;
        $(this).css('background-color', '#FFF');
      } else {
        grid[row][col].wall = true;
        $(this).css('background-color', '#000');
      }
  });
}

function draw() {
  if (doDraw || finished) {
    //Still searching
    if (OpenSet.length > 0) {

      //Best next option
      var winner = 0;
      for(var i = 0; i < OpenSet.length; i++) {
        if(OpenSet[i].f < OpenSet[winner].f) {
          winner = i;
        }
      }

      var current = OpenSet[winner];

      //If the best option is the end point
      if(current === end) {
        console.log("Solution");
        finished = true;
        document.getElementById('Status').innerHTML = 'Solution Found';
        noLoop();
      }

      RemoveFromArray(OpenSet,current);
      ClosedSet.push(current);

      var neighbors = current.neighbors;
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];

        //Ensure neighbor is valid
        if(!ClosedSet.includes(neighbor) && !neighbor.wall) {
          var tempG = current.g + heuristic(neighbor,current);
          var newPath = false;
          if(OpenSet.includes(neighbor)) {
            if(tempG < neighbor.g) {
              neighbor.g = tempG;
              newPath = true;
            }
          } else {
            neighbor.g = tempG;
            newPath = true;
            OpenSet.push(neighbor);
          }

          if(newPath) {
            neighbor.h = heuristic(neighbor,end);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.previous = current;
          }
        }
      }
    } else {
      console.log("No Solution");
      finished = true;
      document.getElementById('Status').innerHTML = 'No Solution';
      noLoop();
    }

    Show();

    var Path = [];
    var temp = current;
    Path.push(temp);

    while(temp.previous) {
      Path.push(temp.previous);
      temp = temp.previous;
    }

      for (i = 0; i < Path.length; i++) {
      Path[i].show("ff0");
    }
  }
}
