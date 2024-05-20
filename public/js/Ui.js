import { King } from "./pieces/King.js";

/**
 * The ui class is responsible for managing all user interface elements of the chess game.
 * It updates the game board, highlights possible moves, and handles pawn promotion UI.
 */
export class UI {
  /**
   * Initializes a new instance of the UI class, setting up the user interface for the chess game.
   * This includes initializing the game board display, managing user interactions, and visual feedback.
   * Essential for integrating the game logic with a visual representation, making the game interactive and user-friendly.
   * @param {Board} board - The game board instance to interact with.
   */
  constructor(board) {
    this.board = board; // Store a reference to the game board.
    this.updateUIBoard(board); // Initialize the UI with the current state of the board.
    this.selectedPiece = null; // Keeps track of the currently selected chess piece.
    this.selectedUIPiece = null;
  }

  /**
   * Highlights or removes highlights from possible moves for a selected chess piece on the board.
   * Uses different colors to indicate normal moves, captures, and special moves like castling.
   * Enhances user experience by visually indicating possible moves, aiding in decision-making and strategy planning.
   * @param {Array} possibleMoves - An array of positions where the selected piece can move.
   * @param {string} action - Specifies the action, either "add" to highlight or "remove" to clear highlights.
   */
  possibleUISelections(possibleMoves, action) {
    let self = this; // Reference to 'this'
    let color = null;
    $("tr").each(function (row) {
      $(this)
        .find("td")
        .each(function (column) {
          if (column % 2 === 0) {
            row % 2 === 0 ? (color = "white") : (color = "grey");
          } else {
            row % 2 === 0 ? (color = "grey") : (color = "white");
          }
          possibleMoves.forEach((possibleMove) => {
            // Check for castling, normal moves, and captures to apply different highlights.
            // Yellow highlight for castling, blue for normal moves, and red for captures.
            if (
              self.selectedPiece instanceof King &&
              self.isCastlingMove(row, column, possibleMove)
            ) {
              action === "add"
                ? $(this).css("background-color", "rgb(255, 255, 0, 0.8)")
                : $(this).css("background-color", `${color}`); // Castling move in yellow.
            } else if (
              row == possibleMove.row &&
              column == possibleMove.column &&
              self.board.grid[row][column] == null
            ) {
              action === "add"
                ? $(this).css("background-color", "rgb(135,206,250, 0.6)")
                : $(this).css("background-color", `${color}`); // Normal move in blue.
            } else if (
              row == possibleMove.row &&
              column == possibleMove.column
            ) {
              action === "add"
                ? $(this).css("background-color", "rgb(241,128,126, 0.8)")
                : $(this).css("background-color", `${color}`); // Capture move in red.
            }

            // Highlight the selected piece's current position.
            if (
              row === self.selectedPiece.position.row &&
              column === self.selectedPiece.position.column
            ) {
              action === "add"
                ? $(this).css("background-color", "rgb(255, 229, 180)")
                : $(this).css("background-color", `${color}`); // Selected piece in light orange.
            }
          });
        });
    });
  }

  /**
   * This method checks if a specific move is a castling move by comparing the move's
   * starting and ending positions with predefined conditions for castling. Castling
   * is a special chess move that involves moving the king two squares towards a rook
   * on the player's first rank, then moving that rook to the square over which the king crossed.
   *
   * How It Works:
   * - It first verifies if the king has moved, which is a prerequisite for castling.
   * - Then, it checks if the move matches the specific row and column indices that
   *   are valid for castling moves for both white and black pieces.
   * - The method uses the `possibleMove` parameter, which contains the proposed move's
   *   target row and column, and compares it against the king's current position and
   *   the castling rules.
   *
   */

  isCastlingMove(row, column, possibleMove) {
    return (
      !this.selectedPiece.hasMoved() &&
      ((this.selectedPiece.color === "White" &&
        ((row === 7 &&
          column === 2 &&
          possibleMove.row === 7 &&
          possibleMove.column === 2) ||
          (row === 7 &&
            column === 6 &&
            possibleMove.row === 7 &&
            possibleMove.column === 6))) ||
        (this.selectedPiece.color === "Black" &&
          ((row === 0 &&
            column === 2 &&
            possibleMove.row === 0 &&
            possibleMove.column === 2) ||
            (row === 0 &&
              column === 6 &&
              possibleMove.row === 0 &&
              possibleMove.column === 6))))
    );
  }

  /**
   * Applies the default color scheme to the chessboard, creating the characteristic alternating square pattern.
   * Providing a visually accurate and recognizable chessboard, essential for gameplay clarity.
   */
  defaultColorScheme() {
    $("tr.odd")
      .find("td")
      .each(function (index) {
        $(this).css("background-color", index % 2 != 0 ? "grey" : "white");
        $(this).addClass(index % 2 != 0 ? "grey" : "white");
      });
    $("tr.even")
      .find("td")
      .each(function (index) {
        $(this).css("background-color", index % 2 == 0 ? "grey" : "white");
        $(this).addClass(index % 2 == 0 ? "grey" : "white");
      });
  }

