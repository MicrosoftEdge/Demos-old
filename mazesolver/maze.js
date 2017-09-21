Math.seedrandom("30x30");

var mazeHelpers = {};

mazeHelpers.builder = function(){
	var board;
	var entrance = {};
	var exit = {};
	var mazeSize;

	// Calculates the actual maze using a simplistic DFS search algorithm that tends to build uninteresting mazes
	var buildMaze = function(size) {
		mazeSize = size;
		var stack = new Array();
		stack.push(board[size-1][size-1]);

		while(stack.length > 0) {
			var currCell = stack.pop();
			while(true) {
				currCell.isVisited = true;

				var candidates = getCandidates(currCell);
				if(candidates.length == 0)
					break;

				var nextCandidate;
				if(candidates.length == 1) {
					stack.push(currCell);
					nextCandidate = candidates[0];
				}
				else {
					stack.push(currCell);
					var candidateIndex = Math.floor(Math.random()*candidates.length);
					nextCandidate = candidates[candidateIndex];
				}

				// delete wall between current cell and next cell
				deleteWall(currCell, nextCandidate);

				currCell = nextCandidate;
			}
		}
	}

	var getCandidates = function(cell) {
		var candidates = new Array();
		// Check North
		if(cell.row > 0) {
			if(board[cell.row-1][cell.column].isVisited == false)
				candidates.push(board[cell.row-1][cell.column]);
		}

		// Check South
		if(cell.row < mazeSize-1 ) {
			if(board[cell.row+1][cell.column].isVisited == false)
				candidates.push(board[cell.row+1][cell.column]);
		}

		// Check East
		if(cell.column> 0) {
			if(board[cell.row][cell.column-1].isVisited == false)
				candidates.push(board[cell.row][cell.column-1]);
		}

		// Check West
		if(cell.column < mazeSize-1) {
			if(board[cell.row][cell.column+1].isVisited == false)
				candidates.push(board[cell.row][cell.column+1]);
		}

		return candidates;
	}

	var deleteWall = function(cell1, cell2) {
		var rowDiff = cell2.row - cell1.row;
		var colDiff = cell2.column - cell1.column;

		if(rowDiff == 1) {
			cell1.walls -= 2;
			cell2.walls -= 8;
		} else if (rowDiff == -1) {
			cell1.walls -= 8;
			cell2.walls -= 2;
		} else if (colDiff == 1) {
			cell1.walls -= 4;
			cell2.walls -= 1;
		} else if (colDiff == -1) {
			cell1.walls -= 1;
			cell2.walls -= 4;
		}
	}

	return {
		getBoard: function() {
			return board;
		},

		getEntrance: function() {
			return entrance;
		},

		getExit: function() {
			return exit;
		},

		getSize: function() {
			return mazeSize;
		},

		initialize: function(size) {
			board = new Array();

			// Magic numbers determined through trial and error to match the desired layout
			entrance.x = 0;
			entrance.y = (size==20) ? 9 : (size==30) ? 14 : (size==40) ? 19 : (size==50) ? 24 : 0;

			// The exit is always the bottom right corner
			exit.x = size-1;
			exit.y = size-1;

			// Instantiate the maze structure
			for(var i=0; i<size; i++) {
				board.push(new Array(size));
				for(var j=0; j<size; j++) {
					// Create the cell
					board[i][j] = {'row':i, 'column':j,'isVisited':false,'walls':15};
				}
			}

			// Calculate the actual maze
			buildMaze(size);
		},
	}
}();

