import { Board } from "./Board.js";
import { Rules } from "./Rules.js";
import { UI } from "./Ui.js";
import { Bishop } from "./pieces/Bishop.js";
import { Knight } from "./pieces/Knight.js";
import { Rook } from "./pieces/Rook.js";
import { Queen } from "./pieces/Queen.js";

/**
 * The Game class orchestrates the chess game, managing the state, user interactions, and enforcing game rules.
 * It initializes the game board, rules, and UI, and sets up event handlers for game actions.
 */
export class Game {
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
          this.Rules.state = "Moving a piece";
        }
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
