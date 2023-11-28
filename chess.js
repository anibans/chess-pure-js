const board = document.getElementById('board');
let playerToMove = "white"
let startPositionId
let draggedElement
const moves = {
    "white" : [],
    "black" : []
}
const hasCastled = {
    "white" : false,
    "black" : false
}

const gameBoard = [
    [rook, knight, bishop, Queen, King, bishop, knight, rook],
    [pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    [pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn],
    [rook, knight, bishop, Queen, King, bishop, knight, rook]
]

class Board{
    //this method initialises the board to the starting position
    static initializeBoard = () => {
        const myBoard = document.getElementById("gameBoard");

        //update the UI stating which player's turn it is
        GameStatus.updatePlayerToMove(playerToMove)

        //prepare the UI with squares and pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div")
                square.classList.add("square")
                square.setAttribute('square-id', (row + 1) + '-' + (col + 1))
                square.classList.add((row + col) % 2 === 0 ? "white" : "black")
    
                //insert the pieces into the squares
                square.innerHTML = gameBoard[row][col]
                square.firstChild ?.setAttribute("draggable", true)
                if (row < 2){
                    square.firstChild?.firstChild?.classList.add("black-piece")
                    square.firstChild?.classList.add("black")
                }
                if (row > 5){
                    square.firstChild?.firstChild?.classList.add("white-piece")
                    square.firstChild?.classList.add("white")
                } 

                //apply the drag and drop events
                square.addEventListener("dragstart", DragEvent.dragStart)
                square.addEventListener("dragover", DragEvent.dragOver)
                square.addEventListener("drop", DragEvent.dragDrop)
                myBoard.append(square);
            }
        }
        
    }
}

class DragEvent{
    static dragStart = e => {
        if(e.target.classList.contains(playerToMove)){
            startPositionId = e.target.parentNode.getAttribute("square-id")
            draggedElement = e.target
        }else{
            return false
        }
    }
    
    static dragOver = e => {
        e.preventDefault()
    }
    
    static dragDrop = e => {
        e.stopPropagation()
        if(draggedElement === undefined)return false
    
        let myTarget = e.target.classList.contains("piece") ? e.target.parentNode : e.target
        
    
        let targetCoordinates = myTarget.getAttribute("square-id").split("-")
        let xTargetCoordinates = targetCoordinates[0]-1
        let yTargetCoordinates = targetCoordinates[1]-1
    
        let originalCoordinates = draggedElement.parentNode.getAttribute("square-id").split("-")
        let xOriginalCoordinates = originalCoordinates[0]-1
        let yOriginalCoordinates = originalCoordinates[1]-1
    
        const coOrdinates = {
            "xOriginalCoordinates" : xOriginalCoordinates,
            "yOriginalCoordinates" : yOriginalCoordinates,
            "xTargetCoordinates" : xTargetCoordinates,
            "yTargetCoordinates" : yTargetCoordinates
        }
    
        if(Validation.checkIfValidMove(draggedElement,coOrdinates) && !Validation.isSelfCheck()){
            gameBoard[xTargetCoordinates][yTargetCoordinates] = gameBoard[xOriginalCoordinates][yOriginalCoordinates]
            gameBoard[xOriginalCoordinates][yOriginalCoordinates] = ""
            if(myTarget.childElementCount>0){
                myTarget.replaceChild(draggedElement,myTarget.firstChild)
            }else{
                myTarget.append(draggedElement)
            }

            const newMove = {
                "original":`${xOriginalCoordinates}-${yOriginalCoordinates}`,
                "target":`${xTargetCoordinates}-${yTargetCoordinates}`,
                "piece":`${draggedElement.id}`
            }
            moves[playerToMove].push(newMove)


            GameStatus.updatePlayerToMove(playerToMove = playerToMove === "white" ? "black" : "white")
        }else{
            alert("Invalid move!")
        }
    }
}

