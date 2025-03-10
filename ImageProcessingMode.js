/**
 * Switches back to the image processing mode.
 * Resizes the canvas, shows sliders used in image processing, and stops all game-related sounds.
 */
function switchToImageProcessingMode() 
{
    resizeCanvas(870, 700); // Set canvas size for image processing
    showSliders(); // Show image processing sliders
    stopAllSounds(); // Stop all game sounds
}

/**
 * Stops all game-related sounds.
 * This is called when switching back to image processing mode to avoid sound interference.
 */
function stopAllSounds() 
{
    jumpSound.stop(); // Stop the jump sound
    collectCollectableSound.stop(); // Stop the collectable sound
    fallingSound.stop(); // Stop the falling sound
    enemiesSound.stop(); // Stop the enemies sound
    birdsSound.stop(); // Stop the background birds sound
}

/**
 * Shows sliders used for image processing.
 * This is called when switching back to image processing mode.
 */
function showSliders() 
{
    redSlider.show(); // Show red color threshold slider
    greenSlider.show(); // Show green color threshold slider
    blueSlider.show(); // Show blue color threshold slider
    yuvThresholdSlider.show(); // Show YUV threshold slider
    hsiThresholdSlider.show(); // Show HSI threshold slider
}

 // Define the image processing drawing logic
/**
 * Draws and processes various image transformations and effects on the canvas.
 * Displays the webcam feed, grayscale and color channel images, thresholded images, 
 * color space conversions, face detection results, and instructions for the user.
 */
function drawImageProcessing() 
{
    // Clear the canvas with a light gray background
    background(220);
    
    // Define the grid layout for displaying various image processing results
    const grid = {
        webcam: { x: 0, y: 0, w: 160, h: 120 },          // Original webcam feed
        grayscale: { x: 180, y: 0, w: 160, h: 120 },     // Grayscale image with brightness adjustment
        redChannel: { x: 0, y: 140, w: 160, h: 120 },    // Red color channel
        greenChannel: { x: 180, y: 140, w: 160, h: 120 }, // Green color channel
        blueChannel: { x: 360, y: 140, w: 160, h: 120 },  // Blue color channel
        redThreshold: { x: 0, y: 280, w: 160, h: 120 },   // Thresholded image based on red channel
        greenThreshold: { x: 180, y: 280, w: 160, h: 120 }, // Thresholded image based on green channel
        blueThreshold: { x: 360, y: 280, w: 160, h: 120 }, // Thresholded image based on blue channel
        webcamRepeat: { x: 0, y: 420, w: 160, h: 120 },   // Repeated webcam feed
        colorSpace1: { x: 180, y: 420, w: 160, h: 120 },   // YUV color space conversion
        colorSpace2: { x: 360, y: 420, w: 160, h: 120 },   // HSI color space conversion
        faceDetect: { x: 0, y: 560, w: 160, h: 120 },      // Face detection grid with effects
        yuvThreshold: { x: 180, y: 560, w: 160, h: 120 },  // Thresholded YUV image
        hsiThreshold: { x: 360, y: 560, w: 160, h: 120 }   // Thresholded HSI image
    };

    // Display the live webcam feed in the top-left corner
    image(webcam, grid.webcam.x, grid.webcam.y, grid.webcam.w, grid.webcam.h);
  
    // Check if an image has been captured
    if (capturedImage !== null) 
    {
        // Process and display the grayscale image with brightness adjustment
        processGrayscaleAndBrightness(grid.grayscale.x, grid.grayscale.y, grid.grayscale.w, grid.grayscale.h);
        
        // Display color channel images (Red, Green, Blue)
        displayColorChannels(grid);
        
        // Display thresholded images based on red, green, and blue channels
        displayThresholdImages(grid);
        
        // Display color space conversions (YUV, HSI)
        displayColorSpaceConversions(grid);
        
        // Display thresholded color spaces (YUV and HSI)
        displayColorSpaceThreshold(grid);
        
        // Display a repeated webcam feed for comparison
        image(webcam, grid.webcamRepeat.x, grid.webcamRepeat.y, grid.webcamRepeat.w, grid.webcamRepeat.h);
  
        // Detect faces in the captured image
        let faceImg = capturedImage.get();
        faces = detectFaces(faceImg);
  
        // Display the captured image with face detection results
        image(capturedImage, grid.faceDetect.x, grid.faceDetect.y, grid.faceDetect.w, grid.faceDetect.h);
  
        // Draw rectangles around detected faces and apply selected effects
        noFill();
        stroke(0, 255, 0); // Green color for face detection rectangles
        for (let i = 0; i < faces.length; i++) 
        {
            let face = faces[i];
            if (face[4] > 4) // Minimum confidence threshold for face detection
            {
                let faceX = Math.trunc(face[0] * (grid.faceDetect.w / capturedImage.width));
                let faceY = Math.trunc(face[1] * (grid.faceDetect.h / capturedImage.height));
                let faceW = Math.trunc(face[2] * (grid.faceDetect.w / capturedImage.width));
                let faceH = Math.trunc(face[3] * (grid.faceDetect.h / capturedImage.height));
                let faceRegion = faceImg.get(faceX, faceY, faceW, faceH);
  
                // Apply selected effect to the face region
                if (selectedEffect === 'grayscale') 
                {
                    faceRegion = greyScale(faceRegion);
                } 
                else if (selectedEffect === 'blurred') 
                {
                    faceRegion = blurImage(faceRegion, 10);
                } 
                else if (selectedEffect === 'ycbcr') 
                {
                    faceRegion = applyYCbCrFilter(faceRegion);
                } 
                else if (selectedEffect === 'pixelate') 
                {
                    faceRegion = pixelate(faceRegion, 5);
                }
  
                // Display the processed face region and draw a rectangle around it
                image(faceRegion, grid.faceDetect.x + faceX, grid.faceDetect.y + faceY, faceW, faceH);
                rect(grid.faceDetect.x + faceX, grid.faceDetect.y + faceY, faceW, faceH);
            }
        }
    }
  
    // Display instructions for the user
    noStroke();
    textSize(17);
    fill(0);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    let instructions = [
        'Press SPACEBAR to capture image',
        'Press 2 for grayscale effect to face',
        'Press 3 for blur effect to face',
        'Press 4 for YCbCr effect to face',
        'Press 5 for pixelation to face',
        'Press 1 to remove any effect to face',
        'Press 6 for an extension or to return here'
    ];
  
    let xPos = 530;
    let yPos = 15;
  
    for (let line of instructions) 
    {
        text(line, xPos, yPos);
        yPos += 23; // Move down for the next line of instructions
    }
}

