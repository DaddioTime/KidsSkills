# Simon Classic
A web-based rendition of the timeless Simon game, developed with HTML, CSS, and JavaScript.

## Technologies Used
Simon Classic was crafted using HTML, CSS, and plain JavaScript. High scores are stored in a database hosted on Google's Firebase. The project uses PNG images for the game board and MP3 files for sound effects.

## Approach Taken / Features
The development started with a simple foundation, gradually adding features. The initial steps included designing the game board and implementing it with HTML and CSS. The core functionalities were then coded, which involved:

- A 'Start' button to initiate the game
- Generating a random sequence for the player to mimic
- Displaying the sequence with animated buttons
- Listening for 'click' events on the game buttons
- Animating buttons when clicked
- Comparing the user's input with the generated sequence
- Tracking the player's score

Once these fundamental features were established, more advanced functionalities were added to enhance the game experience, such as:

- Sound effects for button presses and incorrect moves
- An introductory animation when the game loads
- Increasing the playback speed of the sequence as the game advances
- Integrating Firebase to store high scores

## Demo
A live demo of the Simon Game is available at [https://daddiotime-simonmemorygame.netlify.app/version-classic/index.html](https://daddiotime-simonmemorygame.netlify.app/version-classic/).