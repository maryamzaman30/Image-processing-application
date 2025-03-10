let mode = 'image_processing';  // Initially start in image processing mode

let webcam;
let capturedImage = null;
let redSlider, greenSlider, blueSlider;
let yuvThresholdSlider, hsiThresholdSlider;

// Help in face detecting taken from the approach & code shown in the course (in Week 19)
let detector, faces;

let selectedEffect = 'none';
let w = 160;
let h = 120;

// Game Variables
var gameChar_x, gameChar_y, floorPos_y;
var isLeft = false, isRight = false, isFalling = false, isPlummeting = false;
var isFound = false, pitted = false, inContact = false;
var cameraPosX, game_score, lives, gameEnd;
var canyon, collectable, clouds, mountains, treePos_y, trees_x, flagpole, platforms, enemies;
var enemiesSound, birdsSound, jumpSound, collectCollectableSound, fallingSound;

var video;
var faceDetector;
var faceDetected = false;
var faceX, faceY, faceW, faceH;
var detectionFrequency = 7; // Detect face every 10 frames
var frameCounter = 0;

function preload() 
{
	// Load sounds before the game starts
    /* loading sounds here. All the sounds that I have taken are from a website 
	provided by Coursera and all sounds used belongs to respective owners
	Website is freesound.org */
	soundFormats('mp3');
	jumpSound = loadSound('assets/jump.mp3');
	jumpSound.setVolume(0.1);
	collectCollectableSound = loadSound('assets/Collecting.mp3');
	collectCollectableSound.setVolume(2.0);
	fallingSound = loadSound('assets/Canyonfall.mp3');
	fallingSound.setVolume(0.5);
	enemiesSound = loadSound('assets/Enemy.mp3');
	enemiesSound.setVolume(5.15);
	birdsSound = loadSound('assets/Birds.mp3');
	birdsSound.setVolume(0.5);
}

/**
 * p5.js setup function.
 * Initializes the canvas, webcam, sliders, and other components.
 */
function setup() 
{
  createCanvas(870, 700);

    // Initialize webcam capture
	webcam = createCapture(VIDEO);
	webcam.size(640, 480);
	webcam.hide(); // Hide the default webcam video element

	// Set up keyboard event listener for capturing image
	window.addEventListener('keydown', function(event) 
	{
		if (event.code === 'Space') 
		{
			captureImage(); // Capture image when spacebar is pressed
		}
	});

	// Create sliders for thresholding
	redSlider = createSlider(0, 255, 127);
	redSlider.position(10, 400);
	greenSlider = createSlider(0, 255, 127);
	greenSlider.position(195, 400);
	blueSlider = createSlider(0, 255, 127);
	blueSlider.position(375, 400);

	// Sliders for YUV and HSI thresholding
	yuvThresholdSlider = createSlider(0, 255, 127);
	yuvThresholdSlider.position(195, 680);
	hsiThresholdSlider = createSlider(0, 255, 127);
	hsiThresholdSlider.position(375, 680);

	// Setup face detection
	setupFaceDetect();

	// Setup game-related variables (initialization moved to a separate function)
	setupGame();
}

/**
 * Main draw loop for the application.
 * Updates the display based on the current mode.
 */
function draw() 
{
    // Clear the background
    background(220);
  
    // Check the current mode and call the appropriate function
    if (mode === 'image_processing') 
    {
        drawImageProcessing(); // Draw the image processing interface and results
    } 
    else if (mode === 'game') 
    {
        drawGame(); // Draw the game scene and handle game logic
    }
}

/**
 * Handles key press events for switching effects and modes.
 * Also delegates to game-specific key handling if in game mode.
 */
function keyPressed() 
{
    // Handle effect selection
    if (key === '1') 
    {
        selectedEffect = 'none'; // No effect
    } 
    else if (key === '2') 
    {
        selectedEffect = 'grayscale'; // Apply grayscale effect
    } 
    else if (key === '3') 
    {
        selectedEffect = 'blurred'; // Apply blur effect
    } 
    else if (key === '4') 
    {
        selectedEffect = 'ycbcr'; // Apply YCbCr effect
    } 
    else if (key === '5') 
    {
        selectedEffect = 'pixelate'; // Apply pixelate effect
    } 
    // Toggle between game and image processing modes
    else if (key === '6') 
    {
        if (mode === 'image_processing') 
        {
            mode = 'game'; // Switch to game mode
            switchToGameMode(); // Initialize game mode
        } 
        else 
        {
            mode = 'image_processing'; // Switch to image processing mode
            switchToImageProcessingMode(); // Initialize image processing mode
        }
    }
  
    // If in game mode, handle game-specific key events
    if (mode === 'game') 
    {
        gameKeyPressed(); // Handle game controls
    }
}

/*
1 - Discuss your findings e.g. image thresholding using each colour channel

a - Commentary on Thresholding (R, G, B):
Thresholding each color channel (R, G, B) separately gives different results because each channel captures distinct color information. 
For example, the red channel focuses on red intensities, while green and blue emphasize their respective colors. This can lead to 
uneven or noisy images, as certain features are only visible in one channel, and adjusting the threshold for each channel affects 
different parts of the image.

b - Thresholding Using Colour Space Conversion (YUV, HSI):
When thresholding in YUV and HSI, the results are smoother compared to RGB. This is because YUV separates brightness (Y) from color 
information (U, V), allowing us to apply thresholds based on brightness, making the image less noisy. In HSI, we can isolate 
intensity (I) from hue and saturation, providing clearer results without interference from color variations.

c - Comparison to RGB Thresholding:
Compared to RGB, thresholding in YUV and HSI is cleaner and less noisy. In RGB, color variations can introduce unwanted noise, 
but in YUV and HSI, focusing on brightness or intensity gives more consistent outcomes.

2 - What problems have you faced and were you able to solve them?

In the extension, one of the major issues I encountered was implementing the face detection feature using the webcam, where a character 
has to move based on face detected on webcam. I spent a significant amount of time researching and eventually managed to implement it.

Another challenge in the extension was optimizing the game’s performance. With so many elements on the screen, the game was initially 
slow. I had to refactor my code, reduce the size of the code file, experiment with different values for the speed of the character and 
other game elements, and also experiment with different values for detection frequency to ensure a smooth gaming experience. After 
several iterations, I was able to achieve a significant improvement in performance. The game is still slow, but it is playable, 
enjoyable, and better than before.

3 - Were you on target to successfully complete your project? If not, how would you address the issue/s and do things differently?

The project was successful in terms of code organisation, I have used more OOP principles in this than in my midterm and also commenting
is better and exactly done in a way known as 'Google style guides' that was asked of from me in my midterm feedback.

In the extension, the game is still slow. If I had more time and had time to learn more skills, then I would try to make the game 
play & performance even smoother and better.

4 - Also discuss your extension and why it is a unique idea

For my extension, I have reused the game & its code from my previous project from a course named "CM1005 Introduction to Programming I".
Then I made major changes to the game. This code extends this game by introducing facial recognition through a webcam feed, The 
character's movement is influenced by face detection, which occurs every few frames. When a face is detected, the game's left and 
right movement controls are based on the face's position within the camera frame.

The idea of integrating face detection into a classic 2D platformer is unique because it shifts the standard keyboard control to a more 
immersive and interactive experience where the player's physical presence influences gameplay.

words limit: 489 (excluding 1 to 4 task statements & sub-statements in task 1, which is from a to c)
*/