// Other helper functions for image processing...
/**
 * Captures an image from the webcam, resizes it to a specified width and height, and stores it.
 * 
 * This function captures a snapshot from the webcam, resizes the image to 160x120 pixels, 
 * and assigns it to the `capturedImage` variable for further processing or display.
 */
function captureImage() 
{
    // Capture an image from the webcam
    capturedImage = webcam.get();
    
    // Resize the captured image to 160 pixels wide and 120 pixels high
    capturedImage.resize(160, 120);
}
  
/**
 * Processes a section of the captured image to convert it to grayscale and increase brightness by 20%.
 * Displays the processed grayscale image within a specified rectangular area.
 * 
 * @param {number} x - The x-coordinate of the top-left corner where the processed image will be displayed.
 * @param {number} y - The y-coordinate of the top-left corner where the processed image will be displayed.
 * @param {number} w - The width of the rectangle where the processed image will be displayed.
 * @param {number} h - The height of the rectangle where the processed image will be displayed.
 */
function processGrayscaleAndBrightness(x, y, w, h) 
{
    // Create a copy of the captured image to process
    let grayscaleImage = capturedImage.get();
    grayscaleImage.loadPixels(); // Load pixel data for manipulation
  
    // Iterate over each pixel in the image
    for (let j = 0; j < grayscaleImage.height; j++) 
    {
        for (let i = 0; i < grayscaleImage.width; i++) 
        {
            let index = (i + j * grayscaleImage.width) * 4; // Calculate pixel index
  
            // Extract RGB values from the pixel
            let r = grayscaleImage.pixels[index];
            let g = grayscaleImage.pixels[index + 1];
            let b = grayscaleImage.pixels[index + 2];
  
            // Compute the grayscale value as the average of the RGB components
            let gray = (r + g + b) / 3;
  
            // Increase the grayscale value by 20% to make it brighter
            gray *= 1.2;
  
            // Clamp the value to a maximum of 255 to prevent overflow
            if (gray > 255) gray = 255;
  
            // Set the R, G, and B channels of the pixel to the new grayscale value
            grayscaleImage.pixels[index] = gray;
            grayscaleImage.pixels[index + 1] = gray;
            grayscaleImage.pixels[index + 2] = gray;
        }
    }
  
    // Update the pixel data of the image after manipulation
    grayscaleImage.updatePixels();
  
    // Display the processed grayscale image in the specified rectangular area
    image(grayscaleImage, x, y, w, h);
}

