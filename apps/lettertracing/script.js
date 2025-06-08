document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tracingCanvas');
    const ctx = canvas.getContext('2d');
    const currentLetterSpan = document.getElementById('currentLetter');
    const feedbackP = document.getElementById('feedback');
    const nextButton = document.getElementById('nextButton');

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let currentLetterIndex = 0;
    let isDrawing = false;
    let outlineImageData;

    function drawLetterOutline(letter) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 10;
        ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
        outlineImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function startDrawing(e) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function draw(e) {
        if (!isDrawing) return;
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'black';
        ctx.lineCap = 'round';
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
    }

    function endDrawing() {
        isDrawing = false;
        const drawingImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let overlapPixels = 0;
        let outlinePixelsCount = 0;

        for (let i = 0; i < outlineImageData.data.length; i += 4) {
            if (outlineImageData.data[i + 3] !== 0) {
                outlinePixelsCount++;
                if (drawingImageData.data[i + 3] !== 0) {
                    overlapPixels++;
                }
            }
        }

        if (outlinePixelsCount > 0) {
            const overlapPercentage = (overlapPixels / outlinePixelsCount) * 100;
            const successThreshold = 60; // Increased threshold significantly
            console.log(`Overlap Percentage: ${overlapPercentage.toFixed(2)}%`); // Debugging output

            if (overlapPercentage > successThreshold) {
                feedbackP.textContent = 'Good job tracing!';
                feedbackP.style.color = 'green';
                nextButton.disabled = false;
            } else {
                feedbackP.textContent = `Try tracing more closely! Accuracy: ${overlapPercentage.toFixed(0)}%`;
                feedbackP.style.color = 'red';
            }
        } else {
            feedbackP.textContent = 'Error: Could not analyze tracing.';
            feedbackP.style.color = 'orange';
        }
    }

    function nextLetter() {
        currentLetterIndex = (currentLetterIndex + 1) % letters.length;
        currentLetterSpan.textContent = letters[currentLetterIndex];
        drawLetterOutline(letters[currentLetterIndex]);
        feedbackP.textContent = '';
        nextButton.disabled = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawLetterOutline(letters[currentLetterIndex]);
    }

    // Initial setup
    currentLetterSpan.textContent = letters[currentLetterIndex];
    drawLetterOutline(letters[currentLetterIndex]);

    // Event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseout', endDrawing);

    // Touch event listeners
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrawing({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    });
    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        draw({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        e.preventDefault();
    });
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchcancel', endDrawing);

    nextButton.addEventListener('click', nextLetter);
});