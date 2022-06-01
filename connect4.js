//html stuff
const mainMenu = document.querySelector(".mainMenu");
const menuBtn = document.querySelector("#mBtn");
const restartBtn = document.querySelector("#rBtn");
const optionsBtn = document.querySelector(".imgBtn");
const addPl = document.querySelector(".addPlayer");
const playerText = document.querySelector("h2");


let playerLimit = 4;
let currentGame;

//starts the game when the play button is pressed
mainMenu.addEventListener("submit", (event) => {
  event.preventDefault();

  mainMenu.classList.add("hiddenObj");
  playerText.classList.remove("hiddenObj");
  optionsBtn.classList.remove("hiddenObj");

  if (currentGame.numOfPlayers === 0) {
    //if you don't add players it adds two by default
    currentGame.players.push(
      new Player("red", 1, false),
      new Player("blue", 2, true)
    );
    currentGame.numOfPlayers = 2;
  }

  if (currentGame.numOfPlayers === 1) {
    currentGame.players.push(new Player("blue", 2, true));
    currentGame.numOfPlayers = 2;
  }

  let divs = document.querySelectorAll(".playerSlot");
  for (let d of divs) {
    d.remove();
  }
  currentGame.makeBoard();
  currentGame.makeHtmlBoard();
  currentGame.checkIfCP();
});

mainMenu.addEventListener("click", (event) => {
  if (event.target.name === "AddPlayerBtn") {
    if (currentGame.numOfPlayers < playerLimit) {
      mainMenu.classList.add("hiddenObj");
      addPl.classList.remove("hiddenObj");
    } else {
      alert("Sorry you can't have that many players");
    }
  }
});
//adds a player
addPl.addEventListener("submit", () => {
  event.preventDefault();

  let color = document.querySelector("input[name='p1Color']").value;
  let isCp = false;
  try {
    isCp = document.querySelector("input[name='PlayerVs']:checked").value;
    isCp === "true" ? (isCp = true) : (isCp = false);
  } catch (e) {
    //if the player does not set a value, or there is an error, it defaults to false
    isCp = false;
  }
  currentGame.numOfPlayers++;
  currentGame.players.push(new Player(color, currentGame.numOfPlayers, isCp));
  addPl.classList.add("hiddenObj");
  mainMenu.classList.remove("hiddenObj");
  makeNewPlayerSlot(isCp, color);
});
//adds the visual for the player
function makeNewPlayerSlot(isCp, color) {
  let newPlayer = document.createElement("div");
  let newtext = document.createElement("h3");
  newPlayer.classList.add("playerSlot");
  newtext.innerText = isCp === true ? "Computer" : "Player";
  newPlayer.append(newtext);
  setColor(newPlayer, color);
  mainMenu.prepend(newPlayer);
}

function setColor(element, color) {
  element.style.backgroundColor = color;
}
//restarts the game
restartBtn.addEventListener("click", () => {
  currentGame.switchPlayers();
  currentGame.gameOverMsg(`Player ${currentGame.currPlayer.num} won!`);
  currentGame.resetGame();
  currentGame.startGame();
});

//goes to the main menu
menuBtn.addEventListener("click", () => {
  mainMenu.classList.remove("hiddenObj");
  playerText.classList.add("hiddenObj");
  optionsBtn.classList.add("hiddenObj");
  currentGame.resetGame();
  currentGame = new ConnectGame(0, 7, 6);
});

//you can also press the numbers on you keyboard to place a piece
window.addEventListener("keydown", (event) => {
  let regex = /[\d]/;
  if (
    regex.test(event.key) &&
    !currentGame.isCpTurn &&
    !currentGame.isGameOver
  ) {
    currentGame.updateGame(event.key - 1);
  }
});

//gives a random value from the min num to the max num except the exceptions
function randomRange(min, max, ...except) {
  let isrand = false;
  let num = 0;
  while (!isrand) {
    num = Math.floor(Math.random() * max);
    //if the num picked is less than the minimum then it pick a different num
    num >= min ? (isrand = true) : (isrand = false);
    //if the num is the same as any of the exceptions then it picks a different num
    if (except.length > 0) {
      isrand = !except.some((exNum) => exNum === num);
    }
  }

  return num;
}



class Player {
  constructor(color, num, isCp) {
    this.color = color;
    this.num = num;
    this.isCp = isCp;
  }
}

class Piece {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.piece = document.createElement("div");
  }

  animatePiece(cell, animObjs, animTime, time) {
    setTimeout(() => {
      this.piece.animate(animObjs, animTime);
      cell.append(this.piece);
    }, time);
  }

  placeInTable() {
    const { x, y, color, piece } = this;
    let cell = document.getElementById(`${y}-${x}`);
    piece.setAttribute("class", "piece");
    setColor(piece, color);
    this.animatePiece(
      cell,
      [{ transform: "translateY(-500px)" }, { transform: "translateY(30px)" }],
      1000,
      200
    );
  }
}

class Game {
  constructor(numOfPlayers, width, height, ...players) {
    this.numOfPlayers = numOfPlayers;
    this.width = width;
    this.height = height;
    this.players = players;
    this.board = [];
    this.currPlayer;
    this.isCpTurn = false;
    this.isGameOver = false;
    this.gameDiv = document.getElementById("game"); //gets the "board"
    this.htmlBoard = document.getElementById("board");
  }

