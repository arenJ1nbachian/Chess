/**
 * The ui class is responsible for managing all user interface elements of the chess game.
 * It updates the game board, highlights possible moves, and handles pawn promotion UI.
 */
class UI {
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

/**
 * The `rules` class is responsible for enforcing the rules of the chess game, managing game states,
 * validating moves, and handling special conditions like check, checkmate, pawn promotion, and castling.
 */
class Rules {
  /**
   * Constructs the rules controller with a reference to the game board.
   * Initializes game state variables.
   * @param {Board} board - The current state of the game board.
   */
  constructor(board) {
    this.board = board; // The game board, which holds the state of the chess game.
    this.turn = "White"; // Tracks the current turn; "white" or "black".
    this.selectedPiece = null; // Holds the chess piece currently selected by the player.
    this.gameSituation = "Casual"; // Describes the game situation or mode, e.g., casual or competitive.
    this.state = "Choosing piece"; // Tracks the current state of the game, starting with choosing a piece to move.
    this.enPassantTarget = null;
    this.availableMovesBlacks = 10;
    this.availableMovesWhite = 10;
  }

  /**
   * Checks if the chess piece at the clicked square can legally be moved by the player whose turn it currently is.
   * It compares the color of the piece at the specified location with the color associated with the current turn.
   *
   * How it Works:
   * - The function receives a UI click object (uiClick) containing the row and column of the clicked square.
   * - It retrieves the chess piece, if any, at the clicked square using the board's state.
   * - The color of the piece is then compared with the current turn stored in the Rules class.
   * - If the colors match (indicating it's the player's piece), the function returns true, allowing the move process to proceed.
   * - If there's no piece or the piece belongs to the opponent (colors don't match), the function returns false, blocking the move.
   *
   * @param {Object} uiClick - Contains the row and column of the clicked square.
   * @returns {boolean} True if the piece's color matches the current player's turn; false otherwise.
   */
  validateTurn(uiClick) {
    const { row, column } = uiClick; // Destructures the row and column from the clicked square's coordinates.

    // Retrieves the chess piece at the specified row and column from the board.
    // Then, checks if a piece exists at that location and if its color matches the current player's turn.
    const check =
      this.board.grid[row][column] &&
      this.board.grid[row][column].color === this.turn
        ? true
        : false;

    // Returns true if the piece belongs to the current player and false otherwise.
    return check;
  }

  /**
   * Alternates the current player's turn and updates the game state to reflect this change, ensuring fair and sequential gameplay.
   *
   * How it Works:
   * - After a move is completed, this function is invoked to toggle the turn from White to Black, or vice versa.
   * - The current turn state is updated, and any UI components displaying the current turn are refreshed to show the new active player.
   *
   * @returns {void}
   */

  switchTurn() {
    if (this.turn === "White") {
      this.turn = "Black";
      $(".gameinfo").find("p").text(`Current turn: ${this.turn}`);
    } else {
      this.turn = "White";
      $(".gameinfo").find("p").text(`Current turn: ${this.turn}`);
    }
  }

  /**
   * Validates whether the selected move by a player is legal according to the movement rules of the selected piece.
   * It checks if the destination square is within the available moves for the piece currently being moved.
   *
   * How it Works:
   * - The function takes the destination square (uiClick) chosen by the player.
   * - It retrieves the available moves for the currently selected piece, as previously determined by the piece's movement logic.
   * - The destination square is compared against these available moves. If it matches any of them, the move is considered valid.
   * - A boolean result is returned, indicating whether the proposed move is legal (true) or not (false).
   *
   * @param {Object} uiClick - The destination square chosen by the player, containing row and column.
   * @returns {boolean} True if the move is legal according to the piece's rules; otherwise, false.
   */
  validateUiMove(uiClick) {
    const availableMoves = this.selectedPiece.availableMoves;
    let match = null;

    availableMoves.forEach((availableMove) => {
      if (JSON.stringify(uiClick) === JSON.stringify(availableMove)) {
        match = true;
        return false;
      }
    });
    return match;
  }

