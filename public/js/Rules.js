import { Pawn } from "./pieces/Pawn.js";

/**
 * The `rules` class is responsible for enforcing the rules of the chess game, managing game states,
 * validating moves, and handling special conditions like check, checkmate, pawn promotion, and castling.
 */
export class Rules {
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
