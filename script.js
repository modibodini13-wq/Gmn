// Définition des variables d'état du jeu
let maxRange = 100;
let maxAttempts = 10;
let targetNumber = 0;
let attemptsLeft = 0;
let attemptsUsed = 0;
let selectedDifficulty = 'easy';
let isGameOver = false;

// Configurations de jeu selon la difficulté
const configs = {
    easy: { max: 100, attempts: 10 },
    medium: { max: 500, attempts: 7 },
    hard: { max: 1000, attempts: 5 }
};

// Récupération des éléments du DOM
const setupSection = document.getElementById('setupSection');
const gameSection = document.getElementById('gameSection');
const diffButtons = document.querySelectorAll('.diff-btn');
const startGameBtn = document.getElementById('startGameBtn');

const attemptsLeftEl = document.getElementById('attemptsLeft');
const highScoreEl = document.getElementById('highScore');
const rangeInstruction = document.getElementById('rangeInstruction');
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const feedbackMessage = document.getElementById('feedbackMessage');
const gameOverControls = document.getElementById('gameOverControls');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const guessHistoryEl = document.getElementById('guessHistory');

// Initialisation de l'application
init();

function init() {
    // Écouteur sur les boutons de difficulté
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDifficulty = btn.dataset.diff;
        });
    });

    // Contrôles principaux
    startGameBtn.addEventListener('click', startGame);
    guessBtn.addEventListener('click', handleGuess);
    
    // Possibilité de valider avec la touche Entrée du clavier
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGuess();
    });

    restartBtn.addEventListener('click', resetGame);
    menuBtn.addEventListener('click', showMenu);

    // Charger le meilleur score existant par défaut
    updateHighScoreDisplay();
}

function startGame() {
    const config = configs[selectedDifficulty];
    maxRange = config.max;
    maxAttempts = config.attempts;
    attemptsLeft = maxAttempts;
    attemptsUsed = 0;
    isGameOver = false;

    // Génération du nombre mystère (compris entre 1 et maxRange)
    targetNumber = Math.floor(Math.random() * maxRange) + 1;

    // Mise à jour de l'interface graphique
    setupSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    gameOverControls.classList.add('hidden');
    
    guessBtn.disabled = false;
    guessInput.disabled = false;
    guessInput.value = '';
    guessInput.focus();

    // Application dynamique des limites d'entrée
    guessInput.max = maxRange;
    rangeInstruction.textContent = `Entrez un nombre entre 1 et ${maxRange} :`;
    attemptsLeftEl.textContent = attemptsLeft;
    
    // Nettoyage de l'état précédent
    guessHistoryEl.innerHTML = '';
    resetFeedback();
    updateHighScoreDisplay();
}

function handleGuess() {
    if (isGameOver) return;

    const userGuessValue = guessInput.value.trim();

    // Alerte si l'utilisateur soumet sans rien écrire
    if (userGuessValue === '') {
        showFeedback('Oups ! Veuillez saisir un nombre.', 'feedback-neutral');
        return;
    }

    const guess = parseInt(userGuessValue, 10);

    // Validation des limites autorisées
    if (isNaN(guess) || guess < 1 || guess > maxRange) {
        showFeedback(`Entrez un nombre valide entre 1 et ${maxRange}.`, 'feedback-neutral');
        return;
    }

    attemptsUsed++;
    attemptsLeft--;
    attemptsLeftEl.textContent = attemptsLeft;

    // Vérification du résultat
    if (guess === targetNumber) {
        handleWin();
    } else if (attemptsLeft <= 0) {
        handleLose();
    } else {
        const direction = guess < targetNumber ? 'plus' : 'moins';
        const feedbackClass = guess < targetNumber ? 'feedback-too-low' : 'feedback-too-high';
        const message = guess < targetNumber ? 'C\'est PLUS grand ! 📈' : 'C\'est MOINS grand ! 📉';
        
        showFeedback(message, feedbackClass);
        addToHistory(guess, direction);
    }

    guessInput.value = '';
    guessInput.focus();
}

function handleWin() {
    isGameOver = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    showFeedback(`🎉 BRAVO ! Le juste prix était bien ${targetNumber} ! Trouvé en ${attemptsUsed} essai(s).`, 'feedback-win');
    saveHighScore();
    showGameOverControls();
}

function handleLose() {
    isGameOver = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    showFeedback(`💥 Perdu ! Vous n'avez plus d'essais. Le juste prix était ${targetNumber}.`, 'feedback-lose');
    showGameOverControls();
}

function showFeedback(message, className) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = ''; // Nettoyage complet
    feedbackMessage.classList.add(className);
}

function resetFeedback() {
    feedbackMessage.textContent = 'Bonne chance ! Faites votre première proposition.';
    feedbackMessage.className = 'feedback-neutral';
}

function addToHistory(guess, direction) {
    const li = document.createElement('li');
    li.classList.add('history-item');
    
    if (direction === 'plus') {
        li.classList.add('too-low');
        li.innerHTML = `<span>${guess}</span><span class="arrow">📈 Plus</span>`;
    } else {
        li.classList.add('too-high');
        li.innerHTML = `<span>${guess}</span><span class="arrow">📉 Moins</span>`;
    }
    
    // Insère le nouvel essai en haut de la liste pour éviter d'avoir à faire défiler l'historique
    guessHistoryEl.insertBefore(li, guessHistoryEl.firstChild);
}

function showGameOverControls() {
    gameOverControls.classList.remove('hidden');
}

function resetGame() {
    startGame();
}

function showMenu() {
    gameSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
}

// Système de sauvegarde des meilleurs scores (High Score) via LocalStorage
function saveHighScore() {
    const currentRecord = localStorage.getItem(`highScore_${selectedDifficulty}`);
    
    // Moins d'essais utilisés = meilleur score
    if (!currentRecord || attemptsUsed < parseInt(currentRecord, 10)) {
        localStorage.setItem(`highScore_${selectedDifficulty}`, attemptsUsed);
        updateHighScoreDisplay();
    }
}

function updateHighScoreDisplay() {
    const record = localStorage.getItem(`highScore_${selectedDifficulty}`);
    if (record) {
        highScoreEl.textContent = `${record} ${parseInt(record, 10) === 1 ? 'essai' : 'essais'}`;
    } else {
        highScoreEl.textContent = '-';
    }
}
