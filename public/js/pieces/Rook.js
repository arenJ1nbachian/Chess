import { ChessPiece } from "../ChessPiece.js";

export class Rook extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.amtMove = 0;
    this.availableMoves = [];
  }

  hasMoved() {
    return this.amtMove > 0;
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    // Horizontal and vertical moves
    let moves = [];
    const directions = [
      { row: -1, column: 0 }, // Up
      { row: 1, column: 0 }, // Down
      { row: 0, column: -1 }, // Left
      { row: 0, column: 1 }, // Right
    ];

    directions.forEach((direction) => {
      // Calculate the new position based on the current position and the direction of movement of a rook
      let nextRow = this.position.row + direction.row;
      let nextColumn = this.position.column + direction.column;

      // Loop until an obstacle is encountered or the edge of the board is reached
      while (nextRow >= 0 && nextRow < 8 && nextColumn >= 0 && nextColumn < 8) {
        // Check if the next square is occupied
        if (board.isSquareOccupied({ row: nextRow, column: nextColumn })) {
          // If the square is occupied, check the piece's color
          const pieceAtSquare = board.getPieceAtPosition({
            row: nextRow,
            column: nextColumn,
          });
          if (pieceAtSquare.color !== this.color) {
            // If it's an opponent's piece, add it as a possible move (capture)
            this.availableMoves.push({
              row: nextRow,
              column: nextColumn,
            });
          }
          // After encountering any piece, break out of the loop since the Rook cannot move past it
          break;
        } else {
          // If the square is not occupied, it's a valid move
          this.availableMoves.push({ row: nextRow, column: nextColumn });
        }

        // Prepare for the next iteration to check the next square in the direction
        nextRow += direction.row;
        nextColumn += direction.column;
      }
    });

    return this.availableMoves;
  }
}
