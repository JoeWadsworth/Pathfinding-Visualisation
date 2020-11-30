const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const cellSize = 25;
const boardWidth = Math.floor(screenWidth / cellSize);
const boardHeight = Math.floor((screenHeight / cellSize) - 6);

function removeItemFromArray(array, item) {
    for (let i = array.length - 1; i >= 0; i--) {
        if(array[i] === item) {
            array.splice(i,1);
        }
    }
}

function euclideanDistance(nodeA, nodeB) {
    let x = Math.abs(nodeB.getRow() - nodeA.getRow());
    let y = Math.abs(nodeB.getColumn() - nodeA.getColumn());
    return Math.sqrt((x * x) + (y * y));
}

function manhattanDistance(nodeA, nodeB) {
    let x = Math.abs(nodeB.getRow() - nodeA.getRow());
    let y = Math.abs(nodeB.getColumn() - nodeA.getColumn());
    return x + y;
}

function setup() {
    let board = new Board(boardWidth, boardHeight);
    board.initialiseBoard();
    board.start = board.grid[0][0];
    board.finish = board.grid[boardHeight - 1][boardWidth - 1];
    board.openSet.push(board.getStart());
}

function aStar(board) {
    function timeout(index) {
        setTimeout(function () {
            board.addIteration();

            // Whilst there are nodes in the openSet
            if (board.getOpenSet().length > 0) {

                // Find the node with the smallest f value, set as the current
                let winner = 0;
                for (let i = 0; i < board.openSet.length; i++) {
                    if (board.openSet[i].f < board.openSet[winner].f) {
                        winner = i;
                    }
                }

                var current = board.openSet[winner];

                // If the best option is the end point, finish animation
                if (current === board.getFinish()) {
                    board.finishAnimation("Solution");
                    return;
                }

                // Move current from openSet to closedSet
                removeItemFromArray(board.openSet, current);
                if (current.state !== "start" && current.state !== "finish") {
                    current.setState("closed");
                }
                board.closedSet.push(current);

                // Check each of the neighbours of the current node
                let neighbours = current.neighbours;
                for (let i = 0; i < neighbours.length; i++) {
                    let neighbour = neighbours[i];

                    // Ignore if neighbour is a wall or in the closedSet
                    if (!board.closedSet.includes(neighbour) && neighbour.state !== "wall") {

                        let tempG = current.g + euclideanDistance(neighbour, current);
                        let newPath = false;

                        // If neighbour is in the openSet, check g
                        if (board.openSet.includes(neighbour)) {
                            if (tempG < neighbour.g) {
                                newPath = true;
                            }
                        } else {
                            newPath = true;
                            if (neighbour.state !== "start" && neighbour.state !== "finish") {
                                neighbour.setState("closed");
                            }
                            board.openSet.push(neighbour);
                        }

                        if (newPath) {
                            neighbour.g = tempG;
                            neighbour.h = manhattanDistance(neighbour, board.getFinish());
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
                if (board.path[i].state !== "start" && board.path[i].state !== "finish") {
                    board.path[i].setState("closed");
                }
            }

            board.path = [];
            board.path.push(current);

            while (current.previous) {
                board.path.push(current.previous);
                current = current.previous;
            }

            for (i = 0; i < board.path.length; i++) {
                if (board.path[i].state !== "start" && board.path[i].state !== "finish") {
                    board.path[i].setState("path");
                }
            }

            timeout(index++);
        }, 0);
    }
    timeout(0);
}

setup();