class Validation{
    static checkIfValidMove = (piece,coOrdinates)=>{
        switch(piece.id){
            case "pawn":
                return Pawn.checkMove(piece,coOrdinates)
            case "rook":
                return Rook.checkMove(piece,coOrdinates)
            case "knight":
                return Knight.checkMove(piece,coOrdinates)
            case "bishop":
                return Bishop.checkMove(piece,coOrdinates)
            case "king":
                return KingPiece.checkMove(piece,coOrdinates)
            case "queen":
                return (Rook.checkMove(piece,coOrdinates) || Bishop.checkMove(piece,coOrdinates))
            default:
                return false
        }
    }
    
    static isSelfCheck = ()=>{
        const enemyColor = playerToMove === "white" ? "black" : "white"
        const rooks = document.getElementsByClassName(`rook ${enemyColor}-piece`)
        const bishops = document.getElementsByClassName(`bishop ${enemyColor}-piece`)
        const queen = document.getElementsByClassName(`queen ${enemyColor}-piece`)
        const playerKing = document.getElementsByClassName(`king ${playerToMove}-piece`)[0]
        const draggedElementCoOrdinates = {
            "xOriginalCoordinates" : Number(draggedElement.parentNode.getAttribute('square-id').split("-")[0])-1,
            "yOriginalCoordinates" : Number(draggedElement.parentNode.getAttribute('square-id').split("-")[1])-1
        }
        
        if(rooks.length>0){
            const rookCoOrdinates={
                "xOriginalCoordinates" : "",
                "yOriginalCoordinates" : "",
                "xTargetCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[0])-1,
                "yTargetCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[1])-1
            }

            for(let rookPiece of rooks){

                rookCoOrdinates.xOriginalCoordinates = Number(rookPiece.parentNode.parentNode.getAttribute('square-id').split('-')[0])-1
                rookCoOrdinates.yOriginalCoordinates = Number(rookPiece.parentNode.parentNode.getAttribute('square-id').split('-')[1])-1
                if(Rook.checkMove(playerKing,rookCoOrdinates,true,draggedElementCoOrdinates))return true
            }
        }

        if(bishops.length>0){
            const bishopCoOrdinates={
                "xOriginalCoordinates" : "",
                "yOriginalCoordinates" : "",
                "xTargetCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[0])-1,
                "yTargetCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[1])-1
            }

            for(let bishopPiece of bishops){
                bishopCoOrdinates.xOriginalCoordinates = Number(bishopPiece.parentNode.parentNode.getAttribute('square-id').split('-')[0])-1
                bishopCoOrdinates.yOriginalCoordinates = Number(bishopPiece.parentNode.parentNode.getAttribute('square-id').split('-')[1])-1
                if(Bishop.checkMove(playerKing,bishopCoOrdinates,true,draggedElementCoOrdinates))return true
            }
        }

        /* if(queen.length>0){
            const queenCoOrdinates={
                "xOriginalCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[0])-1,
                "yOriginalCoordinates" : Number(playerKing.parentNode.parentNode.getAttribute('square-id').split('-')[1])-1,
                "xTargetCoordinates" : Number(queen[0].parentNode.parentNode.getAttribute('square-id').split('-')[0])-1,
                "yTargetCoordinates" : Number(queen[0].parentNode.parentNode.getAttribute('square-id').split('-')[1])-1
            }
            if(Rook.checkMove(playerKing,queenCoOrdinates) || Bishop.checkMove(playerKing,queenCoOrdinates))return true
        } */

        return false
    }

    static checkIfSameTeamPieceExists = (coOrdinates,playerColor) =>{
        if(gameBoard[coOrdinates.xTargetCoordinates][coOrdinates.yTargetCoordinates] !== ''){
            if(document.querySelector(`[square-id="${coOrdinates.xTargetCoordinates+1}-${coOrdinates.yTargetCoordinates+1}"]`).firstChild?.classList.contains(playerColor)){
                return true
            }
            return false
        }
        return false
    }
}

class GameStatus{
    static updatePlayerToMove = (playerColor) =>{
        document.getElementById("playerColor").innerText = playerColor === "white" ? "White" : "Black"
    }