  /**
   * Determines if a pawn has reached the opposite end of the board and is eligible for promotion, a rule allowing a pawn
   * to be replaced with a more powerful piece (Queen, Rook, Bishop, or Knight).
   *
   * How it Works:
   * - The function checks the current position of pawns that have just moved to the last rank (row 0 for Black, row 7 for White).
   * - If a pawn belonging to the current player is found in the respective last rank, the function acknowledges that a pawn
   *   promotion is pending.
   * - It returns true to signal the game logic to trigger the pawn promotion process, enabling the player to select a new piece.
   *
   * @returns {boolean} True if a pawn is eligible for promotion; otherwise, false.
   */

  checkPawnPromotion() {
    const pawnPromotion =
      this.turn == "White" ? this.checkRowForPawn(0) : this.checkRowForPawn(7);
    return pawnPromotion ? true : false;
  }

  /**
   * Scans a specific row to find if there's a pawn eligible for promotion.
   *
   * How it Works:
   * - Targets a specific row based on the color of the pawn reaching the opposite end of the board (row 0 for Black pawns, row 7 for White pawns).
   * - Iterates through all columns of the targeted row to check for the presence of a pawn belonging to the current player.
   * - If a pawn is found in the promotion row, it is marked for promotion, and the function returns true, indicating that a promotion decision is required.
   *
   * @param {number} row - The row to be checked for a promotable pawn.
   * @returns {boolean} True if a promotable pawn is found; otherwise, false.
   */

  checkRowForPawn(row) {
    const column = 0;
    let pawnFound = null;
    for (let i = column; i <= 7; i++) {
      if (this.board.grid[row][i] instanceof Pawn) {
        pawnFound = true;
        this.pawnInPromotion = { row: row, col: i };
        break;
      }
    }
    return pawnFound == true ? true : false;
  }

  /**
   * Evaluates the board state to determine if castling is a viable option based on the positions of the king and rook(s) and the absence of threats.
   *
   * How it Works:
   * - Analyzes the board to confirm that neither the king nor the selected rook has moved, which are prerequisites for castling.
   * - Checks for any pieces between the king and the rook to ensure the path is clear.
   * - Verifies that the king is not in check and that none of the squares it would pass through are under attack.
   * - If all conditions are met, the method updates the game state to allow for castling and highlights the move as a possibility.
   *
   * @returns {boolean} True if castling is possible under the current game conditions; otherwise, false.
   */

  checkPossibleCastling() {
    const pieceMoves = this.board.getAllPiecesMoves(
      this.turn === "White" ? "Black" : "White",
      this.board
    );

    let canCastle = true; // Assume castling is possible until proven otherwise

    // Check if any move disqualifies castling

    if (pieceMoves != null) {
      for (let move of pieceMoves) {
        if (this.turn === "White") {
          if (
            (move.row === 7 && move.column > 0 && move.column < 4) ||
            (move.row === 7 && move.column > 4 && move.column < 7) ||
            this.board.wKing.check === true
          ) {
            canCastle = false;
            break; // Exit the loop since we found a move that disqualifies castling
          }
        } else {
          if (
            (move.row === 0 && move.column > 0 && move.column < 4) ||
            (move.row === 0 && move.column > 4 && move.column < 7) ||
            this.board.bKing.check === true // Assuming 'this.check' correctly indicates a check condition
          ) {
            canCastle = false;
            break; // Exit the loop since we found a move that disqualifies castling
          }
        }
      }
    }

    if (!canCastle) {
      // Properly filter the king's possible moves
      this.turn === "White"
        ? (this.board.wKing.availableMoves =
            this.board.wKing.availableMoves.filter(
              (kingMove) =>
                !(
                  kingMove.row === 7 &&
                  (kingMove.column === 2 || kingMove.column === 6)
                )
            ))
        : (this.board.bKing.availableMoves =
            this.board.bKing.availableMoves.filter(
              (kingMove) =>
                !(
                  kingMove.row === 0 &&
                  (kingMove.column === 2 || kingMove.column === 6)
                )
            ));
    } else {
      this.canCastle = true;
    }
    // Optionally, return whether castling is still possible after the check
    return canCastle;
  }

