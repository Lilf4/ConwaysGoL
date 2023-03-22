this.cellSize = 20;
this.tickRate = 100;

this.canvas;
this.ctx;

this.board;

this.width;
this.height;

this.tickInput;
this.sizeInput;
this.stateBtn;
this.boardLink;

this.cells;
this.localData;

async function onLoad(){
	localizePage();
	addEventListener('langChanged', () => localizePage());
	loadLangElement();
	main();
	
}

function main(){
	this.tickInput = document.getElementById('tickInput');
	this.sizeInput = document.getElementById('sizeInput');
	this.stateBtn = document.getElementById('gameStateBtn');
	this.boardLink = document.getElementById('boardLink');

	this.canvas = document.querySelector('canvas');
	this.canvas.addEventListener('mousedown', function(e) {
		getMouseSquare(e);
	})
	this.ctx = this.canvas.getContext("2d");

	let rect = canvas.getBoundingClientRect();
	width = rect.width;
	height = rect.height;

	this.tickInput.value = this.tickRate;
	this.sizeInput.value = this.cellSize;
	
	this.ctx.strokeStyle = "silver";

	updateSize();
	updateTickRate();

	drawCanvas();
}

function updateSize(){
	this.cellSize = this.sizeInput.value;
	this.cells = {x: Math.floor(width / cellSize), y: Math.floor(height / cellSize)}
	arrCopy = null;
	clearBoard();
	drawCanvas();
}

function updateTickRate(){
	this.tickRate = this.tickInput.value;
	if(this.tickInterval != null){
		clearInterval(this.tickInterval);
		tickInterval = null;
		changeState();
	}
}

var arrCopy;
function drawCanvas() {
	if(arrCopy == null){arrCopy = Array.from(Array(this.cells.x), () => new Array(this.cells.y).fill(true));}
	for(let x = 0; x < this.cells.x; x++){
		for(let y = 0; y < this.cells.y; y++){
			if(arrCopy[x][y] != board[x][y]){
				
			if(board[x][y]){
				this.ctx.fillStyle = "silver";
			}
			else{
				this.ctx.fillStyle = "black";
			}
			this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
			this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
			}
		}
	}

    arrCopy = new Array(this.cells.x)
    for(let x = 0; x < this.cells.x; x++)
    {
        arrCopy[x] = board[x].slice();
    }
}

function getMouseSquare(event) {
	const rect = this.canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	mouseClick( {x : Math.floor(x / cellSize), y : Math.floor(y / cellSize)});
}

function mouseClick(mousePos){
	this.board[mousePos['x']][mousePos['y']] = !this.board[mousePos['x']][mousePos['y']];
	drawCanvas();
}

var tickInterval = null;
function changeState(){
	if(tickInterval != null){
		this.stateBtn.textContent  = this.localData[lang]['START'];
		clearInterval(tickInterval);
		tickInterval = null;
	}
	else{
		this.stateBtn.textContent  = this.localData[lang]['STOP'];
		tickInterval = setInterval(doTick, tickRate);
	}
}


async function doTick(){
	let oldBoard = new Array(this.cells.x)
	for(let x = 0; x <this.cells.x; x++)
	{
		oldBoard[x] = board[x].slice();
	}

	for(let x = 0; x < this.cells.x; x++){
		for(let y = 0; y < this.cells.y; y++){
			let aliveCells = 0;
			for(let x1 = -1; x1 < 2; x1++){
				for(let y1 = -1; y1 < 2; y1++){
					//don't count itself as neighbour
					if(x1 == 0 && y1 == 0) continue;
					//don't check out of bounds for neighbours
					if((x1 + x < 0) || (x1 + x >= this.cells.x) || (y1 + y < 0) || (y1 + y >= this.cells.y)) continue;
					
					if(oldBoard[x1 + x][y1 + y]) aliveCells++;
				}
			}
			if(aliveCells < 2 || aliveCells > 3){board[x][y] = false;}
			else if(!board[x][y] && aliveCells == 3) {board[x][y] = true;}

		}
	}

	drawCanvas();
}

function loadBoard(layout){
	let newBoard = JSON.parse((layout != null ? layout : this.boardLink.value));
	this.sizeInput.value = newBoard[0].size;
	this.tickInput.value = newBoard[0].rate;
	
	newBoard.shift();

	updateSize();
	updateTickRate();

	for(let squarePos of newBoard){
		this.board[squarePos.x][squarePos.y] = true;
	}
	drawCanvas();
}

function saveBoard(){
	let output = `[{"size": ${cellSize}, "rate": ${tickRate}}`;
	for(let x = 0; x < this.cells.x; x++){
		for(let y = 0; y < this.cells.y; y++){
			if(this.board[x][y]){
				output += `,{"x":${x},"y":${y}}`;
			}
		}
	}
	this.boardLink.value = output + ']';
	this.boardLink.select();
	navigator.clipboard.writeText(this.boardLink.value);
}

function clearBoard(){
	this.board = Array.from(Array(this.cells.x), () => new Array(this.cells.y).fill(false));
	this.arrCopy = Array.from(Array(this.cells.x), () => new Array(this.cells.y).fill(true));
	this.ctx.clearRect(0, 0, this.width, this.height);
	drawCanvas();
}

function localizePage(){
	if(!this.localData){
		fetch(`local.json`)
		.then((response) => response.json()
		.then((json) => 
		{
			subKeysAtr(document,  [json[lang], json['GENERAL']]);
			this.localData = json;
		}));
	}else{
		subKeysAtr(document,  [this.localData[lang], this.localData['GENERAL']]);
	}
	
}