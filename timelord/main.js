document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('clockCanvas');
    const ctx = canvas.getContext('2d');
    const optionsDiv = document.getElementById('options');
    const feedbackP = document.getElementById('feedback');
    const progressBarDiv = document.getElementById('progressBar');
    const difficultySelectionDiv = document.getElementById('difficultySelection');

    let difficultyLevel = null;
    let currentHour, currentMinute;
    let correctTime;
    let progress = [];

    // Event listeners for difficulty selection
    document.getElementById('easyBtn').addEventListener('click', () => startGame(1));
    document.getElementById('mediumBtn').addEventListener('click', () => startGame(2));
    document.getElementById('hardBtn').addEventListener('click', () => startGame(3));

    function startGame(level) {
        difficultyLevel = level;
        difficultySelectionDiv.style.display = 'none';
        canvas.style.display = 'block';
        optionsDiv.style.display = 'flex';
        feedbackP.style.display = 'block';
        progressBarDiv.style.display = 'flex';
        progress = [];
        updateProgressBar();
        setupGame();
    }

    function drawClock(hour, minute) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw clock face
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw hour numbers
        for (let i = 1; i <= 12; i++) {
            const angle = (i * Math.PI) / 6;
            const x = 100 + Math.sin(angle) * 75;
            const y = 100 - Math.cos(angle) * 75;
            ctx.fillText(i, x - 5, y + 5);
        }

        // Draw hour hand
        const hourAngle = ((hour % 12) + minute / 60) * Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + Math.sin(hourAngle) * 50, 100 - Math.cos(hourAngle) * 50);
        ctx.stroke();

        // Draw minute hand
        const minuteAngle = (minute * Math.PI) / 30;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(100 + Math.sin(minuteAngle) * 70, 100 - Math.cos(minuteAngle) * 70);
        ctx.stroke();
    }

    function generateRandomTime() {
        let hour = Math.floor(Math.random() * 12);
        let minute;

        switch (difficultyLevel) {
            case 1: // Easy: Whole and half hours
                minute = Math.random() < 0.5 ? 0 : 30;
                break;
            case 2: // Medium: Quarter hours
                const quarter = Math.floor(Math.random() * 4);
                minute = quarter * 15;
                break;
            case 3: // Hard: Any minute
                minute = Math.floor(Math.random() * 60);
                break;
            default:
                minute = 0;
        }
        return { hour, minute };
    }

    function formatTime(hour, minute) {
        const h = hour === 0 ? 12 : hour;
        const m = minute < 10 ? `0${minute}` : minute;
        return `${h}:${m}`;
    }

    function generateOptions(correctTime) {
        const options = new Set([correctTime]);
        while (options.size < 4) {
            let randomHour = Math.floor(Math.random() * 12);
            let randomMinute;

            switch (difficultyLevel) {
                case 1:
                    randomMinute = Math.random() < 0.5 ? 0 : 30;
                    break;
                case 2:
                    const quarter = Math.floor(Math.random() * 4);
                    randomMinute = quarter * 15;
                    break;
                case 3:
                    randomMinute = Math.floor(Math.random() * 60);
                    break;
                default:
                    randomMinute = 0;
            }
            const randomTime = formatTime(randomHour, randomMinute);
            options.add(randomTime);
        }
        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    function setupGame() {
        const time = generateRandomTime();
        currentHour = time.hour;
        currentMinute = time.minute;
        correctTime = formatTime(currentHour, currentMinute);
        drawClock(currentHour, currentMinute);

        const options = generateOptions(correctTime);
        optionsDiv.innerHTML = '';

        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => checkTime(option);
            optionsDiv.appendChild(button);
        });
    }

    function checkTime(selectedTime) {
        const body = document.querySelector('body');
        body.classList.remove('correct-feedback', 'incorrect-feedback');

        if (selectedTime === correctTime) {
            feedbackP.textContent = 'Richtig! Gut gemacht!';
            feedbackP.style.color = 'green';
            body.classList.add('correct-feedback');
            progress.push(true);
            setTimeout(setupGame, 1000);
        } else {
            feedbackP.textContent = 'Das war nicht richtig. Versuche es erneut!';
            feedbackP.style.color = 'red';
            body.classList.add('incorrect-feedback');
            progress.push(false);
        }
        updateProgressBar();
    }

    function updateProgressBar() {
        progressBarDiv.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const circle = document.createElement('span');
            circle.classList.add('progress-circle');
            if (progress[i] === true) {
                circle.classList.add('correct');
            } else if (progress[i] === false) {
                circle.classList.add('incorrect');
            }
            progressBarDiv.appendChild(circle);
        }
    }
});