  /**
   * Verifies if either king is currently in check. It updates the game board's state based on this check.
   * @param {Board} board - The current game board.
   * @param {string} mode - Can be "actual" for affecting the game state or "virtual" for hypothetical checks.
   * @returns {string|null} The color of the team in check, or null if no check is detected.
   */

  checkMateVerify() {
    if (this.turn === "White") {
      return this.filterAllMoves() === 0;
    } else {
      return this.filterAllMoves() === 0;
    }
  }

  filterAllMoves() {
    let availableMovesBlacks = 0;
    let availableMovesWhite = 0;
    for (let i = 0; i < this.board.grid.length; i++) {
      for (let j = 0; j < this.board.grid[0].length; j++) {
        if (this.board.grid[i][j]) {
          this.filterPieceMove(
            JSON.parse(JSON.stringify(this.board.grid[i][j].availableMoves)),
            this.board.grid[i][j],
            "actual"
          );
          if (this.board.grid[i][j].availableMoves.length !== 0) {
            if (this.board.grid[i][j]?.color === "White") {
              availableMovesWhite++;
            } else if (this.board.grid[i][j]?.color === "Black") {
              availableMovesBlacks++;
            }
          }
        }
      }
    }
    this.availableMovesWhite = availableMovesWhite;
    this.availableMovesBlacks = availableMovesBlacks;
    if (this.turn === "White") {
      return availableMovesBlacks;
    } else {
      return availableMovesWhite;
    }
  }

  staleMateVerification() {
    if (
      this.filterAllMoves() === 0 &&
      (this.turn === "White"
        ? !this.board.bKing.check
        : !this.board.bKing.check)
    ) {
      this.gameSituation = "Stalemate";
      return this.gameSituation;
    } else {
      return this.gameSituation;
    }
  }

  /**
   * Filters the available moves of a specific piece based on the specified mode ('actual' or 'virtual') to
   * ensure that each move does not put the king in check (for 'actual' mode) or helps in moving the king
   * out of check (for 'virtual' mode). This function is integral to maintaining game integrity by ensuring
   * that all moves adhere to the rule that a player cannot make a move that places or leaves their king in check.
   *
   * The function operates by simulating each potential move on a clone of the current board state. This simulation
   * allows the assessment of the move's impact on the king's safety without altering the actual game state. Depending
   * on the mode:
   *
   * - 'actual' mode: The function simulates the move and checks if it would result in the king being in check. If so,
   *   the move is deemed illegal and is removed from the list of available moves.
   * - 'virtual' mode: Used when the king is already in check, the function simulates moves to determine if they can
   *   help the king escape check. Moves that do not contribute to removing the check are filtered out.
   *
   * This approach ensures that only legal moves that comply with chess rules are permitted, thereby upholding the
   * game's integrity and challenging the players to make strategic decisions under constraints.
   *
   * @param availableMoves An array containing the moves available to the selected piece before filtering.
   * @param piece The chess piece for which the moves are being filtered. This piece's available moves may be
   *              adjusted based on the function's logic to reflect only those moves that are permissible under
   *              the current game conditions.
   * @param mode The mode in which the function operates, indicating whether the king is currently in check
   *             ('virtual') or not ('actual'), which influences how the moves are filtered.
   * @return void This function does not return a value but directly modifies the availableMoves array to
   *         reflect only the moves that are permissible after considering the king's safety.
   */

  filterPieceMove(staticAvailableMoves, piece, mode) {
    let board = this.board.clone();
    const initialPosition = piece.position;
    for (const vMove of staticAvailableMoves) {
      board.movePiece(initialPosition, vMove);
      if (this.checkVerification(board, mode, piece) === piece.color) {
        staticAvailableMoves = staticAvailableMoves.filter((move) => {
          return move.row !== vMove.row || move.column !== vMove.column;
        });
      }
      board = null;
      board = this.board.clone();

      piece.availableMoves = staticAvailableMoves;
    }
    return piece.availableMoves;
  }