  /**
   * Updates the visual representation of the chessboard in the UI based on the current state
   * of the internal game board. This involves placing chess piece images on the board according
   * to their positions in the game state and applying the default color scheme to the board.
   *
   * How It Works:
   * - The method iterates over all squares of the chessboard, represented by the `board` parameter.
   * - For each square, it checks if there is a chess piece present in the corresponding position
   *   of the game state.
   * - If a piece is present, it updates the square with an image representing that piece. If no
   *   piece is present, it ensures the square is empty.
   * - After updating the pieces, it reapplies the default chessboard colors to maintain the correct
   *   visual appearance, including special highlights like check indications.
   *
   */

  updateUIBoard(board) {
    $(".chessBoard")
      .find("td.box")
      .each(function (index) {
        const row = Math.floor(index / 8);
        const column = index % 8;
        const piece = board.getPieceAtPosition({ row, column });
        if (piece) {
          // Display the piece's image if present.
          $(this).html(`<img id="piece" src=${piece.img}>`);
        } else {
          // Clear the square if no piece is present.
          $(this).html("");
        }
      });
    this.defaultColorScheme(); // Apply the default chessboard color scheme.
    this.drawCheck(); // Highlight the king if it's in check.
  }

  /**
   * Highlights the king in check by changing the background color of its square.
   *
   * How It Works:
   * - The method scans the board for the king pieces (both black and white) to determine if they
   *   are in a state of check, which is indicated by a property in the king's object.
   * - If a king is found to be in check, the method changes the background color of the king's
   *   current square to a distinctive red color, typically red, to alert the player visually.
   *
   */

  drawCheck() {
    let self = this;
    $("tr").each(function (row) {
      $(this)
        .find("td.box")
        .each(function (column) {
          if (
            self.board.grid[row][column] !== null &&
            self.board.grid[row][column] instanceof King &&
            self.board.grid[row][column].check
          ) {
            // If the king is in check, highlight its square in red.
            $(this).css("background-color", "red");
          }
        });
    });
  }

  /**
   * Triggers the pawn promotion process by displaying selectable options for the player to choose
   * which piece to promote their pawn to upon reaching the opposite end of the board. The options
   * typically include a Queen, Rook, Bishop, or Knight, reflecting standard chess rules.
   *
   * How It Works:
   * - Based on the `turn` parameter, the method identifies the color of the pawn reaching promotion.
   * - It then generates a UI element populated with selectable icons of the pieces available for promotion to the player.
   * - Once the player selects a piece, the pawn on the board is replaced with the chosen piece, and the
   *   game state is updated to reflect this change.
   */

  pawnPromotion(turn) {
    // Define the prefix for the image file names based on the turn.
    const prefix = turn == "White" ? "w_" : "b_";
    const pieceNames = ["Knight", "Bishop", "Rook", "Queen"];
    // Empty the current promotion options and refill with the new ones.
    $(".promotionSelect").empty();
    $(".pawnPromotion")
      .find(".promotionSelect")
      .each((index, element) => {
        $(element).append(`<img src="img/${prefix}${pieceNames[index]}.png">`);
      });
  }

  /**
   * Determines if the event target is a chessboard square based on its class name.
   * @param {Event} event - The click event on the chessboard.
   * @returns {boolean} True if the event target is a chessboard square, otherwise false.
   */
  clickedOnChessboard(event) {
    return $(event.target).closest("td").hasClass("box");
  }

  /**
   * Retrieves the row and column indices from a click event on the chessboard, translating user actions into game logic.
   * Crucial for mapping user interactions to logical actions within the game, such as selecting and moving pieces.
   * @param {Event} event - The event triggered by clicking on the chessboard.
   * @returns {Object} An object containing the `row` and `column` of the clicked square.
   */
  getUIClick(event) {
    const $cell = $(event.target).closest("td");
    return {
      row: $cell.parent().index(),
      column: $cell.index(),
    };
  }

  updateTurnInfo(turn) {
    $(".turnInfo").text(`Current turn: ${turn}`);
  }

  updateGameSituationInfo(gameSituation) {
    $(".gameSituation").text(`Current Game Situation: ${gameSituation}`);
  }

  updateGameStateInfo(gameState) {
    $(".gameState").text(`Current Game State: ${gameState}`);
  }

  updateAvailableMovesInfo(availableMoves) {
    $(".pieceAvailableMove").text(
      availableMoves === 1
        ? `${availableMoves} available  piece to move`
        : `${availableMoves} available pieces to move`
    );
  }

  updateInfo(turn, gameSituation, gameState, availableMoves) {
    this.updateTurnInfo(turn);
    this.updateGameSituationInfo(gameSituation);
    this.updateGameStateInfo(gameState);
    this.updateAvailableMovesInfo(availableMoves);
  }
}
