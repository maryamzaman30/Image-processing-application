/**
 * Switches to the game mode.
 * Resizes the canvas, hides sliders used in image processing, and initializes and starts the game.
 */
function switchToGameMode() 
{
    resizeCanvas(1024, 576); // Set canvas size for game mode
    hideSliders(); // Hide image processing sliders
    setupGame(); // Initialize game
	startGame(); // Start game loop
   
}

/**
 * Hides sliders used for image processing.
 */
function hideSliders() 
{
    redSlider.hide(); // Hide red color threshold slider
    greenSlider.hide(); // Hide green color threshold slider
    blueSlider.hide(); // Hide blue color threshold slider
    yuvThresholdSlider.hide(); // Hide YUV threshold slider
    hsiThresholdSlider.hide(); // Hide HSI threshold slider
}

/**
 * Sets up the game by initializing all game-related objects and variables.
 */
function setupGame() 
{
	// Initialize game variables
    floorPos_y = height * 3 / 4;
    lives = 3;
    pitted = false;
    gameEnd = false;
    game_score = 0;
    cameraPosX = 0;
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    // Initialize all game elements globally
	//The properties of collecting collectible 
    collectables = [
        new Collectable(400, floorPos_y, 40),
        new Collectable(600, floorPos_y, 40),
        new Collectable(800, floorPos_y, 40),
        new Collectable(200, floorPos_y, 40),
        new Collectable(200, floorPos_y - 80, 40),
        new Collectable(1300, floorPos_y - 60, 40),
        new Collectable(2050, floorPos_y - 70, 40),
        new Collectable(2080, floorPos_y - 70, 40),
        new Collectable(2250, floorPos_y - 105, 40),
        new Collectable(2280, floorPos_y - 105, 40),
        new Collectable(2450, floorPos_y - 135, 40),
        new Collectable(2480, floorPos_y - 135, 40),
        new Collectable(-215, floorPos_y - 80, 40),
    ];

	// An array of cloud objects
    clouds = [
        new Cloud(-200, 100),
        new Cloud(100, 150),
        new Cloud(380, 100),
        new Cloud(750, 130),
        new Cloud(1100, 100),
        new Cloud(1500, 130),
    ];

	// Making multiple interactable canyons
    canyons = [
        new Canyon(-300, 432, 142, 340),
        new Canyon(203, 432, 120, 340),
        new Canyon(1000, 432, 120, 340),
        new Canyon(1400, 432, 120, 340),
        new Canyon(2000, 432, 670, 340),
    ];

	// An array of trees
    trees = [
        new Tree(-300, floorPos_y - 150),
        new Tree(-200, floorPos_y - 150),
        new Tree(400, floorPos_y - 150),
        new Tree(600, floorPos_y - 150),
        new Tree(800, floorPos_y - 150),
        new Tree(1000, floorPos_y - 150),
        new Tree(1250, floorPos_y - 150),
        new Tree(1500, floorPos_y - 150),
        new Tree(1750, floorPos_y - 150),
        new Tree(2000, floorPos_y - 150),
        new Tree(2250, floorPos_y - 150),
        new Tree(2500, floorPos_y - 150),
    ];

	// An array of mountains
    mountains = [
        new Mountain(-400, floorPos_y),
        new Mountain(400, floorPos_y),
        new Mountain(1000, floorPos_y),
        new Mountain(1650, floorPos_y),
        new Mountain(2200, floorPos_y),
        new Mountain(2800, floorPos_y),
    ];

    flagpole = new Flagpole(2780, floorPos_y);

    platforms = []; // An empty object
	// Making multiple interactable platforms
    platforms.push(new Platform(100, floorPos_y - 80, 200));
    platforms.push(new Platform(1190, floorPos_y - 60, 200));
    platforms.push(new Platform(2000, floorPos_y - 70, 200));
    platforms.push(new Platform(2225, floorPos_y - 105, 200));
    platforms.push(new Platform(2430, floorPos_y - 140, 200));

    enemies = []; // An empty object
	// Making multiple interactable enemies
    enemies.push(new Enemy(1150, floorPos_y - 5, 220));
    enemies.push(new Enemy(1600, floorPos_y - 5, 370));

    // Set up webcam for face detection
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();
    video.elt.onloadedmetadata = () => {
        faceDetector = new objectdetect.detector(video.width, video.height, 1.1, objectdetect.frontalface);
    };
}

/**
 * Start the game by resetting character positions and game state.
 */
function startGame() 
{
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    pitted = false;
    game_score = 0;
    flagpole.isReached = false;
}