  /**
   * Checks for the possibility of performing an en passant capture and updates
   * the potential moves for pawns that can execute this special move.
   * This function identifies if such a scenario exists and then updates the available
   * moves for the capturing pawns accordingly.
   *
   * The function operates by first identifying a target pawn that has just moved two squares forward,
   * making it eligible to be captured via en passant. This is determined based on its color and
   * position on the board. Once the target pawn is identified, the function checks adjacent squares
   * for opponent pawns that could potentially capture it via en passant.
   *
   * If such pawns are found, their list of available moves is updated to include the en passant
   * capture move. Additionally, if there's a currently selected piece, its potential en passant
   * moves are also updated to reflect this possibility.
   */

  checkEnPassant() {
    let capturedPiece = this.enPassantTarget;
    let capturingPieces = [];
    if (capturedPiece?.color === "White") {
      if (
        this.board.grid[4][capturedPiece.position.column - 1] &&
        this.board.grid[4][capturedPiece.position.column - 1].color !=
          capturedPiece.color
      ) {
        capturingPieces.push(
          this.board.grid[4][capturedPiece.position.column - 1]
        );
      }
      if (
        this.board.grid[4][capturedPiece.position.column + 1] &&
        this.board.grid[4][capturedPiece.position.column + 1].color !=
          capturedPiece.color
      ) {
        capturingPieces.push(
          this.board.grid[4][capturedPiece.position.column + 1]
        );
      }
    } else if (capturedPiece?.color === "Black") {
      if (
        this.board.grid[3][capturedPiece.position.column - 1] &&
        this.board.grid[3][capturedPiece.position.column - 1].color !=
          capturedPiece.color
      ) {
        capturingPieces.push(
          this.board.grid[3][capturedPiece.position.column - 1]
        );
      }
      if (
        this.board.grid[3][capturedPiece.position.column + 1] &&
        this.board.grid[3][capturedPiece.position.column + 1].color !=
          capturedPiece.color
      ) {
        capturingPieces.push(
          this.board.grid[3][capturedPiece.position.column + 1]
        );
      }
    }
    if (capturingPieces.length != 0) {
      for (let i = 0; i < capturingPieces.length; i++) {
        capturingPieces[i].availableMoves.push(
          capturedPiece.color === "White"
            ? {
                row: capturedPiece.position.row + 1,
                column: capturedPiece.position.column,
              }
            : {
                row: capturedPiece.position.row - 1,
                column: capturedPiece.position.column,
              }
        );
      }
      this.selectedPiece.enPassantMoves =
        capturedPiece.color === "White"
          ? {
              row: capturedPiece.position.row + 1,
              column: capturedPiece.position.column,
            }
          : {
              row: capturedPiece.position.row - 1,
              column: capturedPiece.position.column,
            };
    }
  }

  /**
   * Evaluates the chess board to determine if either king is in check based on the current positions
   * and potential moves of all pieces. It updates the game state to reflect whether the white or black
   * king is under threat (in check) and can return information on which team is currently threatening the opponent's king.
   *
   * The function operates in two main stages:
   * 1. Calculation of all possible moves for both white and black pieces on the board,
   *    considering the current layout and state of the game.
   *
   * 2. Determination of whether any of these moves place the opposing team's king in check,
   *    specifically looking at the positions of the white and black kings and comparing them
   *    against the calculated moves.
   *
   * The check is performed differently based on the 'mode' parameter, which dictates whether the
   * function should update the game state ('actual' mode) or merely perform a check without altering
   * the state.
   *
   * @param {Object} board The current state of the chess board, including all pieces and their positions.
   * @param {String} mode The mode of verification, 'actual' for state-updating checks or another value for passive checks.
   * @param {Object} piece Optional. The specific piece to consider for the check verification. If provided, the function
   *                        might limit its evaluation to the effects of this piece; otherwise, it evaluates all pieces.
   * @return {String|undefined} Returns the color of the team putting the king in check ('White' or 'Black'), or undefined if no check is detected.
   */