mazeHelpers.solver = function() {
	var solutionStack;
	var solveStack;
	var builder;
	var numSteps;

	var getSolveCandidates = function (cell) {
		var candidates = new Array();

		// Check North
		if(!(cell.walls & 8) && cell.row > 0) {
			if(!builder.getBoard()[cell.row-1][cell.column].solveState)
				candidates.push(builder.getBoard()[cell.row-1][cell.column]);
		}

		// Check South
		if(!(cell.walls & 2) && cell.row < builder.getSize()-1) {
			if(!builder.getBoard()[cell.row+1][cell.column].solveState)
				candidates.push(builder.getBoard()[cell.row+1][cell.column]);
		}

		// Check East
		if(!(cell.walls & 4) && cell.column < builder.getSize()-1) {
			if(!builder.getBoard()[cell.row][cell.column+1].solveState)
				candidates.push(builder.getBoard()[cell.row][cell.column+1]);
		}

		// Check West
		if(!(cell.walls & 1) && cell.column > 0) {
			if(!builder.getBoard()[cell.row][cell.column-1].solveState)
				candidates.push(builder.getBoard()[cell.row][cell.column-1]);
		}

		return candidates;
	}

	return {
		getSolutionStack: function() {
			return solutionStack;
		},

		getNumberOfSteps: function() {
			return numSteps;
		},

		initialize: function(theBuilder) {
			builder = theBuilder;
			solutionStack = new Array();
			solveStack = new Array();
			numSteps = 0;
			for(var i=0; i<builder.getSize(); i++) {
				for(var j=0; j<builder.getSize(); j++) {
					builder.getBoard()[i][j].solveState = 0;
				}
			}

			// Initialize the solve stack with the entrance of the maze
			solveStack.push(builder.getBoard()[builder.getEntrance().y][0]);
		},

		next: function() {
			var currentSolveCell = solveStack[solveStack.length-1];

			// reached the goal, stop solving
			if(currentSolveCell.row == builder.getExit().y && currentSolveCell.column == builder.getExit().x) {
				solutionStack.push(currentSolveCell);
				return {'row':currentSolveCell.row, 'column':currentSolveCell.column, 'done':true, 'candidate':true};
			}

			// mark cell as visited if it has not been visited yet
			if(currentSolveCell.solveState == 0) {
				numSteps++;
				currentSolveCell.solveState = 1;
				solutionStack.push(currentSolveCell);
			}

			var candidates = getSolveCandidates(currentSolveCell);

			// if this is a dead end step back, otherwise this is a valid candidate cell
			if(candidates.length == 0) {
				currentSolveCell.solveState = 2;
				solveStack.pop();
				solutionStack.pop();
				return {'row':currentSolveCell.row, 'column':currentSolveCell.column, 'done':false, 'candidate':false};
			} else {
				solveStack.push(candidates[Math.floor(Math.random()*candidates.length)]);
				return {'row':currentSolveCell.row, 'column':currentSolveCell.column, 'done':false, 'candidate':true};
			}
		}
	}
}();

var sizes = [20, 30, 40]
var baseSize = 30;
var startTime=0;
var endTime=0;
var currOn = 0;
var randomSeedValue = "";

var solveInterval;
var solutionAnimationInterval;
var solutionMarkers;
var isDisplayingSolutionAnimation=false;
var isAutoMode = false;

var colBorders;
var leftEdges;
var rightEdges;
var rowBorders;
var markers;

function initialize() {
	// Initialize the select element handler
	var select = document.getElementById("sizeSelector");
    select.options[1].selected = true;

    if($BrowserInfo.IsBrowserInternetExplorer() && !$BrowserInfo.IsBrowserInternetExplorer9RCPlusOrLater()) {
        // On IE8 only a 30x30 maze is supported
        select.disabled = true;
        mazeHelpers.builder.initialize(30);
    } else {
        select.onchange=function() {
            changeMazeSize(sizes[this.selectedIndex]);
        }
        document.getElementById("currentMazeSize").textContent = select.options[select.selectedIndex].text;

        // Build the default maze
        mazeHelpers.builder.initialize(sizes[select.selectedIndex]);
    }

	// Create the maze elements based on the underlying maze structure
	createMazeElements();

	registerForKeyboardEvents();
}

function handleKeyUp(e) {
    if(window.event) {
        if(window.event.keyCode == 65) {
            toggleAutoMode();
        }
    } else if(e) {
        if(e.keyCode == 65) {
            toggleAutoMode();
        }
    }
}

function toggleAutoMode() {
    isAutoMode = !isAutoMode;

    // If we've exited automode we should allow the user to select a new size if this is not IE8
    if(!isAutoMode && (!$BrowserInfo.IsBrowserInternetExplorer() || ($BrowserInfo.IsBrowserInternetExplorer() && $BrowserInfo.IsBrowserInternetExplorer9RCPlusOrLater ()))) {
        document.getElementById("sizeSelector").disabled = false;
    }

    // If we've just entered automode we should queue up a task to start solving the maze, if we're not already solving the maze
    if(isAutoMode) {
        document.getElementById("sizeSelector").selectedIndex = 0;
        document.getElementById("sizeSelector").disabled = true;
        changeMazeSize(20);

        solveMaze();
    }
}