/**
 * Converts an RGB image to grayscale and increases the brightness by 20%.
 * 
 * @param {p5.Image} img - The input image to be converted to grayscale.
 * @returns {p5.Image} The resulting grayscale image with increased brightness.
 */
function convertRGBtoGrayscale(img) 
{
    // Create a copy of the input image to apply grayscale conversion
    let grayscaleImage = img.get();
    grayscaleImage.loadPixels(); // Load pixel data for manipulation

    // Iterate over each pixel in the image
    for (let y = 0; y < grayscaleImage.height; y++) 
    {
        for (let x = 0; x < grayscaleImage.width; x++) 
        {
            let index = (x + y * grayscaleImage.width) * 4; // Calculate pixel index

            // Extract RGB values from the pixel
            let r = grayscaleImage.pixels[index];
            let g = grayscaleImage.pixels[index + 1];
            let b = grayscaleImage.pixels[index + 2];

            // Compute the grayscale value as the average of the RGB components
            let gray = (r + g + b) / 3;

            // Increase the grayscale value by 20% to make it brighter
            gray *= 1.2;

            // Clamp the value to a maximum of 255 to prevent overflow
            if (gray > 255) gray = 255;

            // Set the R, G, and B channels of the pixel to the new grayscale value
            grayscaleImage.pixels[index] = gray;
            grayscaleImage.pixels[index + 1] = gray;
            grayscaleImage.pixels[index + 2] = gray;
        }
    }

    // Update the pixel data of the image after manipulation
    grayscaleImage.updatePixels();

    // Return the resulting grayscale image
    return grayscaleImage;
}

/**
 * Displays the individual red, green, and blue color channels of the captured image in different areas of a grid.
 **/
function displayColorChannels(grid) 
{
    // Create copies of the captured image for each color channel
    let redChannelImage = capturedImage.get();
    let greenChannelImage = capturedImage.get();
    let blueChannelImage = capturedImage.get();
  
    // Load pixel data for each channel image
    redChannelImage.loadPixels();
    greenChannelImage.loadPixels();
    blueChannelImage.loadPixels();
  
    // Iterate over each pixel to isolate the color channels
    for (let y = 0; y < capturedImage.height; y++) 
    {
        for (let x = 0; x < capturedImage.width; x++) 
        {
            let index = (x + y * capturedImage.width) * 4;
  
            // Red channel: set Green and Blue components to 0
            redChannelImage.pixels[index + 1] = 0; // Green channel
            redChannelImage.pixels[index + 2] = 0; // Blue channel
  
            // Green channel: set Red and Blue components to 0
            greenChannelImage.pixels[index] = 0;   // Red channel
            greenChannelImage.pixels[index + 2] = 0; // Blue channel
  
            // Blue channel: set Red and Green components to 0
            blueChannelImage.pixels[index] = 0;   // Red channel
            blueChannelImage.pixels[index + 1] = 0; // Green channel
        }
    }
  
    // Update pixel data for each channel image
    redChannelImage.updatePixels();
    greenChannelImage.updatePixels();
    blueChannelImage.updatePixels();
  
    // Display each color channel image in the specified grid areas
    image(redChannelImage, grid.redChannel.x, grid.redChannel.y, grid.redChannel.w, grid.redChannel.h);
    image(greenChannelImage, grid.greenChannel.x, grid.greenChannel.y, grid.greenChannel.w, grid.greenChannel.h);
    image(blueChannelImage, grid.blueChannel.x, grid.blueChannel.y, grid.blueChannel.w, grid.blueChannel.h);
}
  
/**
 * Applies color-based thresholding to an image and displays the results in different areas of a grid.
 **/
