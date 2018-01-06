import React, {Component} from 'react';
import './Board.css';
import squares from './square.json';
import piecesOne from './piecesOne.json';
import piecesTwo from './piecesTwo.json';

class Board extends Component {
	//constructor for the entire board, all pieces, and variables needed to manage movements on board
	constructor() {
		super() 
			this.state = {
				squares,
				piecesOne,
				piecesTwo
			}
			this.squareToMoveTo = "";
			this.pieceToMove = "";
			this.pieceSelected = false;
			this.playerOneTurn = true;
	}

	//this is implemented on the playerOne "onClick" function in return/render statement
	findMovesOne = (id) => {
		// playerOneTurn must be true before it will run any other code to move that piece
		if(this.playerOneTurn){
			//filters the current list of piecesOne to find the one that was selected and sets it a variable which will be used to know which piece will move
			let thisPiece = this.state.piecesOne.filter(piece => piece.id === id);
			//filter returns an array (in this case with only one element) so we select it as the full element to use the attribute at a later time throughout other functions
			this.pieceToMove = thisPiece[0]
			//a piece must be selected prior to being able to click on square to move to that square so this sets it to true
			this.pieceSelected = true;
			//if the piece is not a king this will run the regular check for Jump function
			if(!this.pieceToMove.king){
				this.checkForJumpPlayerOne(this.pieceToMove);
			}
			//if the piece is a king this will run the check for Jump KING function
			if(this.pieceToMove.king){
				this.checkForJumpKING(this.pieceToMove);
			}
		}
	}

	//this is implemented on the playerTwo "onClick" function in return/render statement
	findMovesTwo = (id) => {
		//if it is not playerOneTurn, it must be playerTwo turn so the rest of this code can run
		if(!this.playerOneTurn){
			//filters current list of piecesTwo to find the one selected and sets it to a variable which will be used to know which piece to move
			let thisPiece = this.state.piecesTwo.filter(piece => piece.id === id);
			//filter returns an array (of 1) so we select the full element to be able to compare attributes at a later time throughout other functions
			this.pieceToMove = thisPiece[0]
			//sets piece selected to true to the next call on move to square will be allowed to progress
			this.pieceSelected = true;
			//if the piece is not a king this will run the regular check for Jump function
			if(!this.pieceToMove.king){
				this.checkForJumpPlayerTwo(this.pieceToMove);
			}
			//if the piece is a king this will run the check for Jump KING function
			if(this.pieceToMove.king){
				this.checkForJumpKING(this.pieceToMove);
			}		
		}
	}

	//this is tied to the square in the return/render function "onClick" function below
	getSquare = (id) => {
		//filters the square selected from the current state of squares
		let thisSquare = this.state.squares.filter(square => square.id === id);
		console.log(thisSquare);
		//filter returns an array (of 1) so we select the first item
		this.squareToMoveTo = thisSquare[0];
		//from our findMoves functions above a piece must be selected before it can be moved to a square
		if(this.pieceSelected){
			//function to move to the selected square after a piece was selected
			this.moveSquare();
		}
		
	}

	//this function is called from the getSqaure() function if a piece is actually selected
	moveSquare = () => {
		//if the function checkMove returns true we update the position of the piece to the position of the square which was selected
		//checkMove is passed the full object of the piece we wish to move and the full object of the square we wish to move it to
		if(this.checkMove(this.pieceToMove, this.squareToMoveTo)){
			//if this is true we set the position of the piece selected to the position of square selected
			this.pieceToMove.position = this.squareToMoveTo.position

			//if the piece belongs to player 1 and reaches the bottom row it will be made king piece
			if(this.pieceToMove.position.top === 330 && this.pieceToMove.player === 1){
				this.makeKing(this.pieceToMove);
			}	
			//if the piece belongs to player 2 and reaches the top row it will be made king piece
			if(this.pieceToMove.position.top === 8 && this.pieceToMove.player === 2){
				this.makeKing(this.pieceToMove);
			}
			//sets it back to no piece selected and a piece must be selected before moveSquare can be called
			this.pieceSelected = false;			
			//set the state of the pieces of sqaures to the updated positions
			this.setState({});

		}
	}	