  makeBoard() {
    for (let i = 0; i < this.height; i++) {
      let tempArr = [];
      for (let i = 0; i < this.width; i++) {
        tempArr.push(null);
      }

      this.board.push(tempArr);
    }
  }

  makeHtmlBoard() {
    // make column tops (clickable area for adding a piece to that column)
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", currentGame.handleClick);

    for (let x = 0; x < this.width; x++) {
      const headCell = document.createElement("td");
      headCell.setAttribute("id", x);
      top.append(headCell);
    }

    this.htmlBoard.append(top);

    // make main part of board
    for (let y = 0; y < this.height; y++) {
      const row = document.createElement("tr");

      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement("td");
        cell.setAttribute("id", `${y}-${x}`);
        row.append(cell);
      }

      this.htmlBoard.append(row);
    }

    this.currPlayer = this.players[0];
  }

  checkIfCP() {
    if (currentGame.currPlayer.isCp === true) {
      currentGame.isCpTurn = true;
      currentGame.playCPTurn();
    } else {
      currentGame.isCpTurn = false;
    }
  }

  switchPlayers() {
    this.currPlayer.num === this.numOfPlayers
      ? (this.currPlayer = this.players[0])
      : (this.currPlayer = this.players[this.currPlayer.num]);
    this.checkIfCP();
  }

  switchPlayerText() {
    setColor(playerText, this.currPlayer.color);
    playerText.innerText = "Player " + this.currPlayer.num;
  }

  checkIfTie(arr) {
    return arr.every((val) => val.every((cell) => cell !== null));
  }
}

class ConnectGame extends Game {
  constructor(width, height, ...players) {
    super(width, height, ...players);
    this.exceptNums = [];
  }

  gameOverMsg(msg) {
    alert(msg);
  }

  gameOverAnim() {
    let pieces = document.querySelectorAll(".piece");
    pieces.forEach((piece) => {
      piece.animate({ transform: "translateY(1000px)" }, 1500);
    });
  }

  endGame(msg) {
    currentGame.isGameOver = true;
    setTimeout(() => {
      setTimeout(() => {
        this.gameOverMsg(msg);
      }, 1000);
      this.gameOverAnim();
      setTimeout(() => {
        currentGame.resetGame();
        currentGame.startGame();
      }, 1500);
    }, 1600);
  }

  playCPTurn() {
    //random time to make it seem like its "thinking"
    let timer = randomRange(1, 4);

    setTimeout(() => {
      let x = randomRange(0, 7, ...this.exceptNums);

      //loops till it finds a row that has an empty spot
      //so it dosn't get stuck by a chooseing a row that is already full
      while (currentGame.updateGame(x) === null) {
        //adds x to the list of exceptions so that next time it won't choose that num again till next game
        this.exceptNums.push(x);
        x = randomRange(0, 7, ...this.exceptNums);
      }
    }, timer * 1000);
  }

  findSpotForCol(x) {
    for (let y = currentGame.height - 1; y >= 0; y--) {
      if (currentGame.board[y][x] === null) {
        currentGame.board[y][x] = currentGame.currPlayer.num;
        return y;
      }
    }

    return null;
  }

  checkForWin() {
    function _win(cells) {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer

      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < currentGame.height &&
          x >= 0 &&
          x < currentGame.width &&
          currentGame.board[y][x] === currentGame.currPlayer.num
      );
    }

    for (let y = 0; y < currentGame.height; y++) {
      for (let x = 0; x < currentGame.width; x++) {
        // get "check list" of 4 cells (starting here) for each of the different
        // ways to win
        const horiz = [
          [y, x],
          [y, x + 1],
          [y, x + 2],
          [y, x + 3],
        ];
        const vert = [
          [y, x],
          [y + 1, x],
          [y + 2, x],
          [y + 3, x],
        ];
        const diagDR = [
          [y, x],
          [y + 1, x + 1],
          [y + 2, x + 2],
          [y + 3, x + 3],
        ];
        const diagDL = [
          [y, x],
          [y + 1, x - 1],
          [y + 2, x - 2],
          [y + 3, x - 3],
        ];

        // find winner (only checking each win-possibility as needed)
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }

  updateGame(x) {
    // get next spot in column (if none, ignore click)
    let y = currentGame.findSpotForCol(x);
    if (y === null) {
      return null;
    }

    // place piece in board and add to HTML table

    let newPiece = new Piece(x, y, currentGame.currPlayer.color);
    newPiece.placeInTable(currentGame.currPlayer.num);

    if (currentGame.checkForWin() && !currentGame.isGameOver) {
      return currentGame.endGame(`Player ${currentGame.currPlayer.num} won!`);
    }

    if (currentGame.checkIfTie(currentGame.board) && !currentGame.isGameOver) {
      return currentGame.endGame(`Tie!`);
    }

    currentGame.switchPlayers();
    currentGame.switchPlayerText();
  }

  handleClick(evt) {
    // get x from ID of clicked cell
    if (!currentGame.isCpTurn && !currentGame.isGameOver) {
      let x = +evt.target.id;
      currentGame.updateGame(x);
    }
  }

  resetGame() {
    this.exceptNums = [];
    currentGame.board = [];
    let tr = document.querySelectorAll("tr");

    for (let r of tr) {
      r.remove();
    }
  }
  startGame() {
    currentGame.switchPlayerText();
    currentGame.makeBoard();
    currentGame.makeHtmlBoard();
    currentGame.checkIfCP();
    currentGame.isGameOver = false;
  }
}

currentGame = new ConnectGame(0, 7, 6);