function registerForKeyboardEvents() {
    if(document.addEventListener) {
        document.addEventListener("keyup", handleKeyUp, false);

    } else if(document.body.attachEvent) {
        document.attachEvent("onkeyup", handleKeyUp);
    }
}

function changeMazeSize(newSize) {
    randomSeedValue = "";
    createNewMaze(newSize);
}

function refreshMaze() {
    randomSeedValue = randomSeedValue + 1;
    createNewMaze(mazeHelpers.builder.getSize());
}

function createNewMaze(newSize) {
	clearInterval(solveInterval);
	clearInterval(solutionAnimationInterval);
    isDisplayingSolutionAnimation = false;

	Math.seedrandom(newSize+"x"+newSize+randomSeedValue);

	var mazeElement = document.getElementById("maze");
	var mazeContainer = document.getElementById("MazeContainer");
	mazeContainer.removeChild(mazeElement);

	// Hide the summary panel if it is currently displayed and display the start/refresh controls if they are not
    hideSummary();

    var select = document.getElementById("sizeSelector");
    document.getElementById("currentMazeSize").textContent = select.options[select.selectedIndex].text;
	mazeHelpers.builder.initialize(newSize);
	createMazeElements();
}

function createMazeElements() {
	// Create the root maze element
	var maze = document.createElement("div");
	maze.id = "maze";

	colBorders = new Array();
	leftEdges = new Array();
	rightEdges = new Array();
	rowBorders = new Array();
	markers = new Array();

	// Create the top maze borders
	var lBorderJoint = document.createElement("div");
	lBorderJoint.className += " border row col";
	maze.appendChild(lBorderJoint);
	for(var j=0; j<mazeHelpers.builder.getSize(); j++) {
		// Create the bottom border
		var border = document.createElement("div");
		border.className += " border row";
		maze.appendChild(border);

		// Create the border joints
		var joint = document.createElement("div");
		joint.className += " border row col";
		maze.appendChild(joint);
	}

	// Create the rest of the maze
	for(var i=0; i<mazeHelpers.builder.getSize(); i++) {
		colBorders.push(new Array(mazeHelpers.builder.getSize()-1));
		rowBorders.push(new Array(mazeHelpers.builder.getSize()-1));

		for(var j=0; j<mazeHelpers.builder.getSize(); j++) {
			// Create the left border if we're on a leftmost cell
			if(j==0) {
				var lBorder = document.createElement("div");
				lBorder.className += " border col";
				leftEdges.push(lBorder);
				maze.appendChild(lBorder);
			}

			// Create the cell
			var cell = document.createElement("div");
			cell.className = "cell";
			maze.appendChild(cell);

			// Create markers to use while solving maze
			var marker = document.createElement("div");
			marker.className = "marker";
			marker.visibility = "hidden";
			maze.appendChild(marker);
			markers.push(marker);

			// Create the right maze border
			var rBorder = document.createElement("div");
			rBorder.className += " border col";
			if(j<mazeHelpers.builder.getSize()-1) {
				colBorders[i][j] = rBorder;
			} else {
				rightEdges.push(rBorder);
			}
			maze.appendChild(rBorder);
		}

		// Create the bottom maze borders if we're not on a bottommost row
		if(i<mazeHelpers.builder.getSize()) {
			for(var j=0; j<mazeHelpers.builder.getSize(); j++) {
				// Create the left border joint if we're on a leftmost cell
				if(j==0) {
					var lBorderJoint = document.createElement("div");
					lBorderJoint.className += " border row col";
					maze.appendChild(lBorderJoint);
				}

				// Create the bottom border
				var border = document.createElement("div");
				border.className += " border row";
				maze.appendChild(border);
				if(i<mazeHelpers.builder.getSize()-1) {
					rowBorders[i][j] = border;
				}

				// Create the border joints
				var joint = document.createElement("div");
				joint.className += " border row col";
				maze.appendChild(joint);
			}
		}
	}

	maze.style.width = mazeHelpers.builder.getSize()*(10+2)+2+"px";
	maze.style.height = mazeHelpers.builder.getSize()*(10+2)+2+"px";
	document.getElementById("MazeContainer").appendChild(maze);

	scaleAndCenterMaze(maze);
	maze.style.visibility = "visible";
	updateWalls();
}