	//this function is called from the moveSquare() function to check validity of the movement(s)
	//important to note that all rows are 46 pixels in height and all columns are 46 pixels in width
	//moves more than 46 pixels high or 46 pixels wide will not be allowed (unless a jump function is called)
	checkMove = (player, square) => {
		//topCheck is variable finding the difference between the position of the piece selected and the square selected
		//for player 1, since they are moving down 46px top check will need to be negative, for player 2, positive (this is seen in the if statements below)
		let topCheck = player.position.top - square.position.top;
		//this runs a different if statement for player 1 to make sure they cannot move more than one row down or one column to the left or right
		if(player.player === 1 && player.king === false){
			if( (topCheck === -46) && (Math.abs(square.position.left - player.position.left)<47) ){
				this.playerOneTurn = false;
				return true;
			}
		}

		//this runs a different if statement for player 2 to make sure they cannot move more than one row up or one column to the left or right
		if(player.player === 2 && player.king === false){
			if( (topCheck === 46) && (Math.abs(square.position.left - player.position.left)<47) ){
				this.playerOneTurn = true;
				return true;
			}
		}

		//these if statements are for when the player is king and can move backwards or forwards
		//topCheck is run through Math.abs because it does not matter if moves up or down on the grid
		if(player.player === 1 && player.king === true){
			if( (Math.abs(topCheck)===46) && (Math.abs(square.position.left - player.position.left)<47) ){
				//at the end of the move make sure it turns back to player 2 turn
				this.playerOneTurn = false;
				return true;
			}
		}

		if(player.player === 2 && player.king === true){
			if( (Math.abs(topCheck)===46) && (Math.abs(square.position.left - player.position.left)<47) ){
				//at the end of the move make sure it turns back to player 1 turn
				this.playerOneTurn = true;
				return true;
			}
		}		

	}//end the checkMove function

