document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('tracingCanvas');
  const ctx = canvas.getContext('2d');
  const currentLetterSpan = document.getElementById('currentLetter');
  const feedbackP = document.getElementById('feedback');
  const nextButton = document.getElementById('nextButton');
  const retryButton = document.getElementById('retryButton');

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let currentLetterIndex = 0;
  let isDrawing = false;
  let outlineImageData;
  
  // Neue Variablen zur Messung der gezeichneten Linie
  let totalDrawingLength = 0;
  let lastX = 0, lastY = 0;
  const MIN_DRAWING_LENGTH = 100; // Mindestlänge, die gezeichnet werden muss

  function getRelativePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

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
    const pos = getRelativePos(e);
    lastX = pos.x;
    lastY = pos.y;
    totalDrawingLength = 0;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    const pos = getRelativePos(e);
    // Berechne die Distanz vom letzten Punkt
    const dx = pos.x - lastX;
    const dy = pos.y - lastY;
    totalDrawingLength += Math.sqrt(dx * dx + dy * dy);
    lastX = pos.x;
    lastY = pos.y;

    ctx.lineWidth = 10;
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDrawing() {
    if (!isDrawing) return;
    isDrawing = false;

    // Falls die gezeichnete Strecke zu kurz ist, gib eine Fehlermeldung aus.
    if (totalDrawingLength < MIN_DRAWING_LENGTH) {
      feedbackP.textContent = 'Bitte zeichne den Buchstaben vollständiger nach!';
      feedbackP.style.color = 'red';
      return;
    }

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
      const successThreshold = 60; // Erfolgs-Schwelle

      console.log(`Overlap Percentage: ${overlapPercentage.toFixed(2)}%`); // Debug

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
    feedbackP.textContent = '';
    nextButton.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLetterOutline(letters[currentLetterIndex]);
  }

  function retryLetter() {
    feedbackP.textContent = '';
    nextButton.disabled = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLetterOutline(letters[currentLetterIndex]);
  }

  // Initiales Setup
  currentLetterSpan.textContent = letters[currentLetterIndex];
  drawLetterOutline(letters[currentLetterIndex]);

  // Event Listener für Maus-Events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDrawing);
  canvas.addEventListener('mouseout', endDrawing);

  // Touch-Events
  canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startDrawing({ clientX: touch.clientX, clientY: touch.clientY });
  });
  canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
    e.preventDefault();
  });
  canvas.addEventListener('touchend', endDrawing);
  canvas.addEventListener('touchcancel', endDrawing);

  nextButton.addEventListener('click', nextLetter);
  retryButton.addEventListener('click', retryLetter);
});
