class Node {
    constructor(i, j, state) {
        this.i = i;
        this.j = j;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.state = state;
        this.neighbours = [];
        this.previous = undefined;
    };

    getRow() {
        return this.i;
    }

    getColumn() {
        return this.j;
    }

    getState() {
        return this.state;
    };

    getNeighbours() {
        return this.neighbours;
    };

    getPrevious() {
        return this.previous;
    };

    setState(state) {
        this.state = state;
        this.show();
    };

    show() {
        document.getElementById(`${this.i}-${this.j}`).className = this.getState();
    };

    addNeighbour(neighbour) {
        this.neighbours.push(neighbour);
    };

    addNeighbours(grid) {
        let i = this.i;
        let j = this.j;

        if (i < boardHeight - 1) {
            this.addNeighbour(grid[i+1][j]);
        }
        if (i > 0) {
            this.addNeighbour(grid[i-1][j]);
        }
        if (j < boardWidth - 1) {
            this.addNeighbour(grid[i][j + 1]);
        }
        if (j > 0) {
            this.addNeighbour(grid[i][j - 1]);
        }
    }

    clear() {
        this.setState('undefined');
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.neighbours = [];
        this.previous = undefined;
    }
}