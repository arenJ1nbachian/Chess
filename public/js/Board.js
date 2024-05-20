import { Pawn } from "./pieces/Pawn.js";
import { Bishop } from "./pieces/Bishop.js";
import { Knight } from "./pieces/Knight.js";
import { King } from "./pieces/King.js";
import { Rook } from "./pieces/Rook.js";
import { Queen } from "./pieces/Queen.js";

export class Board {
  constructor() {
    this.grid = new Array(8).fill(null).map(() => new Array(8).fill(null));
    this.initializeBoard();
    this.wKing = this.grid[7][4];
    this.bKing = this.grid[0][4];
    this.wRookLeft = this.grid[7][0];
    this.wRookRight = this.grid[7][7];
    this.bRookLeft = this.grid[0][0];
    this.bRookRight = this.grid[0][7];
    this.capturedPawn = null;
  }

  initializeBoard() {
    // Initialize pawns
    for (let i = 0; i < 8; i++) {
      this.grid[1][i] = new Pawn(
        "Black",
        { row: 1, column: i },
        "img/b_Pawn.png"
      );
      this.grid[1][i].previousCoordinate = { row: 1, column: i };
      this.grid[6][i] = new Pawn(
        "White",
        { row: 6, column: i },
        "img/w_Pawn.png"
      );
      this.grid[6][i].previousCoordinate = { row: 6, column: i };
    }

    // Initializing the rest of the pieces
    const pieceTypes = [
      Rook,
      Knight,
      Bishop,
      Queen,
      King,
      Bishop,
      Knight,
      Rook,
    ];
    for (let i = 0; i < 8; i++) {
      this.grid[0][i] = new pieceTypes[i](
        "Black",
        { row: 0, column: i },
        `img/b_${pieceTypes[i].name}.png`
      );
      this.grid[7][i] = new pieceTypes[i](
        "White",
        { row: 7, column: i },
        `img/w_${pieceTypes[i].name}.png`
      );
    }
  }

  getPieceAtPosition(position) {
    const { row, column } = position;
    return this.grid[row][column] != null ? this.grid[row][column] : null;
  }

  getAllPiecesMoves(turn, board) {
    let piecesMoves = [];

    for (let i = 0; i < board.grid.length; i++) {
      for (let j = 0; j < board.grid[i].length; j++) {
        if (turn === "White" && board.grid[i]?.[j]?.color === "White") {
          piecesMoves.push(...board.grid[i][j].possibleMoves(board));
        } else if (turn === "Black" && board.grid[i]?.[j]?.color === "Black") {
          piecesMoves.push(...board.grid[i][j].possibleMoves(board));
        }
      }
    }
    return piecesMoves;
  }

  movePiece(fromPosition, toPosition) {
    const fromRow = fromPosition.row;
    const fromColumn = fromPosition.column;
    const toRow = toPosition.row;
    const toColumn = toPosition.column;

    if (
      JSON.stringify(this.grid[fromRow][fromColumn].enPassantMoves) ===
      JSON.stringify(toPosition)
    ) {
      this.grid[fromRow][fromColumn].color === "White"
        ? (this.grid[toRow + 1][toColumn] = null)
        : (this.grid[toRow - 1][toColumn] = null);
    }
    if (
      this.grid[fromRow][fromColumn] instanceof King &&
      !this.grid[fromRow][fromColumn].hasMoved()
    ) {
      const king = this.grid[fromRow][fromColumn];
      if (toRow === 7 && toColumn === 6) {
        this.grid[7][5] = this.grid[7][7];
        this.grid[7][7] = null;
        this.grid[7][5].position = { row: 7, column: 5 };
      } else if (toRow === 7 && toColumn === 2) {
        this.grid[7][3] = this.grid[7][0];
        this.grid[7][0] = null;
        this.grid[7][3].position = { row: 7, column: 3 };
      } else if (toRow === 0 && toColumn === 6) {
        this.grid[0][5] = this.grid[0][7];
        this.grid[0][7] = null;
        this.grid[0][5].position = { row: 0, column: 5 };
      } else if (toRow === 0 && toColumn === 2) {
        this.grid[0][3] = this.grid[0][0];
        this.grid[0][0] = null;
        this.grid[0][3].position = { row: 0, column: 3 };
      }
      king.color === "White" ? (this.wKing = king) : (this.bKing = king);
      king.amtMove++;
    } else if (this.grid[fromRow][fromColumn] instanceof King) {
      const king = this.grid[fromRow][fromColumn];

      king.color === "White" ? (this.wKing = king) : (this.bKing = king);
      king.amtMove++;
    } else if (this.grid[fromRow][fromColumn] instanceof Rook) {
      const rook = this.grid[fromRow][fromColumn];

      rook.color === "White"
        ? (rook) => {
            switch (rook.position) {
              case { row: 7, column: 0 }:
                this.wRookLeft = rook;
                break;
              case { row: 7, column: 7 }:
                this.wRookRight = rook;
                break;
            }
          }
        : (rook) => {
            switch (rook.position) {
              case { row: 0, column: 0 }:
                this.board.bRookLeft = rook;
                break;
              case { row: 0, column: 7 }:
                this.board.bRookRight = rook;
                break;
            }
          };
      rook.amtMove++;
    }

    if (
      this.grid[fromPosition.row][fromPosition.column] !== null &&
      this.grid[fromPosition.row][fromPosition.column].constructor.name ===
        "Pawn"
    ) {
      this.grid[fromPosition.row][fromPosition.column].previousCoordinate = {
        row: fromPosition.row,
        column: fromPosition.column,
      };
    }

    this.grid[toRow][toColumn] = this.grid[fromRow][fromColumn];
    this.grid[fromRow][fromColumn] = null;
    this.grid[toRow][toColumn].position = toPosition;
  }

