import { ChessPiece } from "../ChessPiece.js";

export class King extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.amtMove = 0;
    this.check = false;
    this.availableMoves = [];
  }

  hasMoved() {
    return this.amtMove > 0;
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    // Directions include diagonal, vertical, and horizontal moves
    const directions = [
      { row: -1, column: -1 }, // Northwest Diagonal
      { row: -1, column: 1 }, // Northeast Diagonal
      { row: 1, column: -1 }, // Southwest Diagonal
      { row: 1, column: 1 }, // Southeast Diagonal
      { row: -1, column: 0 }, // Up
      { row: 1, column: 0 }, // Down
      { row: 0, column: -1 }, // Left
      { row: 0, column: 1 }, // Right
    ];

    directions.forEach((direction) => {
      let nextRow = this.position.row + direction.row;
      let nextColumn = this.position.column + direction.column;
      // Ensure the move is within the board
      if (nextRow >= 0 && nextRow < 8 && nextColumn >= 0 && nextColumn < 8) {
        // Castling to the left check (queenside castling)
        if (direction.row === 0 && direction.column === -1) {
          // Check if the three squares to the left of the king are empty and safe
          if (
            !board.isSquareOccupied({
              row: nextRow,
              column: nextColumn,
            }) &&
            !board.isSquareOccupied({
              row: nextRow,
              column: nextColumn - 1,
            }) &&
            !board.isSquareOccupied({
              row: nextRow,
              column: nextColumn - 2,
            }) &&
            !this.hasMoved() && // Check if the king hasn't moved
            // Check if the rook on the queen's side hasn't moved
            ((this.color === "White" && !board.wRookLeft.hasMoved()) ||
              (this.color === "Black" && !board.bRookLeft.hasMoved()))
          ) {
            this.availableMoves.push({
              row: nextRow,
              column: nextColumn - 1,
            }); // Add queenside castling move
          }
        }
        // Castling to the right check
        else if (direction.row === 0 && direction.column === 1) {
          // Check if the two squares to the right of the king are empty
          if (
            !board.isSquareOccupied({
              row: nextRow,
              column: nextColumn,
            }) &&
            !board.isSquareOccupied({
              row: nextRow,
              column: nextColumn + 1,
            }) &&
            !this.hasMoved() && // Check if the king hasn't moved
            // Check if the rook in the corresponding corner hasn't moved
            ((this.color === "White" && !board.wRookRight.hasMoved()) ||
              (this.color === "Black" && !board.bRookRight.hasMoved()))
          ) {
            this.availableMoves.push({
              row: nextRow,
              column: nextColumn + 1,
            }); // Add castling move
          }
        }
        // Standard move check
        if (board.isSquareOccupied({ row: nextRow, column: nextColumn })) {
          // If occupied, check for capture
          const pieceAtSquare = board.getPieceAtPosition({
            row: nextRow,
            column: nextColumn,
          });
          if (pieceAtSquare.color !== this.color) {
            this.availableMoves.push({
              row: nextRow,
              column: nextColumn,
            });
          }
        } else {
          // Add as a valid move if not occupied
          this.availableMoves.push({
            row: nextRow,
            column: nextColumn,
          });
        }
      }
    });

    return this.availableMoves;
  }
}