function scaleAndCenterMaze(maze) {
    if($BrowserInfo.IsBrowserInternetExplorer() && !$BrowserInfo.IsBrowserInternetExplorer9RCPlusOrLater()) {
        // Since IE8 only supports one maze size and lacks CSS 2D transforms we hardcode a margin to center the maze
        maze.style.marginLeft = "69px";
    } else {
        var containerWidth = window.getComputedStyle(document.getElementById("MazeContainer"), null).getPropertyValue("width").replace(/px/,"");
        var mazeWidth = window.getComputedStyle(maze, null).getPropertyValue("width").replace(/px/,"");
        var translation = (containerWidth-mazeWidth*baseSize/mazeHelpers.builder.getSize())/2+"px";
        if(mazeHelpers.builder.getSize()==baseSize) {
            maze.style.marginLeft = translation;
        }
        else {
            maze.style.msTransformOrigin = "top left";
            maze.style.msTransform = "translate("+translation+", 0px) scale("+baseSize/mazeHelpers.builder.getSize()+")";
            maze.style.webkitTransformOrigin = "top left";
            maze.style.webkitTransform = "translate("+translation+", 0px) scale("+baseSize/mazeHelpers.builder.getSize()+")";
            maze.style.MozTransformOrigin = "top left";
            maze.style.MozTransform = "translate("+translation+", 0px) scale("+baseSize/mazeHelpers.builder.getSize()+")";
            maze.style.OTransformOrigin = "top left";
            maze.style.OTransform = "translate("+translation+", 0px) scale("+baseSize/mazeHelpers.builder.getSize()+")";
        }
    }
}

function updateWalls() {
    for(var i=0; i<mazeHelpers.builder.getSize(); i++) {
        for(var j=0; j<mazeHelpers.builder.getSize(); j++) {
            if(!(mazeHelpers.builder.getBoard()[i][j].walls & 8)) {
                rowBorders[i-1][j].style.backgroundColor = "white";
            }
            if(!(mazeHelpers.builder.getBoard()[i][j].walls & 4)) {
                colBorders[i][j].style.backgroundColor = "white";
            }
            if(!(mazeHelpers.builder.getBoard()[i][j].walls & 2)) {
                rowBorders[i][j].style.backgroundColor = "white";
            }
            if(!(mazeHelpers.builder.getBoard()[i][j].walls & 1)) {
                colBorders[i][j-1].style.backgroundColor = "white";
            }
        }
    }

	leftEdges[mazeHelpers.builder.getEntrance().y].style.backgroundColor = "white";
	rightEdges[mazeHelpers.builder.getExit().y].style.backgroundColor = "white";
}

function showStartAndRefreshButtons() {
	document.getElementById("startButton").style.visibility = "visible";
    document.getElementById("refreshButton").style.visibility = "visible";
    document.getElementById("timer").style.display = "none";
}

function hideStartAndRefreshButtons() {
	document.getElementById("startButton").style.visibility = "hidden";
    document.getElementById("refreshButton").style.visibility = "hidden";
    document.getElementById("timer").style.display = "block";
}

function solveMaze() {
    // If we've previously completed a test and are currently displaying the solution animation we should
    // stop that animation and reset the maze before starting over again
    if(isDisplayingSolutionAnimation) {
        changeMazeSize(mazeHelpers.builder.getSize());
    }

    hideStartAndRefreshButtons();

    mazeHelpers.solver.initialize(mazeHelpers.builder);
    solveInterval = setInterval("solveStep()", 4);

    startTime = new Date().getTime();
}

function delayedSolveMaze() {
    if(isAutoMode) {
        refreshMaze();
        solveMaze();
    }
}

