// Global variables
let board = [];
let solution = [];
let selectedCell = null;
let timer = null;
let seconds = 0;
let difficulty = 'easy';

// Difficulty settings (number of cells to reveal)
const difficultySettings = {
    easy: 45,    // 45 cells revealed (36 hidden)
    medium: 35,  // 35 cells revealed (46 hidden)
    hard: 25     // 25 cells revealed (56 hidden)
};

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create the board UI
    createBoard();
    
    // Set up event listeners
    document.getElementById('new-game').addEventListener('click', startNewGame);
    document.getElementById('solve').addEventListener('click', solvePuzzle);
    document.getElementById('difficulty').addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
    
    // Set up number pad
    document.querySelectorAll('.number').forEach(button => {
        button.addEventListener('click', () => {
            if (selectedCell && !selectedCell.classList.contains('fixed')) {
                const number = button.textContent;
                enterNumber(number);
            }
        });
    });
    
    // Set up erase button
    document.getElementById('erase').addEventListener('click', () => {
        if (selectedCell && !selectedCell.classList.contains('fixed')) {
            selectedCell.textContent = '';
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            board[row][col] = 0;
            validateCell(row, col);
            checkCompletion();
        }
    });
    
    // Start a new game
    startNewGame();
});

// Create the 9x9 board UI
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add event listener for cell selection
            cell.addEventListener('click', () => {
                // Remove selected class from previously selected cell
                if (selectedCell) {
                    selectedCell.classList.remove('selected');
                }
                
                // Set new selected cell
                selectedCell = cell;
                selectedCell.classList.add('selected');
            });
            
            boardElement.appendChild(cell);
        }
    }
}

// Start a new game
function startNewGame() {
    // Reset timer
    resetTimer();
    startTimer();
    
    // Generate a new puzzle
    generatePuzzle();
    
    // Update status message
    document.getElementById('status-message').textContent = 'Game started!';
}

// Generate a new Sudoku puzzle
function generatePuzzle() {
    // Generate a solved board
    solution = generateSolvedBoard();
    
    // Create a copy of the solution
    board = JSON.parse(JSON.stringify(solution));
    
    // Remove numbers based on difficulty
    const cellsToReveal = difficultySettings[difficulty];
    const cellsToHide = 81 - cellsToReveal;
    
    let hiddenCells = 0;
    while (hiddenCells < cellsToHide) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            hiddenCells++;
        }
    }
    
    // Update the UI
    updateBoardUI();
}

// Generate a solved Sudoku board
function generateSolvedBoard() {
    // Initialize empty 9x9 board
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill the board using backtracking
    solveSudoku(board);
    
    return board;
}

// Solve the Sudoku using backtracking algorithm
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            // Find an empty cell
            if (board[row][col] === 0) {
                // Try placing numbers 1-9
                for (let num = 1; num <= 9; num++) {
                    if (isValidPlacement(board, row, col, num)) {
                        // Place the number
                        board[row][col] = num;
                        
                        // Recursively try to solve the rest of the board
                        if (solveSudoku(board)) {
                            return true;
                        }
                        
                        // If placing the number doesn't lead to a solution, backtrack
                        board[row][col] = 0;
                    }
                }
                
                // If no number can be placed, backtrack
                return false;
            }
        }
    }
    
    // If we've filled all cells, the board is solved
    return true;
}

// Check if placing a number is valid
function isValidPlacement(board, row, col, num) {
    // Check row
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num) {
            return false;
        }
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i][col] === num) {
            return false;
        }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) {
                return false;
            }
        }
    }
    
    return true;
}

// Update the board UI based on the current board state
function updateBoardUI() {
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Clear previous state
        cell.textContent = '';
        cell.classList.remove('fixed', 'error');
        
        // Set new value
        if (board[row][col] !== 0) {
            cell.textContent = board[row][col];
            cell.classList.add('fixed');
        }
    });
}

// Enter a number in the selected cell
function enterNumber(number) {
    if (!selectedCell) return;
    
    const row = parseInt(selectedCell.dataset.row);
    const col = parseInt(selectedCell.dataset.col);
    
    // Update the UI
    selectedCell.textContent = number;
    
    // Update the board data
    board[row][col] = parseInt(number);
    
    // Validate the move
    validateCell(row, col);
    
    // Check if the puzzle is complete
    checkCompletion();
}

// Validate a cell's value
function validateCell(row, col) {
    if (board[row][col] === 0) {
        // Empty cell is always valid
        document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.remove('error');
        return true;
    }
    
    // Create a copy of the board without the current cell's value
    const tempBoard = JSON.parse(JSON.stringify(board));
    tempBoard[row][col] = 0;
    
    // Check if the current value is valid
    const isValid = isValidPlacement(tempBoard, row, col, board[row][col]);
    
    // Update UI to show error if invalid
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (isValid) {
        cell.classList.remove('error');
    } else {
        cell.classList.add('error');
    }
    
    return isValid;
}

// Check if the puzzle is complete
function checkCompletion() {
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return false;
            }
            
            // Check if the cell is valid
            if (!validateCell(row, col)) {
                return false;
            }
        }
    }
    
    // If we get here, the puzzle is complete and correct
    stopTimer();
    document.getElementById('status-message').textContent = 'Congratulations! You solved the puzzle!';
    return true;
}

// Solve the current puzzle
function solvePuzzle() {
    // Copy the solution to the board
    board = JSON.parse(JSON.stringify(solution));
    
    // Update the UI
    updateBoardUI();
    
    // Stop the timer
    stopTimer();
    
    // Update status message
    document.getElementById('status-message').textContent = 'Puzzle solved!';
}

// Timer functions
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    document.getElementById('timer').textContent = `Time: ${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}