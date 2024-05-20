import { ChessPiece } from "../ChessPiece.js";

export class Pawn extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.availableMoves = [];
    this.previousCoordinate = null;
    this.enPassantCapturable = true;
    this.enPassantMoves = null;
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    const direction =
      this.color === "White"
        ? {
            forwardRow: -1,
            forwardColumn: 0,
            northwestRow: -1,
            northwestColumn: -1,
            northeastRow: -1,
            northeastColumn: 1,
          }
        : {
            forwardRow: 1,
            forwardColumn: 0,
            northwestRow: 1,
            northwestColumn: -1,
            northeastRow: 1,
            northeastColumn: 1,
          };
    let startRow = this.color === "White" ? 6 : 1;

    // Single step forward and Double Step forward
    let nextRow = this.position.row + direction.forwardRow;
    if (nextRow >= 0 && nextRow <= 7) {
      if (
        !board.isSquareOccupied({
          row: nextRow,
          column: this.position.column,
        })
      ) {
        this.availableMoves.push({
          row: nextRow,
          column: this.position.column,
        });
        if (
          this.position.row === startRow &&
          !board.isSquareOccupied({
            row: nextRow + direction.forwardRow,
            column: this.position.column,
          })
        ) {
          this.availableMoves.push({
            row: nextRow + direction.forwardRow,
            column: this.position.column,
          });
        } else {
        }
      }
      // Northwest
      if (
        board.isSquareOccupied({
          row: this.position.row + direction.northwestRow,
          column: this.position.column + direction.northwestColumn,
        })
      ) {
        const pieceAtSquare = board.getPieceAtPosition({
          row: this.position.row + direction.northwestRow,
          column: this.position.column + direction.northwestColumn,
        });

        if (pieceAtSquare?.color !== this.color) {
          // If it's an opponent's piece, add it as a possible move (capture)
          this.availableMoves.push({
            row: this.position.row + direction.northwestRow,
            column: this.position.column + direction.northwestColumn,
          });
        }
      }

      if (
        board.isSquareOccupied({
          row: this.position.row + direction.northeastRow,
          column: this.position.column + direction.northeastColumn,
        })
      ) {
        const pieceAtSquare = board.getPieceAtPosition({
          row: this.position.row + direction.northeastRow,
          column: this.position.column + direction.northeastColumn,
        });

        if (pieceAtSquare?.color !== this.color) {
          // If it's an opponent's piece, add it as a possible move (capture)
          this.availableMoves.push({
            row: this.position.row + direction.northeastRow,
            column: this.position.column + direction.northeastColumn,
          });
        }
      }
    }

    return this.availableMoves;
  }
}