function displayThresholdImages(grid) 
{
    // Create and process a copy of the captured image for red color thresholding
    let redThresholdImage = capturedImage.get();
    redThresholdImage.loadPixels(); // Load pixel data for manipulation

    // Iterate over each pixel to apply the red color threshold
    for (let y = 0; y < redThresholdImage.height; y++) 
    {
        for (let x = 0; x < redThresholdImage.width; x++) 
        {
            let index = (x + y * redThresholdImage.width) * 4;
            let r = redThresholdImage.pixels[index];
            
            // Apply the red color threshold and set the pixel color
            redThresholdImage.pixels[index] = r > redSlider.value() ? 255 : 0; // Red channel
            redThresholdImage.pixels[index + 1] = 0; // Green channel
            redThresholdImage.pixels[index + 2] = 0; // Blue channel
        }
    }

    redThresholdImage.updatePixels(); // Update the image with modified pixel data
    // Display the red thresholded image
    image(redThresholdImage, grid.redThreshold.x, grid.redThreshold.y, grid.redThreshold.w, grid.redThreshold.h);

    // Create and process a copy of the captured image for green color thresholding
    let greenThresholdImage = capturedImage.get();
    greenThresholdImage.loadPixels(); // Load pixel data for manipulation

    // Iterate over each pixel to apply the green color threshold
    for (let y = 0; y < greenThresholdImage.height; y++) 
    {
        for (let x = 0; x < greenThresholdImage.width; x++) 
        {
            let index = (x + y * greenThresholdImage.width) * 4;
            let g = greenThresholdImage.pixels[index + 1];
            
            // Apply the green color threshold and set the pixel color
            greenThresholdImage.pixels[index] = 0; // Red channel
            greenThresholdImage.pixels[index + 1] = g > greenSlider.value() ? 255 : 0; // Green channel
            greenThresholdImage.pixels[index + 2] = 0; // Blue channel
        }
    }

    greenThresholdImage.updatePixels(); // Update the image with modified pixel data
    // Display the green thresholded image
    image(greenThresholdImage, grid.greenThreshold.x, grid.greenThreshold.y, grid.greenThreshold.w, grid.greenThreshold.h);

    // Create and process a copy of the captured image for blue color thresholding
    let blueThresholdImage = capturedImage.get();
    blueThresholdImage.loadPixels(); // Load pixel data for manipulation

    // Iterate over each pixel to apply the blue color threshold
    for (let y = 0; y < blueThresholdImage.height; y++) 
    {
        for (let x = 0; x < blueThresholdImage.width; x++) 
        {
            let index = (x + y * blueThresholdImage.width) * 4;
            let b = blueThresholdImage.pixels[index + 2];
            
            // Apply the blue color threshold and set the pixel color
            blueThresholdImage.pixels[index] = 0; // Red channel
            blueThresholdImage.pixels[index + 1] = 0; // Green channel
            blueThresholdImage.pixels[index + 2] = b > blueSlider.value() ? 255 : 0; // Blue channel
        }
    }

    blueThresholdImage.updatePixels(); // Update the image with modified pixel data
    // Display the blue thresholded image
    image(blueThresholdImage, grid.blueThreshold.x, grid.blueThreshold.y, grid.blueThreshold.w, grid.blueThreshold.h);
}
  
function displayColorSpaceConversions(grid) 
{
    // Convert the captured image to YUV color space and display it
    let yuvImage = convertToYUV(capturedImage);
    // Draw the YUV image on the canvas at the specified position and size
    image(yuvImage, grid.colorSpace1.x, grid.colorSpace1.y, grid.colorSpace1.w, grid.colorSpace1.h);

    // Convert the captured image to HSI color space and display it
    let hsiImage = convertToHSI(capturedImage);
    // Draw the HSI image on the canvas at the specified position and size
    image(hsiImage, grid.colorSpace2.x, grid.colorSpace2.y, grid.colorSpace2.w, grid.colorSpace2.h);
}
  
// task 9
/**
 * Converts an image from RGB color space to YUV color space.
 * 
 * @param {p5.Image} img - The image to be converted to YUV color space.
 * @returns {p5.Image} - A new image with colors converted to YUV color space.
 */
function convertToYUV(img) 
{
	let yuvImage = img.get();
	yuvImage.loadPixels();

	for (let y = 0; y < yuvImage.height; y++) 
	{
		for (let x = 0; x < yuvImage.width; x++) 
		{
			let index = (x + y * yuvImage.width) * 4;
			let r = yuvImage.pixels[index];
			let g = yuvImage.pixels[index + 1];
			let b = yuvImage.pixels[index + 2];

			// color space conversions: 10.1 European Y’U’V’ (EBU)
			let Y = 0.299 * r + 0.587 * g + 0.114 * b;
			yuvImage.pixels[index] = Y; // Y channel only for grayscale

			let U = -0.147 * r - 0.289 * g + 0.436 * b + 128;
			yuvImage.pixels[index + 1] = U;

			let V = 0.615 * r - 0.515 * g - 0.100 * b + 128;
			yuvImage.pixels[index + 2] = V;
		}
	}

	yuvImage.updatePixels();
	return yuvImage;
}
  