/**
 * Main game drawing and update function.
 * Handles face detection, game state updates, rendering game elements,
 * and displaying game status and instructions.
 */
function drawGame() 
{
    // Face detection every 'detectionFrequency' frames
    if (faceDetector && video.loadedmetadata && frameCounter % detectionFrequency === 0) 
	{
        video.loadPixels();
        if (video.pixels.length > 0) 
		{
			// Detect faces in the video frame
            var faces = faceDetector.detect(video.canvas);
            if (faces.length > 0) 
			{
                faceDetected = true;
                faceX = faces[0][0];
                faceY = faces[0][1];
                faceW = faces[0][2];
                faceH = faces[0][3];

                // Flip faceX because video is flipped
                faceX = video.width - faceX - faceW;
     
                // Determine movement based on the position of the face rectangle
                let faceCenterX = faceX + faceW / 2;
                let threshold = 10; // Reduced threshold for more sensitivity

				// Determine if the detected face is on the left or right side
                if (faceCenterX < video.width / 2 - threshold) 
				{
                    isLeft = true;
                    isRight = false;
                } 
				else if (faceCenterX > video.width / 2 + threshold) 
				{
                    isLeft = false;
                    isRight = true;
                } 
				else 
				{
                    isLeft = false;
                    isRight = false;
                }
            } 
			else 
			{
                faceDetected = false;
                isLeft = false;
                isRight = false;
            }
        }
    }
    frameCounter++;
    cameraPosX = gameChar_x - width / 2;

    // Clear the background
    background(135, 206, 250);

    // Play background sound
    birdsSound.play();
    birdsSound.playMode('untilDone');

    // Render game elements
    let ground = new Ground(floorPos_y, height, width);
    let sun = new Sun(210, 100, 100);

    ground.draw();
    sun.draw();

    checkPlayerDie();

    push();
    translate(-cameraPosX, 0); // Move the game world based on camera position

    // Draw clouds, mountains, trees
    for (let cloud of clouds) cloud.draw();
    for (let mountain of mountains) mountain.draw();
    for (let tree of trees) tree.draw();

    // Draw and check platforms
    for (let platform of platforms) platform.draw();

    // Draw and check collectables
    for (let collectable of collectables) 
	{
        if (!collectable.isFound) 
		{
            collectable.draw();
            collectable.checkCollect(gameChar_x, gameChar_y);
        }
    }

    // Draw canyons
	for (let canyon of canyons) 
	{
		canyon.draw();
		canyon.checkPlummet(gameChar_x, gameChar_y, floorPos_y);
	}
	
    // Render flagpole
	flagpole.draw();
	flagpole.checkReached(gameChar_x);

    // Draw and check enemies
    for (let enemy of enemies) 
	{
        enemy.draw();
        if (enemy.checkContact(gameChar_x, gameChar_y)) 
		{
            if (lives > 0) 
			{
                lives -= 1;
                startGame();
                break;
            }
        }
    }

    // A little help
    textSize(20);
    fill(0);
    text("Use face to move the character right or left", width/2, height/2 );
    text("Press W for jump", width/2, height/2+20)

    // Draw the game character
    drawGameChar();

    pop();

    // Display score and lives
    displayScoreAndLives();

    // Handle game over or level completion
    checkGameEndConditions();

	// Display webcam feed on the right side of the canvas
	push();
	translate(width - video.width - 20, 20); // Move to the right side of the canvas
	scale(-1, 1); // Flip horizontally for mirror effect
	image(video, -video.width, 0);
	
	// Draw rectangle around the detected face
	if (faceDetected) 
	{
		noFill();
		stroke(255, 0, 0);
		strokeWeight(2);

		// Adjust faceX position to match the mirrored video feed
		let adjustedFaceX = -faceX - faceW;
		rect(adjustedFaceX, faceY, faceW, faceH);
	}
	pop();

	// Game movement logic
	if (!gameEnd) 
	{
		if (isLeft) 
		{
			gameChar_x -= 6;
		} 
		else if (isRight) 
		{
			gameChar_x += 6;
		}

		// Handle character falling
		if (gameChar_y < floorPos_y) 
		{
			for (var i = 0; i < platforms.length; i++) 
			{
				if (platforms[i].checkContact(gameChar_x, gameChar_y)) 
				{
					inContact = true;
					isFalling = false;
					break;
				} 
				else 
				{
					inContact = false;
				}
			}
			if (!inContact) 
			{
				isFalling = true;
				gameChar_y += 2;
			}
		} 
		else 
		{
			isFalling = false;
		}

		// Handle plummeting
		if (isPlummeting) 
		{
			if (isPlummeting && !fallingSound.isPlaying()) 
			{
				fallingSound.play();
			}
			isLeft = false;
			isRight = false;
			gameChar_y += 10;

			if (gameChar_y > 772) 
			{
				pitted = true;
				fallingSound.stop();
			}
		}
	}
}