    static updateGameBoard = (originalCoordinates,targetCoordinates,piece) => {

    }
}

class GameAlteration{
    static undoMove = ()=>{
        const undoFor = playerToMove === "white" ? "black" : "white"
        const lastNode = moves[undoFor][moves[undoFor].length-1]

        //take the piece from new position to old position
        document.querySelector(`[square-id="${Number(lastNode.original.split("-")[0])+1}-${Number(lastNode.original.split("-")[1])+1}"]`).append(document.querySelector(`[square-id="${Number(lastNode.target.split("-")[0])+1}-${Number(lastNode.target.split("-")[1])+1}"]`).firstChild)

        moves[undoFor].pop()
        playerToMove = undoFor
        GameStatus.updatePlayerToMove(undoFor)
        //still have to update the gameBoard array
    }
}

class Pawn{
    static checkIfReverseMove(coOrdinates,playerColor){
        if(playerColor === "black"){
            if(coOrdinates.xOriginalCoordinates<coOrdinates.xTargetCoordinates)return false
        }else{
            if(coOrdinates.xOriginalCoordinates>coOrdinates.xTargetCoordinates)return false
        }
        return true
    }

    static checkMove = (piece,coOrdinates) => {
        const differenceInXCooridnates = Math.abs(coOrdinates.xTargetCoordinates - coOrdinates.xOriginalCoordinates)
        const differenceInYCooridnates = Math.abs(coOrdinates.yTargetCoordinates - coOrdinates.yOriginalCoordinates)
        const playerColor = piece.classList.contains("black") ? "black" : "white"
        const enemyColor = playerColor === "black" ? "white" : "black"
        if(
            (coOrdinates.xOriginalCoordinates === 1 || coOrdinates.xOriginalCoordinates === 6)&& 
            (((differenceInXCooridnates === 2 && playerColor==="black" && gameBoard[differenceInXCooridnates][coOrdinates.yOriginalCoordinates] === '') ||(differenceInXCooridnates === 2 && playerColor==="white" && gameBoard[coOrdinates.xOriginalCoordinates-1][coOrdinates.yOriginalCoordinates] === ''))|| differenceInXCooridnates === 1) && 
            coOrdinates.yOriginalCoordinates === coOrdinates.yTargetCoordinates &&
            gameBoard[coOrdinates.xTargetCoordinates][coOrdinates.yTargetCoordinates] === '' &&
            !Pawn.checkIfReverseMove(coOrdinates,playerColor)
        ){
            return true
        }
        if(
            (
                (coOrdinates.xOriginalCoordinates > 1 && playerColor === "black") || 
                (coOrdinates.xOriginalCoordinates < 6 && playerColor === "white")
            ) && 
            differenceInXCooridnates === 1 && 
            coOrdinates.yOriginalCoordinates === coOrdinates.yTargetCoordinates &&
            gameBoard[coOrdinates.xTargetCoordinates][coOrdinates.yTargetCoordinates] === '' &&
            !Pawn.checkIfReverseMove(coOrdinates,playerColor)
        )
        {
            return true
        }
        if(
            (
                (coOrdinates.xOriginalCoordinates >= 1 && playerColor==="black") || 
                (coOrdinates.xOriginalCoordinates <= 6 && playerColor==="white")
            )&&
            differenceInXCooridnates === 1 &&
            differenceInYCooridnates === 1 &&
            document.querySelector(`[square-id="${coOrdinates.xTargetCoordinates+1}-${coOrdinates.yTargetCoordinates+1}"]`).firstChild?.classList.contains(enemyColor) &&
            !Pawn.checkIfReverseMove(coOrdinates,playerColor)
        )
        {
            return true
        }

        return false
    }

    
}