  checkVerification(board, mode, piece) {
    piece = piece || undefined;
    const pieceMovesWhites = board.getAllPiecesMoves("White", board);
    const pieceMovesBlacks = board.getAllPiecesMoves("Black", board);

    let checkTeam = null;

    let checkVerifyForBlackTeam = (board) => {
      for (let move of pieceMovesWhites) {
        if (
          move.row === board.bKing.position.row &&
          move.column === board.bKing.position.column
        ) {
          if (mode === "actual") {
            board.bKing.check = true;
          }
          return "Black";
        } else {
          board.bKing.check = false;
        }
      }
    };

    let checkVerifyForWhiteTeam = (board) => {
      for (let move of pieceMovesBlacks) {
        if (
          move.row === board.wKing.position.row &&
          move.column === board.wKing.position.column
        ) {
          if (mode === "actual") {
            board.wKing.check = true;
          }
          return "White";
        } else {
          board.wKing.check = false;
        }
      }
    };

    if (piece !== null && piece?.color === "White") {
      if (checkVerifyForWhiteTeam(board) === "White") {
        return "White";
      } else if (checkVerifyForBlackTeam(board) === "Black") {
        return "Black";
      } else {
        return undefined;
      }
    } else if (piece !== null && piece?.color === "Black") {
      if (checkVerifyForBlackTeam(board) === "Black") {
        return "Black";
      } else if (checkVerifyForWhiteTeam(board) === "White") {
        return "White";
      } else {
        return undefined;
      }
    }
  }

  /**
   * Filters the available moves for a piece to ensure the king's safety. This function plays a critical
   * role in maintaining the rules of chess that prohibit a player from making a move that would
   * leave their king in check or move into check. It operates under two main scenarios:
   *
   * 1. When the king is already in check: In this scenario, the function filters the moves to ensure
   *    that the selected piece's actions contribute to moving the king out of check. It simulates
   *    each available move using a cloned board state to determine if the move would resolve the
   *    check situation. If no moves are available that would achieve this, it alerts the player to
   *    choose a piece that can defend the king, and the move is not processed.
   *
   * 2. When the king is not in check: Here, the function aims to prevent moves that would put the
   *    king in check. It again simulates the moves on a cloned board to check if any of the available
   *    moves would result in the king being in check. If a move is found to endanger the king, it is
   *    removed from the list of available moves.
   *
   * This function integrates with the board and piece classes, relying on a cloned version of
   * the current board state to test move outcomes without affecting the actual game state. It uses
   * the `filterPieceMove` method, which takes the piece, the move list, and the context ('actual' or
   * 'virtual') to process the moves appropriately.
   *
   * @param availableMoves An array of possible moves for the selected piece, to be filtered for safety.
   * @param piece The piece for which the available moves are being considered.
   * @return boolean Returns true if there are any legal moves available after filtering for the king's safety,
   *         or false if no such moves exist.
   */

  filterMovesForKingSafety(availableMoves, piece) {
    let staticAvailableMoves = JSON.parse(JSON.stringify(availableMoves));
    let boardClone = this.board.clone();
    console.log("Checking is any king is in check");
    if (this.board.bKing.check || this.board.wKing.check) {
      // This is to filter the selected piece's moves while the king is in check, to favor the king's defense by simulation of movement from a clone of the board class
      this.filterPieceMove(staticAvailableMoves, piece, "virtual");
      if (this.selectedPiece.availableMoves.length !== 0) {
        return true;
      } else {
        this.state = "Choosing piece";
        return false;
      }
    } else {
      console.log("Result: No king is in check");
      // This is to filter moves that will put the king in check.
      console.log(
        "For every available moves of the selected piece check if that move put it's own king in check"
      );

      this.filterPieceMove(staticAvailableMoves, piece, "actual");

      if (this.selectedPiece.availableMoves.length !== 0) {
        console.log("Result: Some or no moves have been filtered! \n");
        return true;
      } else {
        console.log(
          "Result: Zero moves are available for this piece as it puts the king into check! \n"
        );

        this.state = "Choosing piece";
        return false;
      }
    }
  }
}

/**
 * The Game class orchestrates the chess game, managing the state, user interactions, and enforcing game rules.
 * It initializes the game board, rules, and UI, and sets up event handlers for game actions.
 */
class Game {
  constructor() {
    this.board = new Board(); // The game board, representing the chessboard state.
    this.Rules = new Rules(this.board); // Initializes game rules, including turn validation and move legality.
    this.UI = new UI(this.board); // Sets up the user interface, handling the display and updates of the board.
    this.bindEventListeners();
  }

