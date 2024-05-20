import { ChessPiece } from "../ChessPiece.js";

export class Knight extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.availableMoves = [];
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    // L-shaped movements for a Knight
    const moves = [];
    const directions = [
      { row: -2, column: -1 }, // Move 2 squares up and 1 square left
      { row: -2, column: 1 }, // Move 2 squares up and 1 square right
      { row: -1, column: -2 }, // Move 1 square up and 2 squares left
      { row: -1, column: 2 }, // Move 1 square up and 2 squares right
      { row: 1, column: -2 }, // Move 1 square down and 2 squares left
      { row: 1, column: 2 }, // Move 1 square down and 2 squares right
      { row: 2, column: -1 }, // Move 2 squares down and 1 square left
      { row: 2, column: 1 }, // Move 2 squares down and 1 square right
    ];

    directions.forEach((direction) => {
      // Calculate the new position based on the current position and the direction of movement of a knight
      const newRow = this.position.row + direction.row;
      const newColumn = this.position.column + direction.column;

      // Check if the new position is within the boundaries of the chessboard
      if (newRow >= 0 && newRow < 8 && newColumn >= 0 && newColumn < 8) {
        // If the square is occupied, check if the occupying piece is an opponent's piece
        if (board.isSquareOccupied({ row: newRow, column: newColumn })) {
          const pieceAtSquare = board.getPieceAtPosition({
            row: newRow,
            column: newColumn,
          });
          // If the piece is an opponent's, add the move as a possible capture
          if (pieceAtSquare.color !== this.color) {
            this.availableMoves.push({ row: newRow, column: newColumn });
          }
          // If the square is not occupied, add the move as a possible move
        } else {
          this.availableMoves.push({ row: newRow, column: newColumn });
        }
      }
    });
    return this.availableMoves;
  }
}