// Game-related key press logic
function gameKeyPressed() 
{
	if (key == 'w' && !isFalling) // Jumps when key 'w' is pressed
	{
	  gameChar_y -= 100;
	  jumpSound.play(); // Sound is played while jumping & not falling
	}
  
	if (gameEnd && keyCode == ENTER)  // When game ends, enter is pressed for setup again & falling is prevented
	{
	  isPlummeting = false; 
	  pitted = false;
	  setupGame();
	}
}

// Other Game-related code (drawGround, drawSun, drawClouds, drawMountains, etc.) from my ITP1 course...
// Some code remain unchanged while others have been changed into OOP principles (original code from ITP1 didnt had any OOP principles).

// Green ground made with one rectangle
class Ground 
{
	// Properties
    constructor(floorPos_y, height, width) 
	{
        this.floorPos_y = floorPos_y;
        this.height = height;
        this.width = width;
    }

    draw() 
	{
        noStroke();
        fill(0, 155, 0);
        rect(0, this.floorPos_y, this.width, this.height - this.floorPos_y);
    }
}

// Yellowish-orange sun made with one ellipse
class Sun 
{
	// Properties
    constructor(x, y, size) 
	{
        this.x = x;
        this.y = y;
        this.size = size;
    }

    draw() 
	{
        noStroke();
        fill(255, 150, 0);
        ellipse(this.x, this.y, this.size);
    }
}

// An array of moving white clouds made with three ellipses
class Cloud 
{
	// Properties
    constructor(x_pos, y_pos) 
	{
        this.x_pos = x_pos;
        this.y_pos = y_pos;
    }

    draw() 
	{
        noStroke();
        fill(255, 255, 255);
        ellipse(this.x_pos, this.y_pos, 80, 80);
        ellipse(this.x_pos - 40, this.y_pos, 60, 60);
        ellipse(this.x_pos + 40, this.y_pos, 60, 60);
        this.x_pos += 1; // Moving clouds
    }
}

// An array of mountains made of two triangles followed by two small triangles
class Mountain 
{
	// Properties
    constructor(x_pos, mountain_y) 
	{
        this.x_pos = x_pos;
        this.mountain_y = mountain_y;
    }

    draw() 
	{
        fill(167, 167, 167);
        triangle(this.x_pos, this.mountain_y, this.x_pos - 180, this.mountain_y - 232, this.x_pos - 300, this.mountain_y);
        fill(255, 255, 255);
        triangle(this.x_pos - 197, this.mountain_y - 200, this.x_pos - 180, this.mountain_y - 232, this.x_pos - 153, this.mountain_y - 200);
        fill(167, 167, 167);
        triangle(this.x_pos - 400, this.mountain_y, this.x_pos - 280, this.mountain_y - 232, this.x_pos - 150, this.mountain_y);
        fill(255, 255, 255);
        triangle(this.x_pos - 297, this.mountain_y - 200, this.x_pos - 280, this.mountain_y - 232, this.x_pos - 262, this.mountain_y - 200);
    }
}

class Tree 
{
	// Properties
    constructor(x, y) 
	{
        this.x = x;
        this.y = y;
    }

    draw() 
	{
		// An array of trees made of a rectangle and two triangles
        fill(120, 100, 40);
        rect(this.x, this.y, 60, 150);
		// Branches
        fill(0, 155, 0);
        triangle(this.x - 50, this.y + 50, this.x + 30, this.y - 50, this.x + 110, this.y + 50);
        triangle(this.x - 50, this.y, this.x + 30, this.y - 100, this.x + 110, this.y);
    }
}

// Drawing collectable items which is a cherry made of an ellipse and a rectangle
class Collectable 
{
    constructor(x_pos, y_pos, size, isFound = false) 
	{
        this.x_pos = x_pos;
        this.y_pos = y_pos;
        this.size = size;
        this.isFound = isFound;
    }

    draw() 
	{
        if (!this.isFound) 
		{
            stroke(0, 0, 0);
            fill(230, 0, 0);
            ellipse(this.x_pos, this.y_pos - 15, 30);
            stroke(0, 0, 0);
            fill(120, 100, 40);
            rect(this.x_pos - 3, this.y_pos - 40, 8, 20);
        }
    }