  bindEventListeners() {
    $("table").on("click", "td", (event) => this.handleSquareClick(event));
    $(document).keydown((event) => this.handleKeyPress(event));
  }

  handleSquareClick(event) {
    const uiClick = this.UI.getUIClick(event);
    console.log(
      `Position of the clicked piece: (${uiClick.column + 1} ${
        uiClick.row + 1
      })`
    );

    switch (this.Rules.state) {
      case "Choosing piece":
        this.choosePiece(uiClick, event);

        this.Rules.checkPossibleCastling();
        this.UI.updateInfo(
          this.Rules.turn,
          this.Rules.gameSituation,
          this.Rules.state,
          this.Rules.turn === "White"
            ? this.Rules.availableMovesWhite
            : this.Rules.availableMovesBlacks
        );
        break;
      case "Moving a piece":
        this.movePiece(uiClick);
        this.UI.updateInfo(
          this.Rules.turn,
          this.Rules.gameSituation,
          this.Rules.state,
          this.Rules.turn === "White"
            ? this.Rules.availableMovesWhite
            : this.Rules.availableMovesBlacks
        );
        break;
      case "Pawn promotion":
        this.handlePawnPromotion(event);
        this.UI.updateInfo(
          this.Rules.turn,
          this.Rules.gameSituation,
          this.Rules.state,
          this.Rules.turn === "White"
            ? this.Rules.availableMovesWhite
            : this.Rules.availableMovesBlacks
        );
        break;
    }
  }

  choosePiece(uiClick, event) {
    if (this.Rules.validateTurn(uiClick)) {
      console.log("Result: Piece belongs to the player! \n");
      // Validates that the piece at the clicked square can be moved by the current player.
      const clickedPiece = this.board.getPieceAtPosition(uiClick); // Retrieves the clicked piece within the board.
      console.log("Checking if the piece contains possible moves...");
      if (clickedPiece.possibleMoves(this.board).length !== 0) {
        console.log(
          `Result: Piece contains ${
            clickedPiece.possibleMoves(this.board).length
          } possible moves! \n`
        );
        this.Rules.selectedPiece = clickedPiece; // Stores the selected piece for moving.
        this.UI.selectedPiece = clickedPiece;
        this.UI.selectedUIPiece = $(event.target).closest("td");

        console.log("Changing the state of the game to Moving a Piece\n");
        // Changes the game state to moving a selected piece.

        console.log(
          "Checking if any possible moves puts the king into check. (In order for those moves to be deleted!!!)"
        );
        if (
          this.Rules.filterMovesForKingSafety(
            clickedPiece.availableMoves,
            clickedPiece
          )
        ) {
          console.log(
            "Highlighting selection with it's available moves from the ui perspective"
          );
          this.Rules.checkEnPassant();
          this.Rules.enPassantTarget = null;
          this.UI.possibleUISelections(
            clickedPiece.availableMoves,
            "add" // Highlights possible moves for the piece.
          );
        }
        this.Rules.state = "Moving a piece";
      }
    }
  }