// task 9
/**
 * Converts an image from RGB color space to HSI (Hue, Saturation, Intensity) color space.
 * 
 * @param {p5.Image} img - The image to be converted to HSI color space.
 * @returns {p5.Image} - A new image with colors converted to HSI color space.
 */
function convertToHSI(img) 
{
	let hsiImage = img.get();
	hsiImage.loadPixels();

	for (let y = 0; y < hsiImage.height; y++) 
		{
		for (let x = 0; x < hsiImage.width; x++) 
		{
			let index = (x + y * hsiImage.width) * 4;
			let r = hsiImage.pixels[index] / 255;
			let g = hsiImage.pixels[index + 1] / 255;
			let b = hsiImage.pixels[index + 2] / 255;

			// Color space conversions: 9.2 Hue Saturation and Intensity. (Gonzalez and Woods)
			let intensity = (r + g + b) / 3;

			// Calculate Saturation (S)
			let minRGB = Math.min(r, g, b);
			let saturation = 1 - (3 * minRGB) / (r + g + b);

			// Calculate Hue (H)
			let numerator = 0.5 * ((r - g) + (r - b));
			let denominator = Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
			let theta = Math.acos(numerator / denominator);

			let hue = 0;
			if (b <= g) 
			{
				hue = theta;
			} 
			else 
			{
				hue = (2 * Math.PI) - theta;
			}

			// Normalize the values to 0-255 range for display
			hsiImage.pixels[index] = hue * (255 / (2 * Math.PI)); // H normalized
			hsiImage.pixels[index + 1] = saturation * 255; // S normalized
			hsiImage.pixels[index + 2] = intensity * 255; // I normalized
		}
	}

	hsiImage.updatePixels();
	return hsiImage;
}
  
// Apply Thresholding in YUV and HSI spaces
function displayColorSpaceThreshold(grid) 
{
	// Apply thresholding on YUV
	let yuvThresholdImage = applyThresholdYUV(convertToYUV(capturedImage), yuvThresholdSlider.value());
	image(yuvThresholdImage, grid.yuvThreshold.x, grid.yuvThreshold.y, grid.yuvThreshold.w, grid.yuvThreshold.h);

	// Apply thresholding on HSI
	let hsiThresholdImage = applyThresholdHSI(convertToHSI(capturedImage), hsiThresholdSlider.value());
	image(hsiThresholdImage, grid.hsiThreshold.x, grid.hsiThreshold.y, grid.hsiThreshold.w, grid.hsiThreshold.h);
}
  
/**
 * Applies a threshold filter to the Y channel of an image in YUV color space.
 * Converts the Y (luminance) values of the image to binary values based on a specified threshold.
 * 
 * @param {p5.Image} img - The image to which the threshold filter will be applied.
 * @param {number} threshold - The Y channel threshold value for binarization.
 * @returns {p5.Image} - A new image with the threshold filter applied.
 */
function applyThresholdYUV(img, threshold) 
{
	 // Create a copy of the image to work with
	let thresholdedImage = img.get();
	thresholdedImage.loadPixels(); // Load the pixel data of the image

	// Iterate over each pixel in the image
	for (let y = 0; y < thresholdedImage.height; y++) 
	{
		for (let x = 0; x < thresholdedImage.width; x++) 
		{
			// Calculate the index of the pixel in the pixel array
			let index = (x + y * thresholdedImage.width) * 4;

			// Extract the Y channel (luminance) from the pixel data
			let Y = thresholdedImage.pixels[index];

			// Apply threshold only on the Y channel
			let binaryValue = (Y > threshold) ? 255 : 0;

			thresholdedImage.pixels[index] = binaryValue; // Only threshold Y
		}
	}

	thresholdedImage.updatePixels();
	return thresholdedImage;
}

/**
 * Applies a threshold filter to the Intensity channel of an image in HSI color space.
 * Converts the intensity values of the image to binary values based on a specified threshold.
 * 
 * @param {p5.Image} img - The image to which the threshold filter will be applied.
 * @param {number} threshold - The intensity threshold value for binarization.
 * @returns {p5.Image} - A new image with the threshold filter applied.
 */