	// Collectable is collected when there is no longer any distance between the character and the collectable
    checkCollect(gameChar_x, gameChar_y) 
	{
        if (dist(gameChar_x, gameChar_y, this.x_pos, this.y_pos) < 20) 
		{
            this.isFound = true;
            game_score += 1;
            collectCollectableSound.play();
        }
    }
}

class Canyon 
{
	// Properties
    constructor(x, y, width, height) 
	{
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() 
	{
		// Canyon of rectangle shape
        noStroke();
        fill(80, 144, 255);
        rect(this.x, this.y, this.width, this.height);
    }

    checkPlummet(gameChar_x, gameChar_y, floorPos_y) 
	{
		/* Character is fallen into the canyon when dist function covers the canyon and when Y 
		value of character is less then Y value of floor */
        if ((gameChar_x > this.x && gameChar_x < this.x + this.width) && gameChar_y >= floorPos_y) 
		{
            isPlummeting = true;
        }
    }
}

function drawGameChar()
/* My game charcter is a chick which is represented with an orange beak as triangle, 
	yellow body as an ellipse, yellow head as an ellipse and black eyes as an ellipse */
{
	if(isLeft && isFalling)
	//jumping-left code, charcter move and jump left
	{
		noStroke();
		fill(255, 165, 0);
		//beak
		triangle(gameChar_x-30,gameChar_y-50,gameChar_x-45,gameChar_y-55,gameChar_x-30,gameChar_y-55);;
		noStroke(); 
		fill(255,255,0);
		//body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		//head
		ellipse(gameChar_x-10,gameChar_y-48,44,35);
		fill(0,0,0);
		//eye
		ellipse(gameChar_x-20,gameChar_y-55,5,5);
	}
	else if(isRight && isFalling)
	{
		//Jumping-right code, charcter move and jump right
		noStroke();
		fill(255, 165, 0);
		//beak
		triangle(gameChar_x+30,gameChar_y-50,gameChar_x+45,gameChar_y-55,gameChar_x+30,gameChar_y-55);
		noStroke(); 
		fill(255,255,0);
		//body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		//head
		ellipse(gameChar_x+10,gameChar_y-48,44,35);
		fill(0,0,0);
		//eye
		ellipse(gameChar_x+20,gameChar_y-55,5,5);
	}
	else if(isLeft)
	{
		//Walking left code, character moves left 
		noStroke();
		fill(255, 165, 0);
		//beak
		triangle(gameChar_x-30,gameChar_y-50,gameChar_x-45,gameChar_y-55,gameChar_x-30,gameChar_y-55);
		noStroke(); 
		fill(255,255,0);
		//body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		//head
		ellipse(gameChar_x-10,gameChar_y-48,44,35);
		fill(0,0,0);
		//eye
		ellipse(gameChar_x-20,gameChar_y-55,5,5);        
	}
	else if(isRight)
	{
		//Walking right code, character moves right
		noStroke();
		fill(255, 165, 0);
		//beak
		triangle(gameChar_x+30,gameChar_y-50,gameChar_x+45,gameChar_y-55,gameChar_x+30,gameChar_y-55);
		noStroke(); 
		fill(255,255,0);
		//body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		//head
		ellipse(gameChar_x+10,gameChar_y-48,44,35);
		fill(0,0,0);
		//eye
		ellipse(gameChar_x+20,gameChar_y-55,5,5);
	}
	else if(isFalling || isPlummeting)
	{
		//jumping facing forwards code, character jumps from front view
		noStroke(); 
		fill(255,255,0);
		// body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		// head
		ellipse(gameChar_x,gameChar_y-48,44,35);
		fill(0,0,0);
		// eyes
		ellipse(gameChar_x-3,gameChar_y-55,4,4);
		ellipse(gameChar_x+3,gameChar_y-55,4,4);
		fill(255, 165, 0);
		// beak
		triangle(gameChar_x-4,gameChar_y-50,gameChar_x+4,gameChar_y-50,gameChar_x,gameChar_y-40);
	}
	//Standing front facing code, character stands facing front when it is not moving
	else 
	{ 
		noStroke(); 
		fill(255,255,0);
		// body
		ellipse(gameChar_x,gameChar_y-20,54,43);
		noStroke();
		fill(255,255,0);
		// head
		ellipse(gameChar_x,gameChar_y-48,44,35);
		fill(0,0,0);
		// eyes
		ellipse(gameChar_x-3,gameChar_y-55,4,4);
		ellipse(gameChar_x+3,gameChar_y-55,4,4);
		fill(255, 165, 0);
		// beak
		triangle(gameChar_x-4,gameChar_y-50,gameChar_x+4,gameChar_y-50,gameChar_x,gameChar_y-40);
	}
}

/**
 * Display score and lives of character
 */
function displayScoreAndLives() 
{
    fill(255);
    noStroke();
    text("Score: " + game_score, 30, 30);

    fill(255);
    textSize(25);
    text("Lives:", 30, 50);
    for (var i = 0; i < lives; i++) 
	{
        noStroke();
        fill(255, 255, 0);
        ellipse(15 + 100 + i * 27, 62, 18);
    }
}

/**
 *  Checks the lives and winning conditions of character
 */
function checkGameEndConditions() 
{
    if (lives < 1) 
	{
        stroke(0);
        textSize(55);
        fill(255, 0, 0);
        text("GAME OVER :(", width / 2 - textWidth("GAME OVER :(") / 2, height / 2);
        fill(255);
        textSize(20);
        text("Press enter to continue.", width / 2 - textWidth("Press enter to continue.") / 2, height / 2 + 55);
        gameEnd = true;
        return;
    }

    if (flagpole.isReached) 
	{
        textSize(24);
        fill(0);
        text("Level completed :)", width / 2, 50);
        isFalling = true;
        isLeft = false;
        isRight = false;
        gameChar_y = floorPos_y;
        fill(255);
        text("Press enter to continue.", width / 2 - textWidth("Press enter to continue.") / 2, height / 2 + 15);
        gameEnd = true;
        return;
    }
}

class Flagpole 
{
	// Properties
    constructor(x_pos, floorPos_y, isReached = false) 
	{
        this.x_pos = x_pos;
        this.isReached = isReached;
        this.floorPos_y = floorPos_y;
    }