  handlePawnPromotion(event) {
    // Find the clicked image within the closest td
    const $img = $(event.target).closest("td.promotionSelect").find("img");

    // Get the 'src' attribute of the clicked image
    const imgSrc = $img.attr("src");

    let pieceConvertion = null;

    if (imgSrc.includes("Knight")) {
      pieceConvertion = new Knight(
        this.Rules.turn,
        this.Rules.selectedPiece.position,
        `${imgSrc}`
      );
    } else if (imgSrc.includes("Queen")) {
      pieceConvertion = new Queen(
        this.Rules.turn,
        this.Rules.selectedPiece.position,
        imgSrc
      );
    } else if (imgSrc.includes("Rook")) {
      pieceConvertion = new Rook(
        this.Rules.turn,
        this.Rules.selectedPiece.position,
        imgSrc
      );
    } else if (imgSrc.includes("Bishop")) {
      pieceConvertion = new Bishop(
        this.Rules.turn,
        this.Rules.selectedPiece.position,
        imgSrc
      );
    }

    // Use the 'src' to find the first matching image in a 'td' with class 'box'

    this.board.grid[this.Rules.pawnInPromotion.row][
      this.Rules.pawnInPromotion.col
    ] = pieceConvertion;
    pieceConvertion.possibleMoves(this.Rules.board);
    this.Rules.checkVerification(this.board, "actual", pieceConvertion);
    if (
      this.Rules.checkVerification(
        this.board,
        "actual",
        this.Rules.selectedPiece
      ) !== undefined
    ) {
      console.log(
        "Result: Check detected, changing the gameSituation to Check!"
      );
      this.gameSituation = "Check";
      if (this.Rules.checkMateVerify()) {
        this.Rules.gameSituation = "CHECKMATE";
        console.log("GAME STOPPED: CHECKMATE");
        $("table").off("click", "td");
      }
    } else {
      console.log("Result: No Check detected! \n");
      this.gameSituation = "Casual";
    }
    if (this.Rules.staleMateVerification() === "Stalemate") {
      console.log("GAME STOPPED: STALEMATE");
      $("table").off("click", "td");
    }
    this.Rules.switchTurn();
    this.Rules.state = "Choosing piece";

    this.UI.updateUIBoard(this.board);
    $(".pawnPromotion").css("display", "none");
    $(".chessBoard").css("display", "table");
    $(".chessBoard").css("opacity", "1");
  }

  movePiece(uiClick) {
    if (this.Rules.validateUiMove(uiClick)) {
      console.log("Result: True\n");
      // Validates the move for the selected piece.
      console.log(
        `Moving the selected piece to: (${uiClick.column + 1} ${
          uiClick.row + 1
        }) \n `
      );
      this.board.movePiece(this.Rules.selectedPiece.position, uiClick); // Moves the piece on the board.
      if (
        this.Rules.checkVerification(
          this.board,
          "actual",
          this.Rules.selectedPiece
        ) !== undefined
      ) {
        console.log(
          "Result: Check detected, changing the gameSituation to Check!"
        );
        this.Rules.gameSituation = "Check";
        if (this.Rules.checkMateVerify()) {
          this.Rules.gameSituation = "CHECKMATE";
          this.UI.updateInfo(
            this.Rules.turn,
            this.Rules.gameSituation,
            this.Rules.state,
            this.Rules.turn === "White"
              ? this.Rules.availableMovesWhite
              : this.Rules.availableMovesBlacks
          );
          console.log("GAME STOPPED: CHECKMATE");
          $("table").off("click", "td");
        }
      } else {
        console.log("Result: No Check detected! \n");
        this.gameSituation = "Casual";
        this.UI.updateInfo(
          this.Rules.turn,
          this.Rules.gameSituation,
          this.Rules.state,
          this.Rules.turn === "White"
            ? this.Rules.availableMovesWhite
            : this.Rules.availableMovesBlacks
        );
      }
      if (this.Rules.staleMateVerification() === "Stalemate") {
        this.UI.updateInfo(
          this.Rules.turn,
          this.Rules.gameSituation,
          this.Rules.state,
          this.Rules.turn === "White"
            ? this.Rules.availableMovesWhite
            : this.Rules.availableMovesBlacks
        );
        console.log("GAME STOPPED: STALEMATE");
        $("table").off("click", "td");
      }

      if (
        JSON.stringify(this.Rules.selectedPiece?.previousCoordinate) ===
          (this.Rules.selectedPiece.color === "White"
            ? `{"row":6,"column":${this.Rules.selectedPiece.position.column}}`
            : `{"row":1,"column":${this.Rules.selectedPiece.position.column}}`) &&
        (this.Rules.selectedPiece.color === "White"
          ? this.Rules.selectedPiece.position.row === 4
          : this.Rules.selectedPiece.position.row === 3)
      ) {
        this.Rules.enPassantTarget = this.Rules.selectedPiece;
        this.Rules.checkEnPassant();
      }

      if (this.Rules.checkPawnPromotion()) {
        this.UI.pawnPromotion(this.Rules.turn);
        this.Rules.state = "Pawn promotion";
        $(".chessBoard").animate({ opacity: 0 }, "slow", function () {
          // This function is called after the animation completes
          $(this).css("display", "none");
          // Now that the chessBoard is hidden, display the pawnPromotion

          $(".pawnPromotion").css("display", "table");
          $(".pawnPromotion").animate({ opacity: 1 }, "slow");
        });
      } else {
        this.Rules.state = "Choosing piece";
        // Switches the turn to the other player.
        this.Rules.switchTurn();
      }

      this.UI.updateUIBoard(this.board); // Updates the UI to reflect the new board state.
    } else {
      console.log("Result: False, alerting the user!");
    }
  }

