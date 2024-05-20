// Base class for all chess pieces, defining common properties and enforcing implementation of movement logic in subclasses.
export class ChessPiece {
  // Constructor initializes a new instance of a ChessPiece with its basic attributes.
  constructor(color, position, img) {
    this.color = color; // Color of the chess piece ('white' or 'black'), determining the player it belongs to.
    this.position = position; // Position should be an object { row: x, column: y }
    this.img = img; // URL or path to the image representing the piece
  }

  // Abstract method
  possibleMoves(board) {
    // Throws an error if a subclass does not implement this method, ensuring that each chess piece type defines its own movement logic.
    throw new Error("Must implement possibleMoves method in subclass");
  }
}
