document.addEventListener('DOMContentLoaded', () => {

    // === ELEMEN DOM ===
    const configBtn = document.getElementById('config-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
	const reloadBtn = document.getElementById('reload-btn');
    const startBtn = document.getElementById('start-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const addDuckBtn = document.getElementById('add-duck-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    const configModal = document.getElementById('config-modal');
    const winnerModal = document.getElementById('winner-modal');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const modeModal = document.getElementById('mode-modal'); 
    const modeGrid = document.querySelector('.mode-grid'); 

    const startScreen = document.getElementById('start-screen');
    const raceTrackScreen = document.getElementById('race-track');
    
    const duckConfigsContainer = document.getElementById('duck-configs-container');
    const startDucksDisplay = document.getElementById('start-ducks-display');
    
    const countdownText = document.getElementById('countdown-text');
    const winnerMessage = document.getElementById('winner-message');

    const raceCanvas = document.getElementById('race-canvas');
    const ctx = raceCanvas.getContext('2d');
    const winnerDuckDisplay = document.getElementById('winner-duck-display');
    const confettiContainer = document.getElementById('confetti-container');

    const playerKeypadsContainer = document.getElementById('player-keypads');
    
    // === STATE GAME ===
    let ducks = []; 
    let isRacing = false;
    let gameLoopId = null;
	let confettiIntervalId = null;
    let selectedOperation = '+'; 

    let canvasWidth = 0;
    let canvasHeight = 0;
    let finishLineX = 0;
    const DUCK_START_X = 50;
    const DUCK_SIZE_PX = 60;

    // === DIUBAH ===
    // Ini bukan lagi 'lompatan', tapi 'tambahan kecepatan'
    const DUCK_ACCELERATION = 0.01; // Sesuai permintaan Anda
    const DUCK_BASE_SPEED = 0.05;   // Kecepatan merayap awal

    // === FUNGSI LOGIKA ===

    function getTextColor(hexcolor){
        try {
            hexcolor = hexcolor.replace("#", "");
            var r = parseInt(hexcolor.substr(0,2),16);
            var g = parseInt(hexcolor.substr(2,2),16);
            var b = parseInt(hexcolor.substr(4,2),16);
            var yiq = ((r*299)+(g*587)+(b*114))/1000;
            return (yiq >= 128) ? '#000000' : '#FFFFFF'; 
        } catch (e) {
            return '#000000'; 
        }
    }
	
    function createFireworkBurst() {
        //... (Kode confetti tetap sama)
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B'];
        const numParticles = 30; 
        const burstX = Math.random() * 60 + 20; 
        const burstY = Math.random() * 60 + 20; 
        for (let i = 0; i < numParticles; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 8 + 4}px`;
            confetti.style.height = `${Math.random() * 12 + 4}px`;
            confetti.style.left = `${burstX}%`;
            confetti.style.top = `${burstY}%`;
            confetti.style.position = 'absolute';
            confetti.style.opacity = Math.random();
            const xEnd = (Math.random() - 0.5) * (Math.random() * 400 + 300); 
            const yEnd = (Math.random() - 0.5) * (Math.random() * 400 + 300);
            confetti.style.setProperty('--x-end', `${xEnd}px`);
            confetti.style.setProperty('--y-end', `${yEnd}px`);
            confetti.style.animation = `explode ${Math.random() * 1 + 1}s ease-out forwards`; 
            confetti.addEventListener('animationend', () => {
                confetti.remove();
            });
            confettiContainer.appendChild(confetti);
        }
    }
    
    function resizeCanvas() {
        const rect = raceCanvas.getBoundingClientRect();
        raceCanvas.width = rect.width;
        raceCanvas.height = rect.height;
        canvasWidth = raceCanvas.width;
        canvasHeight = raceCanvas.height;
        finishLineX = canvasWidth - 60; 
        if (!isRacing) {
            drawStaticRace();
        }
    }
    
    function drawStaticRace() {
        if (canvasWidth === 0 || ducks.length === 0) return;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight); 
        drawFinishLine();
        const trackHeight = canvasHeight / ducks.length;
        ducks.forEach((duck, index) => {
            duck.position = DUCK_START_X; 
            duck.y = (index * trackHeight) + (trackHeight / 2) + (DUCK_SIZE_PX / 3); 
            drawDuck(duck); 
        });
    }

    /**
     * === FUNGSI INI TELAH DIPERBARUI ===
     * Menambahkan duck.speed
     */
    function loadSettings() {
        const savedDucks = localStorage.getItem('duckRaceSettings');
        if (savedDucks) {
            ducks = JSON.parse(savedDucks);
        } else {
            ducks = [
                { id: 1, name: 'Bebek 1', color: '#140f6d' },
                { id: 2, name: 'Bebek 2', color: '#840725' }
            ];
        }
        ducks.forEach(duck => {
            duck.position = 0;
            duck.y = 0;
            duck.currentAnswer = ''; 
            duck.correctAnswer = 0;  
            duck.speed = DUCK_BASE_SPEED; // BARU: Tambahkan kecepatan dasar
        });
        renderDucksOnStartScreen();
    }

    function renderDucksOnStartScreen() {
		startDucksDisplay.innerHTML = '';
		ducks.forEach(duck => {
			const duckIcon = document.createElement('span');
			duckIcon.innerText = '🦆'; // DIPERBAIKI
			duckIcon.style.color = duck.color;
			startDucksDisplay.appendChild(duckIcon);
		});
	}

    function populateConfigModal() {
        duckConfigsContainer.innerHTML = '';
        ducks.forEach(duck => {
            addConfigBlock(duck);
        });
    }

    function addConfigBlock(duck = null) {
        //... (Kode tetap sama)
        const duckId = duck ? duck.id : Date.now();
        const duckName = duck ? duck.name : `Bebek ${ducks.length + 1}`;
        const duckColor = duck ? duck.color : '#ffffff';
        const configHTML = `
            <div class="duck-config-item" data-id="${duckId}">
                <h3>
                    <span>Pengaturan Bebek</span>
                    <button class="btn-danger remove-duck-btn">Hapus</button>
                </h3>
                <div class="config-grid">
                    <div>
                        <label>Nama Bebek:</label>
                        <input type="text" class="config-name" value="${duckName}">
                    </div>
                    <div>
                        <label>Warna Bebek:</label>
                        <input type="color" class="config-color" value="${duckColor}">
                    </div>
                    </div>
            </div>
        `;
        duckConfigsContainer.insertAdjacentHTML('beforeend', configHTML);
    }

    /**
     * === FUNGSI INI TELAH DIPERBARUI ===
     * Menambahkan duck.speed
     */
    function saveSettings() {
        const newDucks = [];
        const configItems = duckConfigsContainer.querySelectorAll('.duck-config-item');
        configItems.forEach((item, index) => {
            newDucks.push({
                id: index + 1, 
                name: item.querySelector('.config-name').value,
                color: item.querySelector('.config-color').value,
                position: 0, 
                y: 0,
                currentAnswer: '', 
                correctAnswer: 0,
                speed: DUCK_BASE_SPEED // BARU: Tambahkan saat menyimpan
            });
        });
        ducks = newDucks;
        localStorage.setItem('duckRaceSettings', JSON.stringify(ducks));
        renderDucksOnStartScreen();
        hideModal(configModal);
    }
    
    function showModal(modalEl) { modalEl.classList.add('active'); }
    function hideModal(modalEl) { modalEl.classList.remove('active'); }

    function startCountdown() {
        startScreen.classList.remove('active');
        raceTrackScreen.classList.add('active');
        
        createPlayerKeypads();
        playerKeypadsContainer.classList.remove('hidden');

        showModal(countdownOverlay);

        setTimeout(() => {
            resizeCanvas(); 
        }, 0); 

        let count = 3;
        countdownText.innerText = count;

        const timer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.innerText = count;
            } else if (count === 0) {
                countdownText.innerText = 'MULAI!';
            } else {
                clearInterval(timer);
                hideModal(countdownOverlay);
                startGame();
            }
        }, 1000);
    }

    function startGame() {
        isRacing = true;
        
        ducks.forEach((duck, index) => {
            duck.position = DUCK_START_X;
            generateMathProblem(duck.id);
        });
        
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function drawDuck(duck) {
        ctx.save();
		ctx.translate(duck.position, duck.y); 
		ctx.scale(-1, 1); 
		ctx.fillStyle = duck.color;
		ctx.font = `${DUCK_SIZE_PX}px Arial`;
		ctx.textAlign = 'center';
		ctx.fillText('🦆', 0, 0); // DIPERBAIKI
		ctx.restore();
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const textMetrics = ctx.measureText(duck.name);
        const textWidth = textMetrics.width + 10; 
        const textHeight = 20; 
        const labelY = duck.y + (DUCK_SIZE_PX / 2) - textHeight + 5; 
        const rectX = duck.position - (textWidth / 2);
        const rectY = labelY - textHeight + 4;
        ctx.fillStyle = duck.color; 
        ctx.fillRect(rectX, rectY, textWidth, textHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(rectX, rectY, textWidth, textHeight);
        ctx.fillStyle = getTextColor(duck.color); 
        ctx.fillText(duck.name, duck.position, labelY);
    }

    function drawFinishLine() {
        //... (Kode tetap sama)
        ctx.save();
        const squareSize = 10; 
        const stripWidth = 40; 
        for (let y = 0; y < canvasHeight; y += squareSize) {
            for (let x = finishLineX; x < finishLineX + stripWidth; x += squareSize) {
                let col = (x - finishLineX) / squareSize;
                let row = y / squareSize;
                if ((Math.floor(col) + Math.floor(row)) % 2 === 0) {
                    ctx.fillStyle = '#FFFFFF'; 
                } else {
                    ctx.fillStyle = '#000000'; 
                }
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
        ctx.restore();
    }

    
    function gameLoop() {
        if (!isRacing) return;
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawFinishLine();
        
        let winner = null;
        
        for (const duck of ducks) {
            
            // === BARIS INI HILANG ===
            // Terapkan kecepatan bebek ke posisinya
            duck.position += duck.speed; 
            // === AKHIR PERBAIKAN ===

            drawDuck(duck);
            
            const duckRightEdge = duck.position + (DUCK_SIZE_PX / 2);
            if (!winner && duckRightEdge >= finishLineX) {
                winner = duck;
            }
        }
        
        if (winner) {
            endGame(winner);
        } else {
            gameLoopId = requestAnimationFrame(gameLoop); 
        }
    }

    function endGame(winnerDuck) {
        isRacing = false;
		cancelAnimationFrame(gameLoopId);
		winnerMessage.innerText = `🎉 ${winnerDuck.name} MENANG! 🎉`; // DIPERBAIKI
		winnerDuckDisplay.innerHTML = '🦆'; // DIPERBAIKI
		winnerDuckDisplay.style.color = winnerDuck.color;

		showModal(winnerModal);
        createFireworkBurst(); 
        confettiIntervalId = setInterval(createFireworkBurst, 800);
    }

    /**
     * === FUNGSI INI TELAH DIPERBARUI ===
     * Mereset duck.speed
     */
    function resetGame() {
        hideModal(winnerModal);
        hideModal(modeModal);
        raceTrackScreen.classList.remove('active');
        startScreen.classList.add('active');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        clearInterval(confettiIntervalId);
        confettiContainer.innerHTML = '';
        winnerDuckDisplay.innerHTML = '';
        playerKeypadsContainer.classList.add('hidden');
        playerKeypadsContainer.innerHTML = ''; 
        ducks.forEach(duck => {
            duck.position = 0;
            duck.currentAnswer = '';
            duck.correctAnswer = 0;
            duck.speed = DUCK_BASE_SPEED; // BARU: Reset kecepatan
        });

        isRacing = false; 
    }

    async function generateMathProblem(duckId) {
        const duck = ducks.find(d => d.id === duckId);
        if (!duck) return;

        const keypadEl = document.querySelector(`.player-keypad[data-duck-id="${duckId}"]`);
        const questionEl = keypadEl.querySelector('.keypad-question');
        const answerEl = keypadEl.querySelector('.keypad-answer-display');

        // Tampilkan "Loading..."
        questionEl.innerText = 'Loading...';

        try {
            // Panggil server Python kita di /api/problem
            // Kirim mode yang dipilih (misal: '+', '*') sebagai parameter URL
            const response = await fetch(`/api/problem?op=${selectedOperation}`);
            const data = await response.json();

            // Simpan jawaban yang benar dari server
            duck.correctAnswer = data.answer;
            duck.currentAnswer = ''; 
            
            // Tampilkan soal baru dari server
            if (keypadEl) {
                questionEl.innerText = data.question; // Tampilkan soal
                answerEl.innerText = '';
                keypadEl.classList.remove('shake'); 
            }
        
        } catch (error) {
            console.error('Gagal mengambil soal:', error);
            questionEl.innerText = 'Error!'; // Tampilkan error jika gagal
        }
    }

    function createPlayerKeypads() {
        //... (Kode tetap sama)
        playerKeypadsContainer.innerHTML = ''; 
        ducks.forEach(duck => {
            const keypadEl = document.createElement('div');
            keypadEl.classList.add('player-keypad');
            keypadEl.dataset.duckId = duck.id;
            keypadEl.style.borderColor = duck.color; 
            const textColor = getTextColor(duck.color);
            keypadEl.innerHTML = `
                <div class="keypad-header" style="background-color: ${duck.color}; color: ${textColor};">
                    <span class="keypad-question">Loading...</span>
                </div>
                <div class="keypad-answer-display"></div>
                <div class="keypad-buttons">
                    <button class="keypad-button" data-value="1">1</button>
                    <button class="keypad-button" data-value="2">2</button>
                    <button class="keypad-button" data-value="3">3</button>
                    <button class="keypad-button" data-value="4">4</button>
                    <button class="keypad-button" data-value="5">5</button>
                    <button class="keypad-button" data-value="6">6</button>
                    <button class="keypad-button" data-value="7">7</button>
                    <button class="keypad-button" data-value="8">8</button>
                    <button class="keypad-button" data-value="9">9</button>
                    <button class="keypad-button clear-btn" data-value="clear">C</button>
                    <button class="keypad-button" data-value="0">0</button>
                    <button class="keypad-button submit-btn" data-value="submit">Go</button>
                </div>
            `;
            playerKeypadsContainer.appendChild(keypadEl);
        });
		playerKeypadsContainer.addEventListener('touchstart', handleKeypadInput);
    }

    function handleKeypadInput(e) {
        //... (Kode tetap sama)
        if (!isRacing) return;
        e.preventDefault();
        for (let touch of e.changedTouches) {
            const button = touch.target.closest('.keypad-button');
            if (!button) continue; 
            
            // PERBAIKAN TYPO KECIL: .closest('.player-keypad') bukan .closest('.player-keypad-keypad')
            const keypadEl = button.closest('.player-keypad'); 
            if (!keypadEl) continue; // Tambahkan penjaga jika null

            const duckId = parseInt(keypadEl.dataset.duckId);
            const duck = ducks.find(d => d.id === duckId);
            if (!duck) continue;
            const value = button.dataset.value;
            const answerDisplay = keypadEl.querySelector('.keypad-answer-display');
            if (value === 'clear') {
                duck.currentAnswer = '';
            } else if (value === 'submit') {
                if (navigator.vibrate) navigator.vibrate(50); 
                checkAnswer(duckId);
            } else {
                if (duck.currentAnswer.length < 3) { 
                    duck.currentAnswer += value;
                }
            }
            answerDisplay.innerText = duck.currentAnswer;
        }
    }

    /**
     * === FUNGSI INI TELAH DIPERBARUI ===
     * Mengganti lompatan dengan akselerasi
     */
    function checkAnswer(duckId) {
        const duck = ducks.find(d => d.id === duckId);
        if (!duck) return;
        
        const userAnswer = parseInt(duck.currentAnswer);
        const keypadEl = document.querySelector(`.player-keypad[data-duck-id="${duckId}"]`);
        
        if (userAnswer === duck.correctAnswer) {
            // DIUBAH: Tidak lagi melompat
            // duck.position += DUCK_SPEED_BOOST; 
            
            // DIUBAH: Menambah kecepatan merayap
            duck.speed += DUCK_ACCELERATION; 
            
            console.log(`${duck.name} speed increased to ${duck.speed}`);
            generateMathProblem(duck.id); 
        } else {
            keypadEl.classList.add('shake');
            setTimeout(() => {
                keypadEl.classList.remove('shake');
            }, 500);
            duck.currentAnswer = ''; 
            keypadEl.querySelector('.keypad-answer-display').innerText = ''; 
        }
    }

    function toggleFullScreen() {
        //... (Kode tetap sama)
        const fullScreenTarget = document.documentElement; 
        if (!document.fullscreenElement &&
            !document.mozFullScreenElement && 
            !document.webkitFullscreenElement && 
            !document.msFullscreenElement) {
            if (fullScreenTarget.requestFullscreen) {
                fullScreenTarget.requestFullscreen();
            } else if (fullScreenTarget.mozRequestFullScreen) { 
                fullScreenTarget.mozRequestFullScreen();
            } else if (fullScreenTarget.webkitRequestFullscreen) { 
                fullScreenTarget.webkitRequestFullscreen();
            } else if (fullScreenTarget.msRequestFullscreen) { 
                fullScreenTarget.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { 
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { 
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { 
                document.msExitFullscreen();
            }
        }
    }

    // === EVENT LISTENERS ===
    configBtn.addEventListener('click', () => {
        populateConfigModal();
        showModal(configModal);
    });
    fullscreenBtn.addEventListener('click', toggleFullScreen);
	reloadBtn.addEventListener('click', resetGame); // DIPERBAIKI
    
    startBtn.addEventListener('click', () => {
        showModal(modeModal);
    }); 
    
    playAgainBtn.addEventListener('click', resetGame);

    modeGrid.addEventListener('click', (e) => {
        const modeBtn = e.target.closest('.mode-card'); 
        if (!modeBtn) return; 

        selectedOperation = modeBtn.dataset.op; 
        hideModal(modeModal); 
        startCountdown(); 
    });

    addDuckBtn.addEventListener('click', () => {
        if (ducks.length >= 5) { 
            alert('Maksimal hanya 5 bebek yang bisa ditambahkan.');
            return;
        }
        addConfigBlock();
    });
    
    duckConfigsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-duck-btn')) {
            if (duckConfigsContainer.children.length > 1) {
                e.target.closest('.duck-config-item').remove();
            } else {
                alert('Harus ada minimal 1 bebek.');
            }
        }
    });

    saveBtn.addEventListener('click', saveSettings);
    cancelBtn.addEventListener('click', () => hideModal(configModal));
    window.addEventListener('resize', resizeCanvas);


    // === INISIALISASI ===
    loadSettings();
    resizeCanvas();
});