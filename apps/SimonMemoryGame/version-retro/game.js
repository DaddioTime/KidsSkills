var buttonColours = ["red", "blue", "green", "yellow"];
var gamePattern = [];
var userClickedPattern = [];
var started = false;
var level = 0;
var acceptingInput = false;

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("start-btn").addEventListener("click", function() {
    if (!started) {
      document.getElementById("start-btn").style.display = "none";
      document.getElementById("level-title").textContent = "Level " + level;
      setTimeout(function() {
        nextSequence();
        started = true;
      }, 2000); // 1-2 Sekunden Wartezeit vor dem Start
    }
  });

  var buttons = document.getElementsByClassName("btn");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function() {
      if (!started || !acceptingInput) return; // Klicks ignorieren, wenn das Spiel nicht gestartet ist oder die Sequenz abgespielt wird
      var userChosenColour = this.id;
      userClickedPattern.push(userChosenColour);
      playSound(userChosenColour);
      animatePress(userChosenColour);
      checkAnswer(userClickedPattern.length - 1);
    });
  }
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      setTimeout(function() {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("wrong");
    document.body.classList.add("game-over");
    document.getElementById("level-title").textContent = "Game Over, Press Start to Restart";
    setTimeout(function() {
      document.body.classList.remove("game-over");
    }, 200);
    startOver();
  }
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  acceptingInput = false;
  document.getElementById("start-btn").style.display = "inline-block";
}

function nextSequence() {
  acceptingInput = false;
  userClickedPattern = [];
  level++;
  document.getElementById("level-title").textContent = "Level " + level;
  var randomNumber = Math.floor(Math.random() * 4);
  var randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);
  playSequence();
}

function playSequence() {
  acceptingInput = false;
  let i = 0;
  let interval = setInterval(function() {
    var button = document.getElementById(gamePattern[i]);
    animatePress(gamePattern[i]);
    playSound(gamePattern[i]);
    i++;
    if (i >= gamePattern.length) {
      clearInterval(interval);
      acceptingInput = true; // Nach dem Abspielen der Sequenz können Eingaben akzeptiert werden
    }
  }, 600); // Zeitintervall zwischen den Farben
}

function playSound(name) {
  var audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

function animatePress(currentColor) {
  var button = document.getElementById(currentColor);
  button.classList.add("pressed");
  setTimeout(function() {
    button.classList.remove("pressed");
  }, 100);
}