function applyThresholdHSI(img, threshold) 
{
    // Create a copy of the image to work with
    let thresholdedImage = img.get();
    thresholdedImage.loadPixels(); // Load the pixel data of the image

    // Iterate over each pixel in the image
    for (let y = 0; y < thresholdedImage.height; y++) 
    {
        for (let x = 0; x < thresholdedImage.width; x++) 
        {
            // Calculate the index of the pixel in the pixel array
            let index = (x + y * thresholdedImage.width) * 4;

            // Extract the intensity (I) channel from the pixel data
            let I = thresholdedImage.pixels[index + 2]; // Assuming the intensity is stored in the third channel (index + 2)
            
            // Apply threshold to the intensity channel
            // Convert intensity to binary value based on the threshold
            let binaryValue = (I > threshold) ? 255 : 0;

            // Set the binary value to the intensity channel of the pixel
            thresholdedImage.pixels[index + 2] = binaryValue; // Only update the intensity channel
        }
    }

    // Update the pixel data of the thresholded image
    thresholdedImage.updatePixels();
    return thresholdedImage; // Return the thresholded image
}

/**
 * Initializes the face detection setup.
 * Creates a face detector instance with specified parameters.
 */
function setupFaceDetect() 
{  
    var scaleFactor = 1.2; // The scale factor for the image pyramid. It scales down the image at each level to detect faces at different sizes.
    
    // Initialize the face detector with the specified width (w) and height (h) of the detection window,
    // the scale factor for resizing the image, and the type of object to detect (frontal faces).
    detector = new objectdetect.detector(w, h, scaleFactor, objectdetect.frontalface);
}

/**
 * Detects faces in the given image using the initialized face detector.
 * 
 * @param {p5.Image} img - The image in which faces are to be detected.
 * @returns {Array} - An array of detected faces, where each face is represented by its bounding box.
 */
function detectFaces(img) 
{
    // Perform face detection on the canvas of the image using the face detector.
    return detector.detect(img.canvas);
}
  
/**
 * Converts an image to grayscale.
 * Averages the RGB values of each pixel to produce a grayscale image.
 * 
 * @param {p5.Image} img - The image to be converted to grayscale.
 * @returns {p5.Image} - A new image with the grayscale filter applied.
 */
function greyScale(img) 
{
    // Create a copy of the image to work with
    let grayImg = img.get();
    grayImg.loadPixels(); // Load the pixel data of the image

    // Iterate over each pixel in the image
    for (let y = 0; y < grayImg.height; y++) 
    {
        for (let x = 0; x < grayImg.width; x++) 
        {
            // Calculate the index of the pixel in the pixel array
            let index = (x + y * grayImg.width) * 4;
            // Extract the RGB values of the pixel
            let r = grayImg.pixels[index];
            let g = grayImg.pixels[index + 1];
            let b = grayImg.pixels[index + 2];
            // Compute the average of the RGB values to get the grayscale value
            let gray = (r + g + b) / 3;

            // Set the grayscale value to all RGB components of the pixel
            grayImg.pixels[index] = gray;        // Red component
            grayImg.pixels[index + 1] = gray;    // Green component
            grayImg.pixels[index + 2] = gray;    // Blue component
        }
    }

    // Update the pixel data of the grayscale image
    grayImg.updatePixels();
    return grayImg; // Return the grayscale image
}

/**
 * Blurs an image using a simple box blur algorithm.
 * 
 * @param {p5.Image} img - The image to be blurred.
 * @param {number} blurRadius - The radius of the blur effect (how far from each pixel to consider for averaging).
 * @returns {p5.Image} - A new image with the blur effect applied.
 */
