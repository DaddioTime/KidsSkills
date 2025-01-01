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
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const clockRadius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Clock face
        ctx.beginPath();
        ctx.arc(centerX, centerY, clockRadius, 0, 2 * Math.PI);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Hour markings (Ticks)
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * (Math.PI / 180);
            const startX = centerX + Math.cos(angle) * (clockRadius * 0.9);
            const startY = centerY + Math.sin(angle) * (clockRadius * 0.9);
            const endX = centerX + Math.cos(angle) * clockRadius;
            const endY = centerY + Math.sin(angle) * clockRadius;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Hour numbers
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 1; i <= 12; i++) {
            const angle = (i * 30 - 90) * (Math.PI / 180); // Adjusted angle to start from 12
            const x = centerX + Math.cos(angle) * (clockRadius * 0.75); // Position numbers slightly inside the ticks
            const y = centerY + Math.sin(angle) * (clockRadius * 0.75);
            ctx.fillText(i.toString(), x, y);
        }

        // Hour hand
        const hourAngle = ((hour % 12) + minute / 60) * 30 * (Math.PI / 180);
        const hourHandLength = clockRadius * 0.6;
        const hourX = centerX + Math.cos(hourAngle - Math.PI / 2) * hourHandLength;
        const hourY = centerY + Math.sin(hourAngle - Math.PI / 2) * hourHandLength;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(hourX, hourY);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Minute hand
        const minuteAngle = minute * 6 * (Math.PI / 180);
        const minuteHandLength = clockRadius * 0.9;
        const minuteX = centerX + Math.cos(minuteAngle - Math.PI / 2) * minuteHandLength;
        const minuteY = centerY + Math.sin(minuteAngle - Math.PI / 2) * minuteHandLength;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(minuteX, minuteY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
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
            button.classList.add('option'); // Add the 'option' class here
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