  isSquareOccupied(position) {
    // Safely check if the position is within bounds and return false if it isn't
    if (
      position.row >= 0 &&
      position.row < this.grid.length &&
      position.column >= 0 &&
      position.column < this.grid[position.row].length
    ) {
      return !!this.grid[position.row][position.column];
    } else {
      return false;
    }
  }

  clone() {
    const newBoard = new Board();

    newBoard.grid = this.grid.map((row) => row.slice()); // Create a shallow copy of the grid structure

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.grid[row][col];
        if (piece) {
          newBoard.grid[row][col] = new piece.constructor(
            piece.color,
            { row: piece.position.row, column: piece.position.column },
            piece.img
          );
        } else {
          newBoard.grid[row][col] = null;
        }
        if (piece !== null && piece.constructor.name === "Pawn") {
          newBoard.grid[row][col].enPassantMoves = JSON.parse(
            JSON.stringify(piece.enPassantMoves)
          );
        }
      }
    }

    newBoard.bKing = new King(
      this.bKing.color,
      this.bKing.position,
      this.bKing.img
    );
    newBoard.bKing.amtMove = this.bKing.amtMove;
    newBoard.bKing.check = this.bKing.check;

    newBoard.wKing = new King(
      this.wKing.color,
      this.wKing.position,
      this.wKing.img
    );
    newBoard.wKing.amtMove = this.wKing.amtMove;
    newBoard.wKing.check = this.wKing.check;
    newBoard.bRookLeft = new Rook(
      this.bRookLeft.color,
      this.bRookLeft.position,
      this.bRookLeft.img
    );
    newBoard.bRookLeft.amtMove = this.bRookLeft.amtMove;
    newBoard.bRookLeft.availableMoves = this.bRookLeft.availableMoves;
    newBoard.bRookRight = new Rook(
      this.bRookRight.color,
      this.bRookRight.position,
      this.bRookRight.img
    );
    newBoard.bRookRight.amtMove = this.bRookRight.amtMove;
    newBoard.bRookRight.availableMoves = this.bRookRight.availableMoves;
    newBoard.wRookLeft = new Rook(
      this.wRookLeft.color,
      this.wRookLeft.position,
      this.wRookLeft.img
    );
    newBoard.wRookLeft.amtMove = this.wRookLeft.amtMove;
    newBoard.wRookLeft.availableMoves = this.wRookLeft.availableMoves;
    newBoard.wRookRight = new Rook(
      this.wRookRight.color,
      this.wRookRight.position,
      this.wRookRight.img
    );
    newBoard.wRookRight.amtMove = this.wRookRight.amtMove;
    newBoard.wRookRight.availableMoves = this.wRookRight.availableMoves;
    newBoard.grid[newBoard.wKing.position.row][newBoard.wKing.position.column] =
      newBoard.wKing;
    newBoard.grid[newBoard.bKing.position.row][newBoard.bKing.position.column] =
      newBoard.bKing;

    return newBoard;
  }
}
