class Board {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.start = null;
        this.finish = null;
        this.iterations = 0;
        this.grid = [];
        this.openSet = [];
        this.closedSet = [];
        this.path = [];
    };

    getWidth() {
        return this.width;
    };

    getHeight() {
        return this.height;
    };

    getStart() {
        return this.start;
    };

    getFinish() {
        return this.finish;
    };

    getOpenSet() {
        return this.openSet;
    }

    setStart() {
        this.grid[0][0].setState('start');
        this.start = this.grid[0][0];
    };

    setFinish() {
        this.grid[this.height - 1][this.width - 1].setState('finish');
        this.finish = this.grid[this.height - 1][this.width - 1];
    };

    addIteration() {
        this.iterations++;
    }

    initialiseBoard() {
        this.createBoard();
        this.setStart();
        this.setFinish();
        this.createBasicMaze();
        this.addNeighbours();
        this.addEventListeners();
    };

    createBoard() {
        let board = document.createElement('table');
        board.setAttribute('id', 'table');

        for (let i = 0; i < this.getHeight(); i++) {
            let row = document.createElement('tr');
            this.grid[i] = new Array(this.getWidth());

            for (let j = 0; j < this.getWidth(); j++) {
                this.createNode(i, j, 'undefined');

                let column = document.createElement('td');
                column.classList.add('undefined');
                column.setAttribute('id', `${i}-${j}`);
                row.appendChild(column);
            }
            board.appendChild(row);
        }
        document.getElementById('board').appendChild(board);
    };

    clearBoard() {
        for (let i = 0; i < this.getHeight(); i++) {
            for (let j = 0; j < this.getWidth(); j++) {
                this.grid[i][j].clear();
            }
        }
    };

    restartBoard() {
        document.getElementById('control').innerHTML = 'Start';
        this.start = null;
        this.finish = null;
        this.iterations = 0;
        this.openSet = [];
        this.closedSet = [];
        this.path = [];

        this.clearBoard();
        this.setStart();
        this.setFinish();
        this.createBasicMaze();
        this.addNeighbours();

        this.openSet.push(this.start);
    };

    createNode(i, j, state) {
        this.grid[i][j] = new Node(i, j, state);
    };

    addNeighbours() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.grid[i][j].addNeighbours(this.grid);
            }
        }
    };

    show() {
        for (let i = 0; i < this.getHeight(); i++) {
            for (let j = 0; j < this.getWidth(); j++) {
                document.getElementById(`${i}-${j}`).className = this.grid[i][j].state;
            }
        }
    };

    finishAnimation(result) {
        document.getElementById('control').disabled = false;
        document.getElementById('control').innerHTML = 'Restart';
    };

    clearMaze() {
        for (let i = 0; i < this.getHeight(); i++) {
            for (let j = 0; j < this.getWidth(); j++) {
                if (this.grid[i][j].getState() !== 'start' && this.grid[i][j].getState() !== 'finish') {
                    this.grid[i][j].setState('undefined');
                }
            }
        }
    };

    createBasicMaze() {
        this.clearMaze();

        for (let i = 0; i < this.getHeight(); i++) {
            for (let j = 0; j < this.getWidth(); j++) {
                if (this.grid[i][j].getState() !== 'start' && this.grid[i][j].getState() !== 'finish') {
                    if(Math.random() < 0.2) {
                        this.grid[i][j].setState('wall');
                    }
                }
            }
        }
    };

    addEventListeners() {
        window.addEventListener('load', () => {
            this.addControlEventListener();
            // this.addBasicMazeEventListener();
        });
    };

    addControlEventListener() {
        document.getElementById('control').addEventListener('click', () => {
            if (this.iterations === 0) {
                document.getElementById('control').disabled = true;
                document.getElementById('control').innerHTML = 'Calculating..';
                aStar(this);
            } else {
                this.restartBoard();
            }
        });
    };

    // addBasicMazeEventListener() {
    //     document.getElementById('basic-maze').addEventListener('click', () => {
    //         this.createBasicMaze();
    //     })
    // };
}