  handleKeyPress(event) {
    if (
      event.key === "Escape" &&
      this.Rules.selectedPiece &&
      this.Rules.state === "Moving a piece" &&
      this.Rules.gameSituation !== "CHECKMATE"
    ) {
      console.log(
        `Escape Key pressed! Deselecting ${this.Rules.selectedPiece.constructor.name}`
      );
      this.Rules.state = "Choosing piece";
      this.UI.possibleUISelections(
        this.Rules.selectedPiece.availableMoves,
        "remove"
      );
      this.UI.drawCheck();
      this.Rules.selectedPiece = null;
      this.UI.selectedPiece = null;
      this.UI.selectedUIPiece = null;
      this.UI.updateInfo(
        this.Rules.turn,
        this.Rules.gameSituation,
        this.Rules.state,
        this.Rules.turn === "White"
          ? this.Rules.availableMovesWhite
          : this.Rules.availableMovesBlacks
      );
    }
  }
}

// Base class for all chess pieces, defining common properties and enforcing implementation of movement logic in subclasses.
class ChessPiece {
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

class Pawn extends ChessPiece {
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

class Rook extends ChessPiece {
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

class Knight extends ChessPiece {
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

class Bishop extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.availableMoves = [];
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    // Diagonal movements
    let moves = [];
    const directions = [
      { row: -1, column: -1 }, // Northwest  Diagonal
      { row: -1, column: 1 }, // Northeast  Diagonal
      { row: 1, column: -1 }, // Southwest  Diagonal
      { row: 1, column: 1 }, //  Southeast  Diagonal
    ];

    directions.forEach((direction) => {
      // Calculate the new position based on the current position and the direction of movement of a bishop
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

class Queen extends ChessPiece {
  constructor(color, position, img) {
    super(color, position, img);
    this.availableMoves = [];
  }

  possibleMoves(board) {
    this.availableMoves.length = 0;
    // Diagonal movements and Horizontal/Vertical movement
    let moves = [];
    const directions = [
      { row: -1, column: -1 }, //  Northwest  Diagonal
      { row: -1, column: 1 }, //  Northeast  Diagonal
      { row: 1, column: -1 }, //  Southwest  Diagonal
      { row: 1, column: 1 }, //  Southeast  Diagonal
      { row: -1, column: 0 }, //  Up
      { row: 1, column: 0 }, //  Down
      { row: 0, column: -1 }, //  Left
      { row: 0, column: 1 }, //  Right
    ];

    directions.forEach((direction) => {
      // Calculate the new position based on the current position and the direction of movement of a queen
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
          // After encountering any piece, break out of the loop since the Queen cannot move past it
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

class King extends ChessPiece {
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
class Board {
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

let chessGame = new Game();