    draw() 
	{
		// Flagpole made with a line & a rectangle
        push();
        strokeWeight(5);
        stroke(0);
        line(this.x_pos, this.floorPos_y, this.x_pos, this.floorPos_y - 250);
        noStroke();
        fill(255, 0, 0);

        if (this.isReached) 
		{
            rect(this.x_pos, this.floorPos_y - 250, 50, 50); // When game is completed, flagpole goes up
        } 
		else 
		{
            rect(this.x_pos, this.floorPos_y - 50, 50, 50); // Otherwise its down
        }
        pop();
    }

    checkReached(gameChar_x) 
	{
		// Checking if game is completed 
        let d = abs(gameChar_x - this.x_pos); // Calculates the distance regardless of -ve/+ve signs
        if (d < 15) // If calculated distance is reached
		{
            this.isReached = true; // Flagpole goes up
        }
    }
}

function Enemy(x,y,range)
{
	// Properties
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = 2;

	// Making movements for enemies
	this.update = function()
	{
		// Move the enemy by incrementing its x-coordinate
		this.currentX += this.inc;

		// Check if the enemy has reached the end of its range
		if (this.currentX >= this.x + this.range)
		{
			// Reverse direction and move left
			this.inc = -2;
		}
		// Check if the enemy has moved past its starting x-coordinate
		else if (this.currentX < this.x)
		{
			// Reverse direction and move right
			this.inc = 2;
		}
	}

	this.draw = function()
	{
		/* Enemy consists of an ellipse & 2 triangles. It is a sharp 
		round object that can slaughter a chick */
		this.update();
		fill(96,96,96);
		ellipse(this.currentX,this.y,50,50);
		triangle(this.currentX+30,this.y+15,this.currentX +2,this.y -33,this.currentX-30,this.y+15);
		triangle(this.currentX-30,this.y-15,this.currentX -2,this.y +33,this.currentX+30,this.y-15);
	}

	this.checkContact = function(gc_x,gc_y)
	{	
		// Colliding with the enemy
		var d = dist(gc_x,gc_y,this.currentX,this.y)
		if(d < 25)
		{
			enemiesSound.play(); //Hitting sound
			return true; //When collided
		}
				return false; //When not collided
	}
}

function checkPlayerDie() 
{
	if (pitted) 
	{ 
		// Just for canyon
		pitted = false;
		lives -= 1;

		if (lives <= 0) 
		{ 
			// Game over when lives are zero
			gameEnd = true;
			return true; // Start over
		} 
		else 
		{
			// Reset character position and state immediately to prevent falling into the canyon again
			isPlummeting = false;  // Reset plummeting state
			gameChar_x = width / 2;
			gameChar_y = floorPos_y;
			startGame(); // Reset game state
		}
	}
	return false; // Doesn't start over
}

class Platform 
{
	// Properties
    constructor(x, y, length) 
	{
        this.x = x;
        this.y = y;
        this.length = length;
    }