	//function will be for checking if an opponent piece is adjoining square to jump
	//this function is called from the findMovesOne function 
	checkForJumpPlayerOne = (pieceToCheck) => {
		//this should be a square down and to the left of the current selected piece
		let adjoiningSquareOne = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//this should be a square down and to the right of the current selected piece
		let adjoiningSquareTwo = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//check to see if the square down and to the left of selected piece has a player two piece in the square by filtering by those coordinates
		let fullAdjoiningSquareCheckDownLeft = this.state.piecesTwo.filter(piece => 
			piece.position.left === adjoiningSquareOne.position.left 
			&& piece.position.top === adjoiningSquareOne.position.top);
		
		//check to see if the square down and to the right of selected piece has a player two piece in the square byt filtering by those coordinates
		let fullAdjoiningSquareCheckDownRight = this.state.piecesTwo.filter(piece =>
			piece.position.left === adjoiningSquareTwo.position.left 
			&& piece.position.top === adjoiningSquareTwo.position.top);
		
		//if there is a piece down and to the left of selected piece we need to check the square behind that square and see if there is any pieces there
		//openSquareToJump is the square that we will use to filter for player one pieces or player two pieces with the same coordinates
		if(fullAdjoiningSquareCheckDownLeft.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;

			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top < 331 && openSquareToJump.position.left > 7){
				//moves the piece to the open square position
				pieceToCheck.position = openSquareToJump.position;
				//removes the class of the piece which was jumped and moves its location to get it off the board
				fullAdjoiningSquareCheckDownLeft[0].class = "newClass";
				fullAdjoiningSquareCheckDownLeft[0].position = {top: 1000, left: 1000};
				//when the piece lands on the bottom row it should be made a king piece
				if(pieceToCheck.position.top === 330){
					this.makeKing(pieceToCheck);
				}		
				//checks to see if there are any other jumps to make, if not it should be player Two turn
				this.areThereJumpsLeftForPlayerOne(pieceToCheck);		
				this.setState({});
			}
		}			
		//if there is a piece down and to the right the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckDownRight.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;

			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top < 331 && openSquareToJump.position.left < 331){
				//moves the piece to the open square position
				pieceToCheck.position = openSquareToJump.position;
				//removes the class of the piece which was jumped and moves its location to get it off the board
				fullAdjoiningSquareCheckDownRight[0].class = "newClass";
				fullAdjoiningSquareCheckDownRight[0].position = {top: 1000, left: 1000};
				//when the piece lands on the bottom row it should be made a king piece
				if(pieceToCheck.position.top === 330){
					this.makeKing(pieceToCheck);
				}
				//checks to see if there are any other jumps to make, if not it should be player Two turn
				this.areThereJumpsLeftForPlayerOne(pieceToCheck);
				this.setState({});
			}
		}

	}

	checkForJumpPlayerTwo = (pieceToCheck) => {
		//this should be a square up and to the left of the current selected piece
		let adjoiningSquareThree = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top - 46
			}
		}
		//this should be a square up and to the right of the current selected piece
		let adjoiningSquareFour = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top - 46
			}
		}
		//check to see if the square up and to the left of selected piece has a player one piece in the square
		let fullAdjoiningSquareCheckUpLeft = this.state.piecesOne.filter(piece => 
			piece.position.left === adjoiningSquareThree.position.left 
			&& piece.position.top === adjoiningSquareThree.position.top);

		//check to see if the square up and to the right of selected piece has a player one piece in the square
		let fullAdjoiningSquareCheckUpRight = this.state.piecesOne.filter(piece =>
			piece.position.left === adjoiningSquareFour.position.left 
			&& piece.position.top === adjoiningSquareFour.position.top);

		//if there is a piece up and to the left, the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckUpLeft.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump by looking for a pieceOne with that position
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top > 7 && openSquareToJump.position.left > 7){
				pieceToCheck.position = openSquareToJump.position;
				fullAdjoiningSquareCheckUpLeft[0].class = "newClass";
				fullAdjoiningSquareCheckUpLeft[0].position = {top: 1000, left: 1000};
				if(pieceToCheck.position.top === 8){
					this.makeKing(pieceToCheck);
				}				
				this.areThereJumpsLeftForPlayerTwo(pieceToCheck);	
				this.setState({});
				
			}
		}			

		//if there is a piece up and to the right, the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckUpRight.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top > 7 && openSquareToJump.position.left < 331){
				pieceToCheck.position = openSquareToJump.position;
				fullAdjoiningSquareCheckUpRight[0].class = "newClass";
				fullAdjoiningSquareCheckUpRight[0].position = {top: 1000, left: 1000};				
				if(pieceToCheck.position.top === 8){
					this.makeKing(pieceToCheck);
				}
				this.areThereJumpsLeftForPlayerTwo(pieceToCheck);
				this.setState({});
				
			}			
		}
	}

	checkForJumpKING = (pieceToCheck) => {	
		//this should be a square down and to the left of the current selected piece
		let adjoiningSquareOne = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//this should be a square down and to the right of the current selected piece
		let adjoiningSquareTwo = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//this should be a square up and to the left of the current selected piece
		let adjoiningSquareThree = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top - 46
			}
		}
		//this should be a square up and to the right of the current selected piece
		let adjoiningSquareFour = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top - 46
			}
		}
		//declaring these here for scope reasons, the if player1 and if player2 will set these for comparisons
		let fullAdjoiningSquareCheckDownLeft
		let fullAdjoiningSquareCheckDownRight
		let fullAdjoiningSquareCheckUpLeft
		let fullAdjoiningSquareCheckUpRight

		if(pieceToCheck.player === 1){
			//check to see if the square down and to the left of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownLeft = this.state.piecesTwo.filter(piece => 
				piece.position.left === adjoiningSquareOne.position.left 
				&& piece.position.top === adjoiningSquareOne.position.top);
			//check to see if the square down and to the right of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownRight = this.state.piecesTwo.filter(piece =>
				piece.position.left === adjoiningSquareTwo.position.left 
				&& piece.position.top === adjoiningSquareTwo.position.top);
			//check to see if the square up and to the left of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckUpLeft = this.state.piecesTwo.filter(piece => 
				piece.position.left === adjoiningSquareThree.position.left 
				&& piece.position.top === adjoiningSquareThree.position.top);
			//check to see if the square up and to the right of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckUpRight = this.state.piecesTwo.filter(piece =>
				piece.position.left === adjoiningSquareFour.position.left 
				&& piece.position.top === adjoiningSquareFour.position.top);

		}	

		if(pieceToCheck.player === 2){
			//check to see if the square down and to the left of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckDownLeft = this.state.piecesOne.filter(piece => 
				piece.position.left === adjoiningSquareOne.position.left 
				&& piece.position.top === adjoiningSquareOne.position.top);
			//check to see if the square down and to the right of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckDownRight = this.state.piecesOne.filter(piece =>
				piece.position.left === adjoiningSquareTwo.position.left 
				&& piece.position.top === adjoiningSquareTwo.position.top);
			//check to see if the square up and to the left of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpLeft = this.state.piecesOne.filter(piece => 
				piece.position.left === adjoiningSquareThree.position.left 
				&& piece.position.top === adjoiningSquareThree.position.top);
			//check to see if the square up and to the right of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpRight = this.state.piecesOne.filter(piece =>
				piece.position.left === adjoiningSquareFour.position.left 
				&& piece.position.top === adjoiningSquareFour.position.top);

		}			
	
				
		//if there is a piece down and to the left the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckDownLeft.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top < 331 && openSquareToJump.position.left > 7){
				pieceToCheck.position = openSquareToJump.position;
				fullAdjoiningSquareCheckDownLeft[0].class = "newClass";
				fullAdjoiningSquareCheckDownLeft[0].position = {top: 1000, left: 1000};					
				this.setState({});
			}
		}			

		//if there is a piece down and to the right the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckDownRight.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top < 331 && openSquareToJump.position.left < 331){
				fullAdjoiningSquareCheckDownRight[0].class = "newClass";
				fullAdjoiningSquareCheckDownRight[0].position = {top: 1000, left: 1000};
				pieceToCheck.position = openSquareToJump.position;
				this.setState({});
			}
		}			

		//if there is a piece up and to the left the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckUpLeft.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump by looking for a pieceOne with that position
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top > 7 && openSquareToJump.position.left > 7){
				pieceToCheck.position = openSquareToJump.position;
				fullAdjoiningSquareCheckUpLeft[0].class = "newClass";
				fullAdjoiningSquareCheckUpLeft[0].position = {top: 1000, left: 1000};					
				this.setState({});
				
			}
		}			

		else if(fullAdjoiningSquareCheckUpRight.length === 1){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(anyPieceInSquare === 0 && openSquareToJump.position.top > 7 && openSquareToJump.position.left < 331){
				pieceToCheck.position = openSquareToJump.position;
				fullAdjoiningSquareCheckUpRight[0].class = "newClass";
				fullAdjoiningSquareCheckUpRight[0].position = {top: 1000, left: 1000};
				this.setState({});
				
			}			
		}
	}

	//called from the checkJumpPlayerXX function and moveSquare function
	//adds a different style and sets the king property
	makeKing = (piece) => {
		if(piece.player === 1){
			piece.class = "piece playerOne king";
			piece.king = true;
			this.setState({});
		}	
		if(piece.player === 2){
			piece.class = "piece playerTwo king";
			piece.king = true;
			this.setState({});
		}	

	}

	//function is called on the checkForJumpsPlayerOne 
	//after the jump is complete we want to see if there are any other possible jumps, if not it should go to the other player
	//code will look very similar to to the checkForJumps function but the if statements will determine who's turn it is
	areThereJumpsLeftForPlayerOne = (piece) => {
		//this should be a square down and to the left of the current selected piece
		let adjoiningSquareOne = {
			position: {
				left: piece.position.left - 46,
				top: piece.position.top + 46
			}
		}
		//this should be a square down and to the right of the current selected piece
		let adjoiningSquareTwo = {
			position: {
				left: piece.position.left + 46,
				top: piece.position.top + 46
			}
		}
		//check to see if the square down and to the left of selected piece has a player two piece in the square
		let fullAdjoiningSquareCheckDownLeft = this.state.piecesTwo.filter(piece => 
			piece.position.left === adjoiningSquareOne.position.left 
			&& piece.position.top === adjoiningSquareOne.position.top);
		//check to see if the square down and to the right of selected piece has a player two piece in the square
		let fullAdjoiningSquareCheckDownRight = this.state.piecesTwo.filter(piece =>
			piece.position.left === adjoiningSquareTwo.position.left 
			&& piece.position.top === adjoiningSquareTwo.position.top);
		//if neither of the squares have a piece, the array will return 0, if both squares are blank it is the other player's turn
		if(fullAdjoiningSquareCheckDownLeft.length === 0 && fullAdjoiningSquareCheckDownRight.length === 0){
			this.playerOneTurn = false;
			this.pieceSelected = false;
			this.setState({});
		}
		//if there is a piece down and to the left the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckDownLeft.length === 1 || fullAdjoiningSquareCheckDownLeft.length === 0){
			let openSquareToJump = {
				position: {
					left: piece.position.left - 92,
					top: piece.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;			

			//if one of the filters has a piece in it the array will be greater than 0 and the move will go to player 2 
			if(fullAdjoiningSquareCheckDownLeft.length === 1 && anyPieceInSquare > 0){
				this.playerOneTurn = false;
				this.pieceSelected = false;	
				this.setState({});
			}
			if(fullAdjoiningSquareCheckDownLeft.length === 0 && anyPieceInSquare >= 0){
				this.playerOneTurn = false;
				this.pieceSelected = false;	
				this.setState({});
			}			
		}			
		//if there is a piece down and to the right the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckDownRight.length === 1 || fullAdjoiningSquareCheckDownRight.length === 0){
			let openSquareToJump = {
				position: {
					left: piece.position.left + 92,
					top: piece.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;			

			//if one of the filters has a piece in it the array will be greater than 0 and the move will go to player 2 
			if(fullAdjoiningSquareCheckDownRight.length === 1 && anyPieceInSquare > 0){
				this.playerOneTurn = false;
				this.pieceSelected = false;	
				this.setState({});
			}
			if(fullAdjoiningSquareCheckDownRight.length === 0 && anyPieceInSquare >= 0){
				this.playerOneTurn = false;
				this.pieceSelected = false;	
				this.setState({});
			}	
		}
	
	}

	areThereJumpsLeftForPlayerTwo = (piece) => {
		//this should be a square down and to the left of the current selected piece
		let adjoiningSquareThree = {
			position: {
				left: piece.position.left - 46,
				top: piece.position.top - 46
			}
		}
		//this should be a square down and to the right of the current selected piece
		let adjoiningSquareFour = {
			position: {
				left: piece.position.left + 46,
				top: piece.position.top - 46
			}
		}
		//check to see if the square down and to the left of selected piece has a player two piece in the square
		let fullAdjoiningSquareCheckUpLeft = this.state.piecesOne.filter(piece => 
			piece.position.left === adjoiningSquareThree.position.left 
			&& piece.position.top === adjoiningSquareThree.position.top);
		//check to see if the square down and to the right of selected piece has a player two piece in the square
		let fullAdjoiningSquareCheckUpRight = this.state.piecesOne.filter(piece =>
			piece.position.left === adjoiningSquareFour.position.left 
			&& piece.position.top === adjoiningSquareFour.position.top);
		if(fullAdjoiningSquareCheckUpLeft.length === 0 && fullAdjoiningSquareCheckUpRight.length === 0){
			this.playerOneTurn = true;
			this.pieceSelected = false;
			this.setState({});
		}
		//if there is a piece down and to the left the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckUpLeft.length === 1 || fullAdjoiningSquareCheckUpLeft.length === 0){
			let openSquareToJump = {
				position: {
					left: piece.position.left - 92,
					top: piece.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;			

			//if one of the filters has a piece in it the array will be greater than 0 and the move will go to player 2 
			if(fullAdjoiningSquareCheckUpLeft.length === 1 && anyPieceInSquare > 0){
				this.playerOneTurn = true;
				this.pieceSelected = false;	
				this.setState({});
			}
			if(fullAdjoiningSquareCheckUpLeft.length === 0 && anyPieceInSquare >= 0){
				this.playerOneTurn = true;
				this.pieceSelected = false;	
				this.setState({});
			}	
		}			
		//if there is a piece down and to the right the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckUpRight.length === 1 || fullAdjoiningSquareCheckUpRight.length === 0){
			let openSquareToJump = {
				position: {
					left: piece.position.left + 92,
					top: piece.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left
				&& piece.position.top === openSquareToJump.position.top);

			//if both filters return an array of 0, then there is no piece in the openSquareToJump 
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;			

			//if one of the filters has a piece in it the array will be greater than 0 and the move will go to player 2 
			if(fullAdjoiningSquareCheckUpRight.length === 1 && anyPieceInSquare > 0){
				this.playerOneTurn = true;
				this.pieceSelected = false;	
				this.setState({});
			}
			if(fullAdjoiningSquareCheckUpRight.length === 0 && anyPieceInSquare >= 0){
				this.playerOneTurn = true;
				this.pieceSelected = false;	
				this.setState({});
			}
		}		
	}


	areThereJumpsLeftForKING = (pieceToCheck) => {
		//this should be a square down and to the left of the current selected piece
		let adjoiningSquareOne = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//this should be a square down and to the right of the current selected piece
		let adjoiningSquareTwo = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top + 46
			}
		}
		//this should be a square up and to the left of the current selected piece
		let adjoiningSquareThree = {
			position: {
				left: pieceToCheck.position.left - 46,
				top: pieceToCheck.position.top - 46
			}
		}
		//this should be a square up and to the right of the current selected piece
		let adjoiningSquareFour = {
			position: {
				left: pieceToCheck.position.left + 46,
				top: pieceToCheck.position.top - 46
			}
		}
		let fullAdjoiningSquareCheckDownLeft
		let fullAdjoiningSquareCheckDownRight
		let fullAdjoiningSquareCheckUpLeft
		let fullAdjoiningSquareCheckUpRight

		if(pieceToCheck.player === 1){
			//check to see if the square down and to the left of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownLeft = this.state.piecesTwo.filter(piece => 
				piece.position.left === adjoiningSquareOne.position.left 
				&& piece.position.top === adjoiningSquareOne.position.top);
			//check to see if the square down and to the right of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownRight = this.state.piecesTwo.filter(piece =>
				piece.position.left === adjoiningSquareTwo.position.left 
				&& piece.position.top === adjoiningSquareTwo.position.top);
			//check to see if the square up and to the left of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpLeft = this.state.piecesTwo.filter(piece => 
				piece.position.left === adjoiningSquareThree.position.left 
				&& piece.position.top === adjoiningSquareThree.position.top);
			//check to see if the square up and to the right of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpRight = this.state.piecesTwo.filter(piece =>
				piece.position.left === adjoiningSquareFour.position.left 
				&& piece.position.top === adjoiningSquareFour.position.top);

		}	

		if(pieceToCheck.player === 2){
			//check to see if the square down and to the left of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownLeft = this.state.piecesOne.filter(piece => 
				piece.position.left === adjoiningSquareOne.position.left 
				&& piece.position.top === adjoiningSquareOne.position.top);
			//check to see if the square down and to the right of selected piece has a player two piece in the square
			fullAdjoiningSquareCheckDownRight = this.state.piecesOne.filter(piece =>
				piece.position.left === adjoiningSquareTwo.position.left 
				&& piece.position.top === adjoiningSquareTwo.position.top);
			//check to see if the square up and to the left of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpLeft = this.state.piecesOne.filter(piece => 
				piece.position.left === adjoiningSquareThree.position.left 
				&& piece.position.top === adjoiningSquareThree.position.top);
			//check to see if the square up and to the right of selected piece has a player one piece in the square
			fullAdjoiningSquareCheckUpRight = this.state.piecesOne.filter(piece =>
				piece.position.left === adjoiningSquareFour.position.left 
				&& piece.position.top === adjoiningSquareFour.position.top);

		}			
	
		let piecesInSquare = fullAdjoiningSquareCheckDownLeft.length + fullAdjoiningSquareCheckDownRight.length + fullAdjoiningSquareCheckUpRight.length + fullAdjoiningSquareCheckUpLeft.length;

		if(piecesInSquare === 0){
			if(pieceToCheck.player === 1){
				this.playerOneTurn = false;
				this.pieceSelected = false;
				this.setState({});
			}
			if(pieceToCheck.player === 2){
				this.playerOneTurn = true;
				this.pieceSelected = false;
				this.setState({});
			}
		}
				
		//if there is a piece down and to the left the openSquareToJump should be the square 'behind' that piece
		if(fullAdjoiningSquareCheckDownLeft.length === 1 || fullAdjoiningSquareCheckDownLeft.length === 0){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			

			if(fullAdjoiningSquareCheckDownLeft.length === 1 && anyPieceInSquare > 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}

			if(fullAdjoiningSquareCheckDownLeft.length === 0 && anyPieceInSquare >= 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}			
		}			

		//if there is a piece down and to the right the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckDownRight.length === 1 || fullAdjoiningSquareCheckDownRight.length === 0 ){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top + 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(fullAdjoiningSquareCheckDownRight.length === 1 && anyPieceInSquare > 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}

			if(fullAdjoiningSquareCheckDownRight.length === 0 && anyPieceInSquare >= 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}
		}			

		//if there is a piece up and to the left the openSquareToJump should be the square 'behind' that piece
		else if(fullAdjoiningSquareCheckUpLeft.length === 1 || fullAdjoiningSquareCheckUpLeft.length === 0){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left - 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump by looking for a pieceOne with that position
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(fullAdjoiningSquareCheckUpLeft.length === 1 && anyPieceInSquare > 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}

			if(fullAdjoiningSquareCheckUpLeft.length === 0 && anyPieceInSquare >= 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}
		}			

		else if(fullAdjoiningSquareCheckUpRight.length === 1 || fullAdjoiningSquareCheckUpRight.length === 0){
			let openSquareToJump = {
				position: {
					left: pieceToCheck.position.left + 92,
					top: pieceToCheck.position.top - 92					
				}
			}

			//checks the square 'behind' the square with a piece in it to see if it is open for a jump
			let playerTwoPiecesInSquare = this.state.piecesTwo.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					

			let playerOnePiecesInSquare = this.state.piecesOne.filter(piece =>
				piece.position.left === openSquareToJump.position.left 
				&& piece.position.top === openSquareToJump.position.top);					
						
			let anyPieceInSquare = playerOnePiecesInSquare.length + playerTwoPiecesInSquare.length;
			//if there is an open square behind the piece move the selected piece to that square
			//these parameters make sure there is a square to jump to and that the square is part of the board
			if(fullAdjoiningSquareCheckUpRight.length === 1 && anyPieceInSquare > 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}

			if(fullAdjoiningSquareCheckUpRight.length === 0 && anyPieceInSquare >= 0){
				if(pieceToCheck.player === 1){
					this.playerOneTurn = false;
					this.pieceSelected = false;
					this.setState({});
				}	
				if(pieceToCheck.player === 2){
					this.playerOneTurn = true;
					this.pieceSelected = false;
					this.setState({});
				}								
				
			}			
		}		
	}

			


	
	render() {
		return (
			<div className='board'>
				{this.state.squares.map(square =>
					<div 
						key={square.id}  
						className={square.class}
						onClick={() => this.getSquare(square.id)}
						 >
					</div>
					)}
				{this.state.piecesOne.map(piece => 
					<div 
						key={piece.id}
						className={piece.class}
						style={piece.position}
						onClick={() => {this.findMovesOne(piece.id)}}
						>
					</div>
					)}
				{this.state.piecesTwo.map(piece => 
					<div 
						key={piece.id}
						className={piece.class}
						style={piece.position}
						onClick={() => this.findMovesTwo(piece.id)}
						>
					</div>
					)}					
			</div>
		);
	}
}


export default Board;