class Rook{
    static checkMove=(piece,coOrdinates,forCheck=false,checkOriginalPieceCoordinates={})=>{
        const differenceInXCooridnates = Math.abs(coOrdinates.xTargetCoordinates - coOrdinates.xOriginalCoordinates)
        const differenceInYCooridnates = Math.abs(coOrdinates.yTargetCoordinates - coOrdinates.yOriginalCoordinates)
        const playerColor = piece.classList.contains("black") ? "black" : "white"

        if(differenceInXCooridnates === 0){
            if(Validation.checkIfSameTeamPieceExists(coOrdinates,playerColor))return false
            if(coOrdinates.yOriginalCoordinates < coOrdinates.yTargetCoordinates){
                for(let count=coOrdinates.yOriginalCoordinates+1; count<coOrdinates.yTargetCoordinates; count++){
                    if(gameBoard[coOrdinates.xOriginalCoordinates][count] !== ''){
                        if(forCheck){
                            if(
                                coOrdinates.xOriginalCoordinates === checkOriginalPieceCoordinates.xOriginalCoordinates &&
                                count === checkOriginalPieceCoordinates.yOriginalCoordinates
                            )continue
                        }
                        return false
                    }
                }
                return true
            }
            if(coOrdinates.yOriginalCoordinates > coOrdinates.yTargetCoordinates){
                for(let count=coOrdinates.yOriginalCoordinates-1; count>coOrdinates.yTargetCoordinates; count--){
                    if(gameBoard[coOrdinates.xOriginalCoordinates][count] !== ''){
                        if(forCheck){
                            if(
                                coOrdinates.xOriginalCoordinates === checkOriginalPieceCoordinates.xOriginalCoordinates &&
                                count === checkOriginalPieceCoordinates.yOriginalCoordinates
                            )continue
                        }
                        return false
                    }
                }
                return true
            }
        }
        if(differenceInYCooridnates === 0){
            if(Validation.checkIfSameTeamPieceExists(coOrdinates,playerColor))return false
            if(coOrdinates.xOriginalCoordinates < coOrdinates.xTargetCoordinates){
                for(let count=coOrdinates.xOriginalCoordinates+1; count<coOrdinates.xTargetCoordinates; count++){
                    if(gameBoard[count][coOrdinates.yOriginalCoordinates] !== ''){
                        if(forCheck){
                            if(
                                count === checkOriginalPieceCoordinates.xOriginalCoordinates &&
                                coOrdinates.yOriginalCoordinates === checkOriginalPieceCoordinates.yOriginalCoordinates
                            )continue
                        }
                        return false
                    }
                }
                return true
            }
            if(coOrdinates.xOriginalCoordinates > coOrdinates.xTargetCoordinates){
                for(let count=coOrdinates.xOriginalCoordinates-1; count>coOrdinates.xTargetCoordinates; count--){
                    if(gameBoard[count][coOrdinates.yOriginalCoordinates] !== ''){
                        if(forCheck){
                            if(
                                count === checkOriginalPieceCoordinates.xOriginalCoordinates &&
                                coOrdinates.yOriginalCoordinates === checkOriginalPieceCoordinates.yOriginalCoordinates
                            )continue
                        }
                        return false
                    }
                }
                return true
            }
        }
        return false
    }
}