    draw() 
	{   
		//Platforms made with 2 rectangles
        stroke(0);
        fill(255, 228, 225);
        rect(this.x, this.y, this.length, 20);
        fill(248, 248, 255);
        rect(this.x, this.y, this.length, 10);
    }

	// Function to check if a contact has occurred
	checkContact(gameC_x, gameC_y) 
	{
		// Check if the x-coordinate of the contact is within the bounds of the object's length
		if (gameC_x > this.x && gameC_x < this.x + this.length) 
		{
			// Calculate the vertical distance between the object and the contact
			let d = this.y - gameC_y;
			
			// Check if the contact is within 5 units of the object's y-coordinate
			if (d >= 0 && d < 5) 
			{
				// Return true if contact is detected
				return true;
			}
		}
		// Return false if no contact is detected
		return false;
	}
}

function startGame()
{
	//When game starts again, everything appears again
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	isFound = false;
	pitted = false; // Reset pitted
	
	// Proerties of collectable will appers again
	collectables = [
        new Collectable(400, floorPos_y, 40),
        new Collectable(600, floorPos_y, 40),
        new Collectable(800, floorPos_y, 40),
        new Collectable(200, floorPos_y, 40),
        new Collectable(200, floorPos_y - 80, 40),
        new Collectable(1300, floorPos_y - 60, 40),
        new Collectable(2050, floorPos_y - 70, 40),
        new Collectable(2080, floorPos_y - 70, 40),
        new Collectable(2250, floorPos_y - 105, 40),
        new Collectable(2280, floorPos_y - 105, 40),
        new Collectable(2450, floorPos_y - 135, 40),
        new Collectable(2480, floorPos_y - 135, 40),
        new Collectable(-215, floorPos_y - 80, 40),
    ];

	// Objects of clouds appears again
    clouds = [
        new Cloud(-200, 100),
        new Cloud(100, 150),
        new Cloud(380, 100),
        new Cloud(750, 130),
        new Cloud(1100, 100),
        new Cloud(1500, 130),
    ];

	// multiple interactable canyons appears again
    canyons = [
        new Canyon(-300, 432, 142, 340),
        new Canyon(203, 432, 120, 340),
        new Canyon(1000, 432, 120, 340),
        new Canyon(1400, 432, 120, 340),
        new Canyon(2000, 432, 670, 340),
    ];

	// An array of trees of appears again
    trees = [
        new Tree(-300, floorPos_y - 150),
        new Tree(-200, floorPos_y - 150),
        new Tree(400, floorPos_y - 150),
        new Tree(600, floorPos_y - 150),
        new Tree(800, floorPos_y - 150),
        new Tree(1000, floorPos_y - 150),
        new Tree(1250, floorPos_y - 150),
        new Tree(1500, floorPos_y - 150),
        new Tree(1750, floorPos_y - 150),
        new Tree(2000, floorPos_y - 150),
        new Tree(2250, floorPos_y - 150),
        new Tree(2500, floorPos_y - 150),
    ];

	// An array of mountains of appears again
    mountains = [
        new Mountain(-400, floorPos_y),
        new Mountain(400, floorPos_y),
        new Mountain(1000, floorPos_y),
        new Mountain(1650, floorPos_y),
        new Mountain(2200, floorPos_y),
        new Mountain(2800, floorPos_y),
    ];

	// Properties of an interactable flagpole appears again
    flagpole = new Flagpole(2780, floorPos_y);

	// Platforms & enemies appear again
    platforms = [];
    platforms.push(new Platform(100, floorPos_y - 80, 200));
    platforms.push(new Platform(1190, floorPos_y - 60, 200));
    platforms.push(new Platform(2000, floorPos_y - 70, 200));
    platforms.push(new Platform(2225, floorPos_y - 105, 200));
    platforms.push(new Platform(2430, floorPos_y - 140, 200));

    enemies = [];
    enemies.push(new Enemy(1150, floorPos_y - 5, 220));
    enemies.push(new Enemy(1600, floorPos_y - 5, 370));

	// Game score is zero again since game started again
	cameraPosX = 0;

	//Game score is zero again since game started again
	game_score = 0;
}