function blurImage(img, blurRadius) 
{
    // Create a copy of the image to work with
    let blurredImg = img.get();
    blurredImg.loadPixels(); // Load the pixel data of the image

    // Iterate over each pixel in the image
    for (let y = 0; y < blurredImg.height; y++) 
    {
        for (let x = 0; x < blurredImg.width; x++) 
        {
            // Initialize variables to accumulate the color values and a counter
            let r = 0, g = 0, b = 0;
            let count = 0;

            // Iterate over the pixels in the blur radius
            for (let ky = -blurRadius; ky <= blurRadius; ky++) 
            {
                for (let kx = -blurRadius; kx <= blurRadius; kx++) 
                {
                    let px = x + kx; // Calculate the x coordinate of the neighboring pixel
                    let py = y + ky; // Calculate the y coordinate of the neighboring pixel

                    // Check if the neighboring pixel is within image bounds
                    if (px >= 0 && px < blurredImg.width && py >= 0 && py < blurredImg.height) 
                    {
                        // Calculate the index of the pixel in the pixel array
                        let index = (px + py * blurredImg.width) * 4;
                        // Accumulate the color values
                        r += blurredImg.pixels[index];
                        g += blurredImg.pixels[index + 1];
                        b += blurredImg.pixels[index + 2];
                        count++; // Increment the count of pixels considered
                    }
                }
            }

            // Calculate the average color values and update the pixel in the blurred image
            let index = (x + y * blurredImg.width) * 4;
            blurredImg.pixels[index] = r / count;
            blurredImg.pixels[index + 1] = g / count;
            blurredImg.pixels[index + 2] = b / count;
        }
    }

    // Update the pixel data of the blurred image
    blurredImg.updatePixels();
    return blurredImg; // Return the blurred image
}

/**
 * Applies a YCbCr color space filter to an image.
 * Converts the image from RGB color space to YCbCr color space.
 * 
 * @param {p5.Image} img - The image to be converted to YCbCr color space.
 * @returns {p5.Image} - A new image with the YCbCr filter applied.
 */  
function applyYCbCrFilter(img) 
{
	let ycbcrImg = img.get();
	ycbcrImg.loadPixels();

	for (let y = 0; y < ycbcrImg.height; y++) 
	{
		for (let x = 0; x < ycbcrImg.width; x++) 
		{
			let index = (x + y * ycbcrImg.width) * 4;
			let r = ycbcrImg.pixels[index];
			let g = ycbcrImg.pixels[index + 1];
			let b = ycbcrImg.pixels[index + 2];

			// Convert RGB to YCbCr (color space conversions: 10.4 ITU.BT-601 Y’CbCr)
			let Y = 0.299 * r + 0.587 * g + 0.114 * b;
			let Cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
			let Cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;

			// For visualization purposes, map YCbCr back to a suitable range
			ycbcrImg.pixels[index] = Y; // Display Y as grayscale
			ycbcrImg.pixels[index + 1] = Cb; // Remap Cb to a suitable display range
			ycbcrImg.pixels[index + 2] = Cr; // Remap Cr to a suitable display range
		}
	}

	ycbcrImg.updatePixels();
	return ycbcrImg;
}
  
function pixelate(img, blockSize) 
{
	// Step i: Convert image to greyscale
	let grayImg = convertRGBtoGrayscale(img);

	// Copy the greyscale image for pixelation
	let pixelatedImg = grayImg.get();
	pixelatedImg.loadPixels();
	grayImg.loadPixels(); // Ensure the grayscale image is loaded

	// Iterate over the image in blocks
	for (let y = 0; y < pixelatedImg.height; y += blockSize) 
	{
		for (let x = 0; x < pixelatedImg.width; x += blockSize) 
		{
			let sum = 0;
			let pixelCount = 0;
			
			// Sum pixel intensities in the block
			for (let dy = 0; dy < blockSize; dy++) 
			{
				for (let dx = 0; dx < blockSize; dx++) 
				{
					let px = x + dx;
					let py = y + dy;
					if (px < pixelatedImg.width && py < pixelatedImg.height) 
						{
							let index = (px + py * pixelatedImg.width) * 4;
							let pixelIntensity = grayImg.pixels[index]; // Only grayscale channel
							sum += pixelIntensity;
							pixelCount++;
						}
				}
			}
			
			// Calculate average intensity for the block
			let aveIntensity = sum / pixelCount;
			
			// Paint the entire block with the average intensity
			for (let dy = 0; dy < blockSize; dy++) 
			{
				for (let dx = 0; dx < blockSize; dx++) 
				{
					let px = x + dx;
					let py = y + dy;
					if (px < pixelatedImg.width && py < pixelatedImg.height) 
					{
						let index = (px + py * pixelatedImg.width) * 4;
						pixelatedImg.pixels[index] = aveIntensity;
						pixelatedImg.pixels[index + 1] = aveIntensity;
						pixelatedImg.pixels[index + 2] = aveIntensity;
						pixelatedImg.pixels[index + 3] = 255; // Alpha channel
					}
				}
			}
		}
	}

	pixelatedImg.updatePixels();
	return pixelatedImg;
}