class Bishop{
    static checkMove=(piece,coOrdinates,forCheck=false,checkOriginalPieceCoordinates={})=>{
        const differenceInXCooridnates = Math.abs(coOrdinates.xTargetCoordinates - coOrdinates.xOriginalCoordinates)
        const differenceInYCooridnates = Math.abs(coOrdinates.yTargetCoordinates - coOrdinates.yOriginalCoordinates)
        const playerColor = piece.classList.contains("black") ? "black" : "white"

        if(differenceInXCooridnates === differenceInYCooridnates){
            if(Validation.checkIfSameTeamPieceExists(coOrdinates,playerColor))return false
            if(coOrdinates.xOriginalCoordinates < coOrdinates.xTargetCoordinates){
                if(coOrdinates.yOriginalCoordinates < coOrdinates.yTargetCoordinates){
                    for(let count=1;count<differenceInXCooridnates;count++){

                        if(gameBoard[coOrdinates.xOriginalCoordinates+count][coOrdinates.yOriginalCoordinates+count]!== ''){
                            if(forCheck){
                                if(coOrdinates.xOriginalCoordinates+count === checkOriginalPieceCoordinates.xOriginalCoordinates && coOrdinates.yOriginalCoordinates+count === checkOriginalPieceCoordinates.yOriginalCoordinates)continue
                            }
                            return false
                        }
                    }
                    return true
                }
                if(coOrdinates.yOriginalCoordinates > coOrdinates.yTargetCoordinates){
                    for(let count=1;count<differenceInXCooridnates;count++){
                        if(gameBoard[coOrdinates.xOriginalCoordinates+count][coOrdinates.yOriginalCoordinates-count]!== ''){
                            if(forCheck){
                                if(coOrdinates.xOriginalCoordinates+count === checkOriginalPieceCoordinates.xOriginalCoordinates && coOrdinates.yOriginalCoordinates-count === checkOriginalPieceCoordinates.yOriginalCoordinates)continue
                            }
                            return false
                        }
                    }
                    return true
                }
            }
            if(coOrdinates.xOriginalCoordinates > coOrdinates.xTargetCoordinates){
                if(coOrdinates.yOriginalCoordinates > coOrdinates.yTargetCoordinates){
                    for(let count=1;count<differenceInXCooridnates;count++){
                        if(gameBoard[coOrdinates.xOriginalCoordinates-count][coOrdinates.yOriginalCoordinates-count]!== ''){
                            if(forCheck){
                                if(coOrdinates.xOriginalCoordinates-count === checkOriginalPieceCoordinates.xOriginalCoordinates && coOrdinates.yOriginalCoordinates-count === checkOriginalPieceCoordinates.yOriginalCoordinates)continue
                            }
                            return false
                        }
                    }
                    return true
                }
                if(coOrdinates.yOriginalCoordinates < coOrdinates.yTargetCoordinates){
                    for(let count=1;count<differenceInXCooridnates;count++){
                        if(gameBoard[coOrdinates.xOriginalCoordinates-count][coOrdinates.yOriginalCoordinates+count]!== ''){
                            if(forCheck){
                                if(coOrdinates.xOriginalCoordinates-count === checkOriginalPieceCoordinates.xOriginalCoordinates && coOrdinates.yOriginalCoordinates+count === checkOriginalPieceCoordinates.yOriginalCoordinates)continue
                            }
                            return false
                        }
                    }
                    return true
                }
            }
        }
        return false
    }
}

class Knight{
    static checkMove=(piece,coOrdinates)=>{
        const differenceInXCooridnates = Math.abs(coOrdinates.xTargetCoordinates - coOrdinates.xOriginalCoordinates)
        const differenceInYCooridnates = Math.abs(coOrdinates.yTargetCoordinates - coOrdinates.yOriginalCoordinates)
        const playerColor = piece.classList.contains("black") ? "black" : "white"

        if((differenceInXCooridnates === 1 && differenceInYCooridnates === 2)||(differenceInXCooridnates === 2 && differenceInYCooridnates === 1)){
            if(Validation.checkIfSameTeamPieceExists(coOrdinates,playerColor))return false
            return true
        }
        return false
    }
}

class KingPiece{
    static checkMove=(piece,coOrdinates)=>{
        const differenceInXCooridnates = Math.abs(coOrdinates.xTargetCoordinates - coOrdinates.xOriginalCoordinates)
        const differenceInYCooridnates = Math.abs(coOrdinates.yTargetCoordinates - coOrdinates.yOriginalCoordinates)
        const playerColor = piece.classList.contains("black") ? "black" : "white"

        if(
            ((differenceInXCooridnates === 1) && (differenceInXCooridnates === differenceInYCooridnates)) ||
            (differenceInXCooridnates === 0 && differenceInYCooridnates === 1) ||
            (differenceInXCooridnates === 1 && differenceInYCooridnates === 0)
        )
        {
            if(Validation.checkIfSameTeamPieceExists(coOrdinates,playerColor))return false
            return true
        }
        return false
    }
}


Board.initializeBoard()