var prev = -1;
function solveStep() {
	// Get current time and compute the elapsed time since we started solving
	var elapsedTime = (new Date().getTime()) - startTime;
	var elapsedTimeString = (elapsedTime/1000).toFixed(1) + "s";

	// Only incur these costs if we're going to update the value onscreen
	if(prev != elapsedTimeString) {
		// Display the current elapsed time
		if($BrowserInfo.IsBrowserInternetExplorer() && $BrowserInfo.GetBrowserVersion() < 9) {
			document.getElementById("timer").innerText = elapsedTimeString ;
		} else {
			document.getElementById("timer").textContent = elapsedTimeString ;
		}
		prev = elapsedTimeString;
	}

	var result = mazeHelpers.solver.next();
	var marker = markers[result.column*mazeHelpers.builder.getSize()+result.row];
	if(result.done) {
		clearInterval(solveInterval);
		marker.className = "marker solution";
		moveMarker(marker, result.column, result.row);

		displaySolution();
	} else {
		if(result.candidate) {
			marker.className = "marker visited";
			moveMarker(marker, result.column, result.row);
		} else {
			marker.className = "marker deadend";
			moveMarker(marker, result.column, result.row);
		}
	}
}

function hideSummary() {
    if(window.event) {
        window.event.returnValue = false;
    }
    document.getElementById("summary").style.visibility = "hidden";
    showStartAndRefreshButtons();
}

function showSummary() {
    document.getElementById("summary").style.visibility = "visible";
    document.getElementById("timer").style.display = "none";
}

function moveMarker(elem, x, y) {
    if($BrowserInfo.IsBrowserInternetExplorer() && !$BrowserInfo.IsBrowserInternetExplorer9RCPlusOrLater()) {
        // IE8 does not support 2D transforms, so we are positioning the markers as absolutely positioned elements instead
        elem.style.left = (x*12+4)+"px";
        elem.style.top = (y*12+4)+"px";
    } else {
        elem.style.msTransform = "translate("+(x*12+4)+"px, "+(y*12+4)+"px)";
        elem.style.webkitTransform = "translate("+(x*12+4)+"px, "+(y*12+4)+"px)";
        elem.style.MozTransform = "translate("+(x*12+4)+"px, "+(y*12+4)+"px)";
        elem.style.OTransform = "translate("+(x*12+4)+"px, "+(y*12+4)+"px)";
    }
}

function displaySolution() {
    endTime = new Date().getTime();
    var path = document.querySelectorAll(".visited");
    for(var i=0; i<path.length; i++) {
        path[i].className = "marker solution";
    }

    var deadends = document.querySelectorAll(".deadend");
    for(var i=0; i<deadends.length; i++) {
        deadends[i].style.visibility = "hidden";
    }

	startSolutionAnimation();

	// Display the results panel
    var duration = endTime - startTime;
	var totalTimeString = (duration/1000).toFixed((duration/1000 < 10 ? 1 : 0)) + " seconds";

    if($BrowserInfo.IsBrowserInternetExplorer() && $BrowserInfo.GetBrowserVersion() < 9) {
		document.getElementById("totalTime").innerText = totalTimeString;
	} else {
		document.getElementById("totalTime").textContent = totalTimeString;
	}

	showSummary();

	// If we're in automode we should queue up a delayed task to start the next round of solving
	setTimeout("delayedSolveMaze()", 1000);
}

function startSolutionAnimation() {
    currOn = 0;
	solutionMarkers = document.querySelectorAll(".solution");
	for(var i=0; i<solutionMarkers.length; i++) {
		solutionMarkers[i].style.opacity = 0.2;
	}

    isDisplayingSolutionAnimation = true;
	solutionAnimationInterval = setInterval("solutionAnimationStep()",16.7*2);
}

function solutionAnimationStep() {
	var solutionStack = mazeHelpers.solver.getSolutionStack();

	var marker;
	var solutionCell;

	//turn off the previous marker, correcting for JavaScript's incorrect calculation for the modulus of negative numbers
	solutionCell = solutionStack[((currOn-3)%solutionStack.length+solutionStack.length)%solutionStack.length];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.3;

	//turn on the current markers, correcting for JavaScript's incorrect calculation for the modulus of negative numbers
	solutionCell = solutionStack[((currOn-2)%solutionStack.length+solutionStack.length)%solutionStack.length];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.6;

	solutionCell = solutionStack[((currOn-1)%solutionStack.length+solutionStack.length)%solutionStack.length];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.8;

	solutionCell = solutionStack[currOn];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.95;

	solutionCell = solutionStack[(currOn+1)%solutionStack.length];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.8;

	solutionCell = solutionStack[(currOn+2)%solutionStack.length];
 	markers[solutionCell.column*mazeHelpers.builder.getSize()+solutionCell.row].style.opacity = 0.6;

	currOn = (currOn+1)%solutionStack.length;
}
