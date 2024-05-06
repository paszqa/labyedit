document.addEventListener('DOMContentLoaded', () => {

    let gridSizeX = 8; // Number of columns
    let gridSizeY = 8; // Number of rows
    const cellSize = 20; // Size of each cell in pixels

    let mapSizeX; // = ReadHexValueFromFile(filePath, 0x04, 4);
    let mapSizeY; // = ReadHexValueFromFile(filePath, 0x08, 4);
    let startX; //= ReadHexValueFromFile(filePath, 0x10, 2);
    let startY; //ReadHexValueFromFile(filePath, 0x12, 2);
    let goalX; //= ReadHexValueFromFile(filePath, 0x14, 2);
    let goalY; //= ReadHexValueFromFile(filePath, 0x16, 2);
    let timerValue = 0;
    let startOfGeometry = "220";
    let geometryArray = new Array();
    let dotsArrayX = new Array();
    let dotsArrayY = new Array();
    let checkpointsArray = new Array();
    let pickupsArrayX = new Array();
    let pickupsArrayY = new Array();
    let pickupsArrayType = new Array();
    let currentTheme;
    let howManyDots = 0;
    let howManyCheckpoints = 0;
    let flags = 2;
    let hasPickups = false;
    let flagTwo = false;
    let hasDots = false;
    let startOfDots;
    let realStartOfDots;
    let startOfCheckpoints;
    let startOfPickups
    let realStartOfPickups;
    let howManyPickups = 0;
    let lvlOffset = 0;
    let currentTool = "";
    let drawingOnBigGrid = false;
    let drawingOnSmallGrid = false;
    // Function to read bytes from the loaded file

    function ReadHexValue(uint8Array, hexValue, howManyBytes, offset, intOffset) {
        let intIndex = parseInt(hexValue, 16);
        let firstOffset = parseInt(offset, 16);
        let secondOffset = intOffset + lvlOffset;
        let outputValue;
        switch (howManyBytes) {
            case 1:
                outputValue = uint8Array[intIndex + firstOffset + secondOffset];
                break;
            case 2:
                outputValue = uint8Array[intIndex + firstOffset + secondOffset] | (uint8Array[intIndex + firstOffset + secondOffset + 1] << 8);
                break;
            case 3:
                outputValue = uint8Array[intIndex + firstOffset + secondOffset] | (uint8Array[intIndex + firstOffset + secondOffset + 1] << 8) | (uint8Array[intIndex + firstOffset + secondOffset + 2] << 16);
                break;
            case 4:
                outputValue = uint8Array[intIndex + firstOffset + secondOffset] | (uint8Array[intIndex + firstOffset + secondOffset + 1] << 8) | (uint8Array[intIndex + firstOffset + secondOffset + 2] << 16) | (uint8Array[intIndex + firstOffset + secondOffset + 3] << 24);
                break;
        }
        //console.log("hexValue: "+hexValue+" to howmanyBytes:"+howManyBytes+" to int => "+intIndex+" offset:"+intOffset+"  OUTPUT VALUE: "+outputValue);
        return outputValue;
    }

    function ReadTheme(uint8Array){
        let hexAddress = (parseInt("1C", 16));
        console.log("UINT ARRAY:"+uint8Array.join(","));
        //outputValue = uint8Array[1C + lvlOffset];
        let decodedString = '';
        for (let i = hexAddress; i < uint8Array.length; i++) {
            // Read a byte from memory at the current address
            const byte = uint8Array[i];
        
            // Break the loop if the byte is 0x00 (null-terminator), indicating the end of the string
            if (byte === 0x00) {
                break;
            }
        
            // Convert the byte to a character and add it to the decoded string
            decodedString += String.fromCharCode(byte);
        }
        console.log("Theme: "+decodedString);
        currentTheme = decodedString;
        console.log("CURRENT THEME 0 = "+currentTheme);
        return currentTheme;

    }
    function readBytesFromFile() {
        geometryArray.length = 0;
        dotsArrayX.length = 0;
        dotsArrayY.length = 0;
        checkpointsArray.length = 0;
        pickupsArrayX.length = 0;
        pickupsArrayY.length = 0;
        pickupsArrayType.length = 0;
        //Define HTML elements of general vars
        const fileInput = document.getElementById('file-input');
        const byteOutput = document.getElementById('byte-output');
        //console.log("STARTPOINT div "+startPointOutput);
        if (!fileInput.files.length) {
            alert('Please select a file first.');
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            let startIndex = 0; // Default start index is 0
    
            // Check the file extension
            const fileName = file.name;
            const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
            
            if (fileExtension === "lvl") {
                lvlOffset = 3; // Adjust the start index if needed
                console.log("Set start index to 3 (lvl file)");
            }
            else{
                lvlOffset = 0;
            }
            const uint8Array = new Uint8Array(arrayBuffer, startIndex);
            console.log("Level loaded into memory. Analyzing...");
            console.log("Test value, should be 20 or 32:"+ReadHexValue(uint8Array, "0", 1, 0, 0));
            //const uint8Array = new Uint8Array(arrayBuffer);
            mapSizeX = ReadHexValue(uint8Array, "3", 4, "1", 0);
            mapSizeY = ReadHexValue(uint8Array, "8", 4, 0, 0);
            gridSizeX = mapSizeX;
            gridSizeY = mapSizeY;
            startX = ReadHexValue(uint8Array, "10", 2, 0, 0);
            startY = ReadHexValue(uint8Array, "12", 2, 0, 0);
            goalX = ReadHexValue(uint8Array, "14", 2, 0, 0);
            goalY = ReadHexValue(uint8Array, "16", 2, 0, 0);
            console.log("CURRENT THEME 1 = "+currentTheme);
            currentTheme = ReadTheme(uint8Array);
            console.log("CURRENT THEME 2 = "+currentTheme);
            timerValue = ReadHexValue(uint8Array, "21C", 2, 0, 0);
            console.log("...Reading basic values complete.");
            console.log("Map size X: "+mapSizeX+" Y: "+mapSizeY);
            //FLAGS
            hasPickups = false;
            flagTwo = false;
            hasDots = false;
            flags = ReadHexValue(uint8Array, "18", 4, 0, 0);
            flagsCalculation = flags;
            //console.log("flags = "+flags)
            if (flagsCalculation >= 4) {
                hasPickups = true;
                flagsCalculation -= 4;
            }
            if (flagsCalculation >= 2) {
                //no idea what 2 means
                flagTwo = true;
                flagsCalculation -= 2;
            }
            if (flagsCalculation >= 1) {
                hasDots = true;
                flagsCalculation -= 1;
            }
            console.log("...Reading flags complete.");

            
            //------------------Geometry--------------------------
            let numberOfCells = mapSizeX * mapSizeY;
            console.log("...Number of cells: "+numberOfCells);
            for (let i = 0; i < numberOfCells; i++) {
                let valueHere = "" + ReadHexValue(uint8Array, startOfGeometry, 1, 0, i * 4);
                valueHere += ReadHexValue(uint8Array, startOfGeometry, 1, 0, i * 4 + 1);
                valueHere += ReadHexValue(uint8Array, startOfGeometry, 1, 0, i * 4 + 2);
                valueHere += ReadHexValue(uint8Array, startOfGeometry, 1, 0, i * 4 + 3);
                //console.log("i = " + i + "; value = " + valueHere + " out of "+numberOfCells);
                geometryArray.push(valueHere); //Geometry start?)
            }
            console.log("...Reading geometry complete.");
            /*
            byteOutput.textContent = "Map Size X: " + mapSizeX + " Y: " + mapSizeY + " start X:" + startX + " Y:" + startY + " goal X:" + goalX + " Y:" + goalY + "Pickups:" + hasPickups + " Flag2:" + flagTwo + " Dots:" + hasDots + " ";
            for (let i = 0; i < geometryArray.length; i++) {
                byteOutput.textContent += geometryArray[i] + ", ";
            }
            */

            //----------------Dots---------------------
            startOfDots = (parseInt(startOfGeometry, 16) + (mapSizeX * mapSizeY * 4)).toString(16);
            howManyDots = ReadHexValue(uint8Array, startOfDots, 4, 0, 0);
            realStartOfDots = (parseInt(startOfGeometry, 16) + (mapSizeX * mapSizeY * 4 + 4)).toString(16);
            for (let i = 0; i < howManyDots; i++) {
                let valueHere = "" + ReadHexValue(uint8Array, realStartOfDots, 2, 0, i * 4);
                dotsArrayX.push(valueHere);
                valueHere = ReadHexValue(uint8Array, realStartOfDots, 2, 0, i * 4 + 2);
                dotsArrayY.push(valueHere);
                //valueHere += ReadHexValue(uint8Array, startOfDots, 1, 0, i*4 + 3);
                //console.log("i = " + i + "; value = " + valueHere + " out of "+numberOfCells);
                //dotsArrayX.push(valueHere); //Geometry start?)
            }
            /*
            for (let i = 0; i < dotsArrayX.length; i++) {
                byteOutput.textContent += dotsArrayX[i] + "," + dotsArrayY[i] + " - ";
            }*/
            //----------------Checkpoints---------------------

            startOfCheckpoints = (parseInt(startOfDots, 16) + (howManyDots * 4)).toString(16);
            if (hasDots) {
                startOfCheckpoints = (parseInt(startOfCheckpoints, 16) + 4).toString(16); //If DOTS FLAG is present, then add 4 bytes, because it needs a counter
            }
            howManyCheckpoints = ReadHexValue(uint8Array, "0C", 4, 0, 0);
            //byteOutput.textContent = "Start of checkpoints: " + startOfCheckpoints + " howManyCheckpoints:" + howManyCheckpoints + " ||| ";
            for (let i = 0; i < howManyCheckpoints; i++) {
                let valueHere = "" + ReadHexValue(uint8Array, startOfCheckpoints, 1, 0, i);
                checkpointsArray.push(valueHere);
                //valueHere += ReadHexValue(uint8Array, startOfDots, 1, 0, i*4 + 3);
                //console.log("i = " + i + "; value = " + valueHere + " out of "+numberOfCells);
                //dotsArrayX.push(valueHere); //Geometry start?)
            }
            //-------------Pickups-----------------------
            if (hasPickups) {
                startOfPickups = (parseInt(startOfCheckpoints, 16) + (howManyCheckpoints)).toString(16);
                howManyPickups = ReadHexValue(uint8Array, startOfPickups, 4, 0, 0);
                //byteOutput.textContent = "start of pickups: " + startOfPickups + " count:" + howManyPickups + " ===> ";
                realStartOfPickups = (parseInt(startOfPickups, 16) + 4).toString(16);
                for (let i = 0; i < howManyPickups; i++) {
                    let valueHere = "" + ReadHexValue(uint8Array, realStartOfPickups, 2, 0, i * 8);
                    pickupsArrayX.push(valueHere);
                    //console.log("READING PICKUP i = " + i + "; value X = " + valueHere);
                    valueHere = "" + ReadHexValue(uint8Array, realStartOfPickups, 2, 0, i * 8 + 2);
                    pickupsArrayY.push(valueHere);
                    //console.log("READING PICKUP i = " + i + "; value Y = " + valueHere);
                    valueHere = "" + ReadHexValue(uint8Array, realStartOfPickups, 1, 0, i * 8 + 4) 
                        + ReadHexValue(uint8Array, realStartOfPickups, 1, 0, i * 8 + 5)
                        + ReadHexValue(uint8Array, realStartOfPickups, 1, 0, i * 8 + 6)
                        + ReadHexValue(uint8Array, realStartOfPickups, 1, 0, i * 8 + 7);
                    pickupsArrayType.push(valueHere);
                    //valueHere += ReadHexValue(uint8Array, startOfDots, 1, 0, i*4 + 3);
                    //console.log("READING PICKUP i = " + i + "; value TYPE = " + valueHere);
                    //console.log("type = " + valueHere + " (" + i + " out of " + howManyPickups + ")");
                    //dotsArrayX.push(valueHere); //Geometry start?)
                }
                /*
                for (let i = 0; i < pickupsArrayX.length; i++) {
                    byteOutput.textContent += "i:" + i + " [" + pickupsArrayX[i] + "," + pickupsArrayY[i] + "] type:" + pickupsArrayType[i] + " /// ";
                }
                */
            }
            //---------------Print output
            refreshStats();
            console.log("...Printing basic values and flags complete.");
            //----------generate grid
            DeleteGrid();
            GenerateGrid(geometryArray, mapSizeX, mapSizeY);
            centerGrid();
            addDotsToMap(dotsArrayX, dotsArrayY);
            addPickupsToMap(pickupsArrayX, pickupsArrayY, pickupsArrayType);
            //addCheckpointsToMap(checkpointsArray);
        };

        reader.readAsArrayBuffer(file);
    }

    // Set up a click event listener for the "Read Bytes" button
    /*
    const readBytesButton = document.getElementById('read-bytes-button');
    readBytesButton.addEventListener('click', () => {
        readBytesFromFile();
    });
    */
    const panelBox = document.getElementById('panel-box');
    const gridContainer = document.getElementById('grid-container');
    const selectTheme = document.getElementById('selectTheme');

    let zoomLevel = 1; // Initial zoom level
    let isPanning = false; 
    const zoomStep = 0.25; // Adjust this for zoom speed
    const panSpeed = 0.15; // Adjust this for desired panning speed
    let currentMousePositionX;
    let currentMousePositionY;
    let intervalId;

    // Function to apply the zoom transformation
    function updateZoom() {
        gridContainer.style.transform = `scale(${zoomLevel})`;
    }

    // Event handler for the mouse wheel event on the panel box
    panelBox.addEventListener('wheel', (event) => {
        // Calculate the new zoom level based on the scroll direction
        const zoomFactor = event.deltaY > 0 ? 1 - zoomStep : 1 + zoomStep;

        // Get the mouse position within the panel box
        const mouseX = event.clientX - panelBox.getBoundingClientRect().left - panelBox.getBoundingClientRect().width / 2;
        const mouseY = event.clientY - panelBox.getBoundingClientRect().top - panelBox.getBoundingClientRect().height / 2;

        // Calculate the new translation based on the mouse position
        const currentTransform = new DOMMatrix(window.getComputedStyle(gridContainer).transform);
        const scaledMouseX = mouseX / zoomLevel;
        const scaledMouseY = mouseY / zoomLevel;
        if(event.deltaY > 0){
            currentTransform.translateSelf(scaledMouseX, scaledMouseY);
        }

        // Apply the zoom and translation
        currentTransform.scaleSelf(zoomFactor);
        zoomLevel = currentTransform.a;
        
        if(event.deltaY < 0){
            currentTransform.translateSelf(-scaledMouseX, -scaledMouseY);
        }

        // Apply the updated transformation
        gridContainer.style.transform = currentTransform.toString();

        // Prevent the default scroll behavior
        event.preventDefault();
    });
// Start panning when right mouse button is held down
    panelBox.addEventListener('mousedown', (event) => {
        if (event.button === 2) { // Right mouse button
        console.log("clicked right mouse");
        isPanning = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        //intervalId = setInterval(panPanelBox(event, lastMouseX, lastMouseY), 1);
        intervalId = setInterval(() => panPanelBox(event, lastMouseX, lastMouseY), 100); // Execute repeatFunction every 0.1 second with arguments
        event.preventDefault();
        }
    });


// Continue panning as the mouse moves
    document.addEventListener('mousemove', (event) => {
        currentMousePositionX = event.clientX;
        currentMousePositionY = event.clientY;
    });
//document.addEventListener('mouseover', (event) => {
    function panPanelBox(event, lastMouseX, lastMouseY){
        if (isPanning) {
            const deltaX = currentMousePositionX - lastMouseX;
            const deltaY = currentMousePositionY - lastMouseY;
            console.log("is panning from lastMouse X "+lastMouseX+ " Y "+lastMouseY+" ===> delta is X "+deltaX+" Y "+deltaY);
            
            /*
            const currentTransform = new DOMMatrix(window.getComputedStyle(gridContainer).transform);
            const panX = deltaX * panSpeed / zoomLevel;
            const panY = deltaY * panSpeed / zoomLevel;
        
            */
            const currentTransform = new DOMMatrix(window.getComputedStyle(gridContainer).transform);
            currentTransform.translateSelf(deltaX / zoomLevel, deltaY / zoomLevel);
            gridContainer.style.transform = currentTransform.toString();
                    
            //currentTransform.translateSelf(panX, panY);
            //gridContainer.style.transform = currentTransform.toString();
            //lastMouseX = event.clientX;
            //lastMouseY = event.clientY;
        }
    }
  //});

    // Stop panning when the right mouse button is released
    document.addEventListener('mouseup', () => {
        console.log("panning = false");
        isPanning = false;
    });
    // Function to center the grid within the panel box
    function centerGrid() {
        //console.log("gridsize X"+gridSizeX+" Y"+gridSizeY+" mapsize X"+mapSizeX+" Y"+mapSizeY);
        const panelBoxWidth = panelBox.offsetWidth;
        const panelBoxHeight = panelBox.offsetHeight;
        const gridWidth = gridSizeX * cellSize * zoomLevel;
        const gridHeight = gridSizeY * cellSize * zoomLevel;

        const offsetX = (panelBoxWidth - gridWidth) / 2;
        const offsetY = (panelBoxHeight - gridHeight) / 2;

        gridContainer.style.transformOrigin = 'center'; // Set the transformation origin to the center
        gridContainer.style.transform = `scale(${zoomLevel}) translate(${0 }px, ${offsetY}px)`;
    }
    // Function to center the grid within the panel box and reset the zoom
    function centerGridAndResetZoom() {
        zoomLevel = 1; // Reset the zoom level to 1
        updateZoom(); // Update the zoom
        centerGrid(); // Recenter the grid
    }
    // Initialize the zoom and center the grid
    updateZoom();
    centerGrid();
    //GenerateGrid(geometryArray, 4, 4);
    // Set up a click event listener for the "Recenter Grid" button
    const recenterButton = document.getElementById('recenter-button');
    recenterButton.addEventListener('click', () => {
        centerGridAndResetZoom(); // Recenter the grid and reset the zoom when the button is clicked
    });

    //--------------------------------------DOTS BUTTON--------------------------------------------
    // Function to toggle visibility of elements with class .dotContainer
    function toggleDotsVisibility() {
        console.log("Toggling dots...");
        const dotContainers = document.querySelectorAll('.dotContainer');

        dotContainers.forEach((container) => {
            // Toggle visibility of each container
            container.style.display = container.style.display === 'none' ? 'flex' : 'none';
        });
    }

    // Add a click event listener to the button
    const toggleDotsButton = document.getElementById('toggle-dots-button');
    toggleDotsButton.addEventListener('click', toggleDotsVisibility);

    //--------------------------------------SCORES BUTTON--------------------------------------------
    // Function to toggle visibility of elements with class .pickupContainer
    function toggleScoresVisibility() {
        console.log("Toggling scores...");
        const scoreContainers = document.querySelectorAll('.scoreBox');

        scoreContainers.forEach((container) => {
            // Toggle visibility of each container
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        });
    }
    // Add a click event listener to the button
    const toggleScoresButton = document.getElementById('toggle-scores-button');
    toggleScoresButton.addEventListener('click', toggleScoresVisibility);

    //--------------------------------------START/GOAL BUTTON--------------------------------------------
    // Function to toggle visibility of elements with class .pickupContainer
    function toggleStartGoalVisibility() {
        console.log("Toggling start/goal...");
        const startGoalContainers = document.querySelectorAll('.startGoal');

        startGoalContainers.forEach((container) => {
            // Toggle visibility of each container
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
        });
    }
    // Add a click event listener to the button
    const toggleStartGoalButton = document.getElementById('toggle-start-goal-button');
    toggleStartGoalButton.addEventListener('click', toggleStartGoalVisibility);

    //--------------------------------------PICKUP BUTTON--------------------------------------------
    // Function to toggle visibility of elements with class .pickupContainer
    function togglePickupsVisibility() {
        console.log("Toggling pickups...");
        const pickupContainers = document.querySelectorAll('.pickupContainer');

        pickupContainers.forEach((container) => {
            // Toggle visibility of each container
            container.style.display = container.style.display === 'none' ? 'flex' : 'none';
        });
    }

    // Add a click event listener to the button
    const togglePickupsButton = document.getElementById('toggle-pickups-button');
    togglePickupsButton.addEventListener('click', togglePickupsVisibility);


    // Function to create dot
    function CreateItem(dotX, dotY, whatToCreate) {
        //Find a correct "big" cell
        //console.log("dotx:"+dotX+" dotY"+dotY);
        const gridCellXValue = (dotX - (dotX % 10)) / 10;
        const gridCellYValue = (dotY - (dotY % 10)) / 10;
        //console.log("gridCellXValue:"+gridCellXValue+" gridCellYValue"+gridCellYValue);
        const gridCell = document.querySelector(`[data-gridCellX="${gridCellXValue}"][data-gridCellY="${gridCellYValue}"]`);

        if (gridCell) {
            // Find the first element within gridCell with data-smallCellX="7" and data-smallCellY="8"
            const smallCellXValue = dotX % 10;
            const smallCellYValue = dotY % 10;
            const smallCell = gridCell.querySelector(`[data-smallCellX="${smallCellXValue}"][data-smallCellY="${smallCellYValue}"]`);
            if (whatToCreate == "dot" || whatToCreate == "dot2") {
                if (smallCell) {
                    const image = document.createElement('img');
                    image.src = "images/dot2.png";
                    const dotContainer = document.createElement('div');
                    dotContainer.className = 'dotContainer';
                    dotContainer.appendChild(image);
                    smallCell.appendChild(dotContainer);
                    console.log("Created dot @ "+dotX+","+dotY);
                }
            } else {
                if (smallCell) {
                    const image = document.createElement('img');
                    image.src = "images/" + whatToCreate + ".png";
                    const pickupContainer = document.createElement('div');
                    pickupContainer.className = 'pickupContainer';
                    pickupContainer.appendChild(image);
                    smallCell.appendChild(pickupContainer);
                }
            }
        }
    }

    function removeItem(dotX, dotY){
        //remove from array
        for(let i = 0; i < pickupsArrayX.length; i++){
            if(pickupsArrayX[i] == dotX && pickupsArrayY[i] == dotY){
                console.log("------------> Removing item: "+pickupsArrayType[i]+" from coords "+dotX+","+dotY);
                pickupsArrayX.splice(i, 1);
                pickupsArrayY.splice(i, 1);
                pickupsArrayType.splice(i, 1);
                howManyPickups -= 1;
                if(howManyPickups == 0){
                    hasPickups = 0;
                }
            }
        }
        const gridCellX = (dotX - (dotX % 10)) / 10;
        const gridCellY = (dotY - (dotY % 10)) / 10;
        const smallCellX = dotX % 10;
        const smallCellY = dotY % 10;
        console.log("Trying to remove visual icon from the map. GridCell X "+gridCellX+" Y "+gridCellY+" smallCell X "+smallCellX+" Y "+smallCellY);
        //remove from visual map
        const gridCell = document.querySelector(`.grid-cell[data-gridcellx="${gridCellX}"][data-gridcelly="${gridCellY}"]`);
        if (gridCell) {
            console.log("===> Found big cell where element should be removed.");
            // Step 2: Within the .grid-cell element, find the .smallCell element with specific data attributes
            const smallCell = gridCell.querySelector(`.smallCell[data-smallcellx="${smallCellX}"][data-smallcelly="${smallCellY}"]`);
          
            if (smallCell) {
                console.log("===> Found small cell where element should be removed.");
              // Step 3: Within the .smallCell element, remove all div elements with the class .pickupContainer
              const pickupContainers = smallCell.querySelectorAll('.pickupContainer');
              pickupContainers.forEach((pickupContainer) => {
                pickupContainer.remove();
              });
            }
        }
    }
        /*
        for(let i = 0; i < gridSizeX; i++){
            for(let j = 0; j < gridSizeY; j++){
                for(let k = 0;)
            }
        }*/
    //removeItemsFromCoords(){

    //}

    function addDotsToMap(thisDotsArrayX, thisDotsArrayY) {
        console.log("Adding dots to the map");
        for (let i = 0; i < thisDotsArrayX.length; i++) {
            if (i < thisDotsArrayY.length) {
                CreateItem(thisDotsArrayX[i], thisDotsArrayY[i], "dot2")
            }
        }
    }

    function addPickupsToMap(thisPickupsArrayX, thisPickupsArrayY, thisPickupsArrayType) {
        console.log("Adding pickups to the map");
        for (let i = 0; i < thisPickupsArrayX.length; i++) {
            if (i < thisPickupsArrayY.length) {
                if (i < thisPickupsArrayType.length) {
                    let itemName = "temp1";
                    switch (thisPickupsArrayType[i]) {
                        case "0000":
                            itemName = "gemGreen";
                            break;
                        case "1000":
                            itemName = "gemRed";
                            break;
                        case "2000":
                            itemName = "gemBlue";
                            break;
                        case "3000":
                            itemName = "closeShutters";
                            break;
                        case "4000":
                            itemName = "rabbit";
                            break;
                        case "5000":
                            itemName = "ghost";
                            break;
                        case "6000":
                            itemName = "hourglass";
                            break;
                        case "7000":
                            itemName = "teleport1";
                            break;
                        case "7010":
                            itemName = "teleport2";
                            break;
                        case "7020":
                            itemName = "teleport3";
                            break;
                        case "7030":
                            itemName = "teleport4";
                            break;
                        case "7040":
                            itemName = "target1";
                            break;
                        case "7050":
                            itemName = "target2";
                            break;
                        case "7060":
                            itemName = "target3";
                            break;
                        case "7070":
                            itemName = "target4";
                            break;
                        case "8000":
                            itemName = "slow";
                            break;

                    }
                    CreateItem(thisPickupsArrayX[i], thisPickupsArrayY[i], itemName)
                }
            }
        }
    }

    // Function to delete the grid
    function DeleteGrid() {
        console.log("deleting grid - attempt...");
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.firstChild);
            //console.log("deleting grid.");
        }
    }

    function GenerateGrid(geometryArray, sizeX, sizeY) {
        //console.log("Starting grid generation... Length: "+geometryArray.length+" sizeX:"+sizeX+" sizeY:"+sizeY);
        // Set the number of columns in the grid
        gridContainer.style.gridTemplateColumns = `repeat(${sizeX}, ${cellSize}px)`;
        gridContainer.style.gridTemplateRows = `repeat(${sizeY}, ${cellSize}px)`;

        let cellImage = "images/gemGreen.png";
        let styleImage = "gemGreen";
        // Create the grid and assign IDs, coordinates, and hover effect to the cells
        for (let i = 0; i < sizeX * sizeY; i++) {
            //console.log("geometryArray["+i+"] = "+geometryArray[i]);
            switch (geometryArray[i]) {
                case "0000":
                case "0010": //?
                case "0020": //?
                case "0001": //?
                    cellImage = "images/floor.png";
                    styleImage = "floor";
                    break;
                case "5000":
                case "5100":
                case "5200":
                case "5300":
                case "6000":
                case "4000":
                case "4100":
                case "4200":
                case "4300":
                case "5555":
                case "1000":
                case "1020": //?
                case "1030": //?
                case "1100":
                case "1120": //?
                case "1130": //?
                case "3000":
                case "3100":
                case "3200":
                case "3300":
                    cellImage = "images/wall.png";
                    styleImage = "wall";
                    break;
                case "7000":
                    cellImage = "images/holeTopLeft.png";
                    styleImage = "holeTopLeft";
                    break;
                case "7100":
                    cellImage = "images/holeTopRight.png";
                    styleImage = "holeTopRight";
                    break;
                case "7200":
                    cellImage = "images/holeBottomRight.png";
                    styleImage = "holeBottomRight";
                    break;
                case "7300":
                    cellImage = "images/holeBottomLeft.png";
                    styleImage = "holeBottomLeft";
                    break;
                case "7001":
                    cellImage = "images/shutterTopLeft.png";
                    styleImage = "shutterTopLeft";
                    break;
                case "7101":
                    cellImage = "images/shutterTopRight.png";
                    styleImage = "shutterTopRight";
                    break;
                case "7201":
                    cellImage = "images/shutterBottomRight.png";
                    styleImage = "shutterBottomRight";
                    break;
                case "7301":
                    cellImage = "images/shutterBottomLeft.png";
                    styleImage = "shutterBottomLeft";
                    break;
            }
            //console.log("image:"+cellImage);
            //const image = document.createElement('img');
            //image.src = cellImage;
            const cell = document.createElement('div');
            cell.className = 'grid-cell ' + styleImage;
            //cell.appendChild(image);

            // Calculate gridCellX and gridCellY
            const gridCellX = i % sizeX;
            const gridCellY = Math.floor(i / sizeX);

            //Insert start
            if(gridCellX == startX && gridCellY == startY){
                console.log("Adding start @ "+gridCellX+","+gridCellY);
                const startImage = document.createElement('img');
                startImage.src = 'images/start.png';
                startImage.className = 'startGoal';
                cell.appendChild(startImage);
            }
            
            //Insert goal
            if(gridCellX == goalX && gridCellY == goalY){
                console.log("Adding goal @ "+gridCellX+","+gridCellY);
                const goalImage = document.createElement('img');
                goalImage.src = 'images/goal.png';
                goalImage.className = 'startGoal';
                cell.appendChild(goalImage);
            }
            // Assign IDs and coordinates to the cell
            cell.setAttribute('data-gridCellID', i);
            const scoreBox = document.createElement('div');
            scoreBox.className = "scoreBox";
            let scoreHere = checkpointsArray[i];
            scoreBox.innerText = scoreHere;
            let colorString = "rgb(" + Math.min(255, 5 * scoreHere) + ", " + Math.max(0, 255 - 5 * scoreHere) + ", "+Math.min(Math.max((scoreHere * 5) - 255, 0), 255)+", 255)";
            if(scoreHere == 0){
                colorString = "rgb(177,177,177)";
                scoreBox.className = "scoreBox zero";
            }
            //console.log(colorString);
            scoreBox.style.color = colorString;
            cell.appendChild(scoreBox);
            cell.setAttribute('data-gridCellX', gridCellX);
            cell.setAttribute('data-gridCellY', gridCellY);

            // Set the cell size
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';

            // Add the hover effect when hovering over the cell
            cell.addEventListener('mouseenter', () => {
                cell.classList.add('hovered');
            });

            // Remove the hover effect when no longer hovering over the cell
            cell.addEventListener('mouseleave', () => {
                cell.classList.remove('hovered');
            });


            cell.style.gridTemplateColumns = `repeat(10, ${cellSize / 10 }px)`;
            cell.style.gridTemplateRows = `repeat(10, ${cellSize / 10}px)`;

            const smallGrid = document.createElement('div');
            for (let i = 0; i < 100; i++) {
                const smallCell = document.createElement('div');
                smallCell.className = "smallCell";
                const smallCellX = i % 10;
                const smallCellY = Math.floor(i / 10);
                smallCell.setAttribute('data-smallCellID', i);
                smallCell.setAttribute('data-smallCellX', smallCellX);
                smallCell.setAttribute('data-smallCellY', smallCellY);
                /*
                if(smallCellX == 2 && smallCellY == 2){
                    const image = document.createElement('img');
                    image.src = "images/gemGreen.png";
                    const pickupContainer = document.createElement('div');
                    pickupContainer.class = "pickupContainer";
                    pickupContainer.appendChild(image);
                    smallCell.appendChild(image);
                }
                */
                cell.appendChild(smallCell);
            }
            gridContainer.appendChild(cell);


        }
        addClickingAction();
    }
    // Set up a click event listener for the "Delete Grid" button
    /*
    const deleteGridButton = document.getElementById('delete-grid-button');
    deleteGridButton.addEventListener('click', () => {
        DeleteGrid(); // Delete the grid when the button is clicked
    });
    // Set up a click event listener for the "Generate Grid" button
    const generateGridButton = document.getElementById('generate-grid-button');
    generateGridButton.addEventListener('click', () => {
        DeleteGrid(); // Delete the existing grid (optional, if you want to clear before generating)
        GenerateGrid(geometryArray, 23,23); // Generate a new grid when the button is clicked
    });
    */
    //Loading the map after choosing a file:
    const fileInput = document.getElementById('file-input');

    // Add a 'change' event listener to the file input
    fileInput.addEventListener('change', (event) => {
        // Function to run after a file is chosen
        console.log("File has changed.")

        function processFile() {
            console.log("Processing the file.")
            // Access the selected file using event.target.files
            const selectedFile = event.target.files[0];

            // Perform your desired actions with the selected file here
            //console.log(`File selected: ${selectedFile.name}`);
            readBytesFromFile();
            // Call your function or execute your code here
        }

        // Call the function to process the file
        processFile();
    });

    // Add a click event listener to the button
    const saveMapButton = document.getElementById('save-map-button');
    saveMapButton.addEventListener('click', SaveMap);

    //---------------------------------------------------------------------MAP SAVE---------------------------------------------------------------
    function SaveMap(){
        let dataArray = [0x20, 0x02, 0x00, 0x00]; // Example data array (byte values)
        const mapSizeXHex = mapSizeX.toString(16);
        const mapSizeYHex = mapSizeY.toString(16);
        const howManyCheckpointsHex = howManyCheckpoints.toString(16);
        console.log("Saving. Map size: "+mapSizeX+" ("+mapSizeXHex+") "+mapSizeY+ "("+mapSizeYHex+"); checkpoint count: "+howManyCheckpoints+" ("+howManyCheckpointsHex+")");
        
        //Line one
        dataArray.push(mapSizeX);
        dataArray.push(0x00);
        dataArray.push(0x00);
        dataArray.push(0x00);
        dataArray.push(mapSizeY);
        dataArray.push(0x00);
        dataArray.push(0x00);
        dataArray.push(0x00);
        dataArray.push(howManyCheckpoints & 0xFF);
        dataArray.push((howManyCheckpoints >> 8) & 0xFF);
        dataArray.push(0x00);
        dataArray.push(0x00);
        //Line two & style
        dataArray.push(startX & 0xFF);
        dataArray.push((startX >> 8) & 0xFF);
        dataArray.push(startY & 0xFF);
        dataArray.push((startY >> 8) & 0xFF);
        dataArray.push(goalX & 0xFF);
        dataArray.push((goalX >> 8) & 0xFF);
        dataArray.push(goalY & 0xFF);
        dataArray.push((goalY >> 8) & 0xFF);
        flagsToInsert = 2;
        if(hasPickups) flagsToInsert += 4;
        if(hasDots) flagsToInsert += 1;
        dataArray.push(flagsToInsert & 0xFF);
        dataArray.push((flagsToInsert >> 8) & 0xFF);
        dataArray.push(0x00);
        dataArray.push(0x00);
        const inputString = currentTheme;
        const utf8Encoder = new TextEncoder();
        const utf8Bytes = utf8Encoder.encode(inputString);
        dataArray.push(...utf8Bytes);
        //Fill empty bytes until start of geometry
        for(let i = dataArray.length; i < 540; i++){
            dataArray.push(0x00);
        }
        //Insert timer
        dataArray.push(timerValue & 0xFF);
        dataArray.push((timerValue >> 8) & 0xFF);
        dataArray.push(0x00);
        dataArray.push(0x00);
        //Insert geometry
        console.log("Geometry first block "+geometryArray[0][0]+" "+geometryArray[0][1]+" "+geometryArray[0][2]+" "+geometryArray[0][3]);
        for(let i = 0; i < geometryArray.length; i++){
            dataArray.push(parseInt(geometryArray[i][0]));
            dataArray.push(parseInt(geometryArray[i][1]));
            dataArray.push(parseInt(geometryArray[i][2]));
            dataArray.push(parseInt(geometryArray[i][3]));
        }
        console.log("Data array:"+dataArray.join(","));
        console.log("hasDots: "+hasDots+" howManyDots: "+howManyDots+" dotsArrayX[0]="+dotsArrayX[0]+" dotsArrayY[0]="+dotsArrayY[0]);
        //Insert dots if needed
        if(hasDots){
            dataArray.push(howManyDots & 0xFF);
            dataArray.push((howManyDots >> 8) & 0xFF);
            dataArray.push(0x00);
            dataArray.push(0x00);
            for(let i = 0; i < dotsArrayX.length; i++){
                if(i < dotsArrayY.length){
                    //console.log("Inserting dot no."+i+" => "+dotsArrayX[i]+","+dotsArrayY[i])
                    dataArray.push(dotsArrayX[i] & 0xFF);
                    dataArray.push((dotsArrayX[i] >> 8) & 0xFF);
                    dataArray.push(dotsArrayY[i] & 0xFF);
                    dataArray.push((dotsArrayY[i] >> 8) & 0xFF);
                }
            }
        }
        //Insert checkpoints
        for(let i = 0; i < howManyCheckpoints; i++){
            dataArray.push(checkpointsArray[i] & 0xFF);
        }
        //Insert pickups
        if(hasPickups){
            dataArray.push(howManyPickups & 0xFF);
            dataArray.push((howManyPickups >> 8) & 0xFF);
            dataArray.push(0x00);
            dataArray.push(0x00);
            for(let i = 0; i < pickupsArrayX.length; i++){
                if(i < pickupsArrayY.length){
                    console.log("Inserting pickup no."+i+" => "+pickupsArrayX[i]+","+pickupsArrayY[i]+" with type "+pickupsArrayType[i][0]+pickupsArrayType[i][1]+pickupsArrayType[i][2]+pickupsArrayType[i][3] );
                    dataArray.push(pickupsArrayX[i] & 0xFF);
                    dataArray.push((pickupsArrayX[i] >> 8) & 0xFF);
                    dataArray.push(pickupsArrayY[i] & 0xFF);
                    dataArray.push((pickupsArrayY[i] >> 8) & 0xFF);
                    //dataArray.push(pickupsArrayType[i] & 0xFF);
                    //dataArray.push((pickupsArrayType[i] >> 8) & 0xFF);
                    //dataArray.push(parseInt(pickupsArrayType[i]) & 0xFF);
                    dataArray.push(parseInt(pickupsArrayType[i][0]));
                    dataArray.push(parseInt(pickupsArrayType[i][1]));
                    dataArray.push(parseInt(pickupsArrayType[i][2]));
                    dataArray.push(parseInt(pickupsArrayType[i][3]));
                    //dataArray.push(parseInt(pickupsArrayType[i][1]) & 0xFF);
                    //dataArray.push(parseInt(pickupsArrayType[i][2]) & 0xFF);
                    //dataArray.push(parseInt(pickupsArrayType[i][3]) & 0xFF);
                    //dataArray.push(0x00);
                    //dataArray.push(0x00);
                }
            }
        }
        const uint8Array = new Uint8Array(dataArray);
        //console.log("uInt8 array:"+uint8Array.join(","));
        const blob = new Blob([uint8Array]);
        saveAs(blob, 'mapname.lab'); // 'filename.bin' is the default file name

    }
    //----------------------------------------------------------END MAP SAVE----------------------------------------------------------------------
    //-----------------------TOOLBOX-------------------------
// Function which selects a tool
function selectTool(event) {
    const clickedButton = event.target;
    currentTool = clickedButton.getAttribute("data-tool");
    console.log("Selecting tool: " + currentTool + "...");
    if(currentTool == "gemGreen" || currentTool == "gemRed" || currentTool == "gemBlue" || currentTool == "closeShutters" || currentTool == "rabbit" || currentTool == "ghost" || currentTool == "hourglass" || currentTool == "teleport1" || currentTool == "teleport2" || currentTool == "teleport3" || currentTool == "teleport4" || currentTool == "target1" || currentTool == "target2" || currentTool == "target3" || currentTool == "target4" || currentTool == "slow" || currentTool == "eraser" || currentTool == "dots" || currentTool == "dotseraser"){
        console.log("Selected pickup placing tool");
        drawingOnBigGrid = false;
        drawingOnSmallGrid = true;
        
        const smallCells = document.querySelectorAll('.smallCell');
        smallCells.forEach((smallCell) => {
            smallCell.addEventListener('click', placeGeometry);
         });
        const largeGridCells = document.querySelectorAll('.grid-cell');
        largeGridCells.forEach((gridCell) => {
            gridCell.removeEventListener('click', placeGeometry);
        });
    }
    else{
        console.log("will be using big grid");
        drawingOnBigGrid = true;
        drawingOnSmallGrid = false;
        const smallCells = document.querySelectorAll('.smallCell');
        smallCells.forEach((smallCell) => {
            smallCell.removeEventListener('click', placeGeometry);
         });
        const largeGridCells = document.querySelectorAll('.grid-cell');
        largeGridCells.forEach((gridCell) => {
            gridCell.addEventListener('click', placeGeometry);
        });
    }
    
    // Remove the "selected" class from all toolButtons
    toolButtons.forEach((button) => {
        button.classList.remove("selected");
    });

    // Add the "selected" class to the clicked button
    clickedButton.classList.add("selected");
}

// Add a click event listener to the button for each tool
const toolButtons = document.querySelectorAll('.drawwall, .drawfloor, .drawhole, .drawshutter, .addscore, .add5score, .add10score, .add25score, .subtractscore, .subtract5score, .zeroscore, .gemGreen, .gemRed, .gemBlue, .closeShutters, .rabbit, .ghost, .hourglass, .slow, .teleport1, .teleport2, .teleport3, .teleport4, .target1, .target2, .target3, .target4, .eraser, .dots, .dotseraser, .placestart, .placegoal');
toolButtons.forEach((thisButton) => {
    thisButton.addEventListener('click', selectTool);
});
    //-----------------------END OF TOOLBOX-------------------------

    function addClickingAction(){
        // Get all grid cells
        const gridCells = document.querySelectorAll('.grid-cell');
        // Add a click event listener to each grid cell
        gridCells.forEach((cell) => {
            cell.addEventListener('click', placeGeometry);
        });
        const smallGridCells = document.querySelectorAll('.smallCell');
        gridCells.forEach((cell) => {
            cell.addEventListener('click', placeGeometry);
        });

    }
    

    function placeStart(placeOnX, placeOnY, event){
        const startElements = document.querySelectorAll('.startGoal[src="images/start.png"]');
            startElements.forEach((startElement) => {
                startElement.remove();
            });
        startX = placeOnX;
        startY = placeOnY;
        
        const gridCell = document.querySelector(`.grid-cell[data-gridcellx="${startX}"][data-gridcelly="${startY}"]`);
        if (gridCell) {
            console.log("Placing start on "+startX+","+startY);
            const startImage = document.createElement('img');
            startImage.src = 'images/start.png';
            startImage.className = 'startGoal';
            gridCell.appendChild(startImage);
        }
        refreshStats();
    }

    function placeGoal(placeOnX, placeOnY, event){
        const startElements = document.querySelectorAll('.startGoal[src="images/goal.png"]');
            startElements.forEach((startElement) => {
                startElement.remove();
            });
        goalX = placeOnX;
        goalY = placeOnY;
        
        const gridCell = document.querySelector(`.grid-cell[data-gridcellx="${goalX}"][data-gridcelly="${goalY}"]`);
        if (gridCell) {
            console.log("Placing start on "+startX+","+startY);
            const goalImage = document.createElement('img');
            goalImage.src = 'images/goal.png';
            goalImage.className = 'startGoal';
            gridCell.appendChild(goalImage);
        }
        refreshStats();
    }
    function placeGeometry(event){
        if(drawingOnBigGrid == true){
            const gridCellID = event.currentTarget.getAttribute('data-gridCellID');
            const gridCellX = event.currentTarget.getAttribute('data-gridCellX');
            const gridCellY = event.currentTarget.getAttribute('data-gridCellY');
            console.log("Drawing on Big grid = "+drawingOnBigGrid+" gridCellID: "+gridCellID);
            let cellIdInt = parseInt(gridCellID);
            topRightId= (cellIdInt+1);
            bottomLeftId = (cellIdInt+mapSizeX);
            bottomRightId = (cellIdInt+mapSizeX+1);
            let row1;
            let row2;
            let row3;
            let row4;
            let scoreBox = event.currentTarget.querySelector(".scoreBox");
            let newScore;
            let anotherGridCell;
            switch(currentTool){
                case "placestart":
                    console.log("Trying to place Start @ "+gridCellX+","+gridCellY);
                    placeStart(gridCellX,gridCellY, event);
                    break;
                case "placegoal":
                    console.log("Trying to place Start @ "+gridCellX+","+gridCellY);
                    placeGoal(gridCellX,gridCellY, event);
                    break;
                case "floor":
                    event.currentTarget.className = "grid-cell floor";
                    geometryArray[gridCellID] = "0000";
                    break;
                case "wall":
                    event.currentTarget.className = "grid-cell wall";
                    geometryArray[gridCellID] = "6000";
                    break;
                case "hole":
                    event.currentTarget.className = "grid-cell holeTopLeft";
                    geometryArray[gridCellID] = "7000";
                    row1 = Math.floor(cellIdInt / mapSizeX);
                    row2 = Math.floor((cellIdInt + 1) / mapSizeX);
                    row3 = Math.floor((cellIdInt + mapSizeX) / mapSizeX);
                    row4 = Math.floor((cellIdInt + mapSizeX + 1) / mapSizeX);
                    console.log("topRightId: "+topRightId+" geoArrayLen: "+geometryArray.length+" row1:"+row1+" row2:"+row2);
                    if(topRightId < geometryArray.length && (row1 == row2)){
                        console.log("changing grid ID = "+topRightId);
                        geometryArray[topRightId] = "7100";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+topRightId+'"]');
                        console.log("BEFORE anotherGridcellCLASS="+anotherGridCell.className);
                        anotherGridCell.className = "grid-cell holeTopRight";
                        console.log("AFTER anotherGridcellCLASS="+anotherGridCell.className);
                    }
                    if(bottomLeftId < geometryArray.length){
                        console.log("changing grid ID = "+bottomLeftId);
                        geometryArray[bottomLeftId] = "7300";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+bottomLeftId+'"]');
                        anotherGridCell.className = "grid-cell holeBottomLeft";
                    }
                    if(bottomRightId < geometryArray.length && (row3 == row4)){
                        console.log("changing grid ID = "+bottomRightId);
                        geometryArray[bottomRightId] = "7200";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+bottomRightId+'"]');
                        anotherGridCell.className = "grid-cell holeBottomRight";
                    }
                    break;
                case "shutter":
                    event.currentTarget.className = "grid-cell shutterTopLeft";
                    geometryArray[gridCellID] = "7001";
                    row1 = Math.floor(cellIdInt / mapSizeX);
                    row2 = Math.floor((cellIdInt + 1) / mapSizeX);
                    row3 = Math.floor((cellIdInt + mapSizeX) / mapSizeX);
                    row4 = Math.floor((cellIdInt + mapSizeX + 1) / mapSizeX);
                    console.log("topRightId: "+topRightId+" geoArrayLen: "+geometryArray.length+" row1:"+row1+" row2:"+row2);
                    if(topRightId < geometryArray.length && (row1 == row2)){
                        console.log("changing grid ID = "+topRightId);
                        geometryArray[topRightId] = "7101";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+topRightId+'"]');
                        console.log("BEFORE anotherGridcellCLASS="+anotherGridCell.className);
                        anotherGridCell.className = "grid-cell shutterTopRight";
                        console.log("AFTER anotherGridcellCLASS="+anotherGridCell.className);
                    }
                    if(bottomLeftId < geometryArray.length){
                        console.log("changing grid ID = "+bottomLeftId);
                        geometryArray[bottomLeftId] = "7301";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+bottomLeftId+'"]');
                        anotherGridCell.className = "grid-cell shutterBottomLeft";
                    }
                    if(bottomRightId < geometryArray.length && (row3 == row4)){
                        console.log("changing grid ID = "+bottomRightId);
                        geometryArray[bottomRightId] = "7201";
                        anotherGridCell = document.querySelector('[data-gridCellID="'+bottomRightId+'"]');
                        anotherGridCell.className = "grid-cell shutterBottomRight";
                    }
                    break;
                case "addscore":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.min((parseInt(scoreBox.innerText) + 1), 100);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "add5score":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.min((parseInt(scoreBox.innerText) + 5), 100);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "add10score":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.min((parseInt(scoreBox.innerText) + 10), 100);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "add25score":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.min((parseInt(scoreBox.innerText) + 25), 100);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "subtractscore":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.max((parseInt(scoreBox.innerText) - 1), 0);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "subtract5score":
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    newScore = Math.max((parseInt(scoreBox.innerText) - 5), 0);
                    checkpointsArray[cellIdInt] = newScore;
                    scoreBox.innerText = newScore.toString();
                    refreshScoreColors(scoreBox);
                    break;
                case "zeroscore":
                    checkpointsArray[cellIdInt] = 0;
                    scoreBox = event.currentTarget.querySelector(".scoreBox");
                    scoreBox.innerText = 0;
                    refreshScoreColors(scoreBox);
                    break;
            }
        }
        if(drawingOnSmallGrid == true){
            const smallCellID = event.currentTarget.getAttribute('data-smallcellid');
            const smallCellX = event.currentTarget.getAttribute('data-smallcellx');
            const smallCellY = event.currentTarget.getAttribute('data-smallcelly');
            const bigCellID = event.currentTarget.parentNode.getAttribute('data-gridcellid');
            const bigCellX = event.currentTarget.parentNode.getAttribute('data-gridcellx');
            const bigCellY = event.currentTarget.parentNode.getAttribute('data-gridcelly');
            let smallCellIdInt = parseInt(smallCellID);
            console.log("currentTool: "+currentTool+" bigCellID: "+bigCellID+" smallCellID: "+smallCellID+" Clicked onto: "+event.currentTarget.name+" OF CLASS: "+event.currentTarget.className);
            const placeOnX = parseInt(parseInt(bigCellX * 10) + parseInt(smallCellX));
            const placeOnY = parseInt(parseInt(bigCellY * 10) + parseInt(smallCellY));
            console.log("Small cell coords: "+(bigCellX * 10 + smallCellX)+" , "+(bigCellY * 10 + smallCellY));
            if(currentTool == "dots"){
                console.log("Trying to add dot @ "+placeOnX+","+placeOnY);
                placeDot(placeOnX, placeOnY);
            }
            else if(currentTool == "dotseraser"){
                console.log("Trying to erase  dots @ "+placeOnX+","+placeOnY);
                removeDot(placeOnX, placeOnY);
            }
            else if(currentTool == "eraser"){
                console.log("======> Trying to remove item with eraser.");
                removeItem(placeOnX, placeOnY);
            }
            else{
                placePickup(currentTool, placeOnX, placeOnY);
            }
            /*
            switch(currentTool){
                case "gemGreen":
                    console.log("gemGreen");
                    break;
                case "gemRed":
                    console.log("gemRed");
                    break;
            }
            */
        }
        refreshStats();
    }
    function refreshScoreColors(thisScoreBox){
        //const scoreBox = scoreBox.querySelectorAll('.scoreBox');
        //scoreBoxes.forEach((cell) => {
            const scoreInside = thisScoreBox.innerText;
            thisScoreBox.innerText = scoreInside;
            let colorString = "rgb(" + Math.min(255, 5 * scoreInside) + ", " + Math.max(0, 255 - 5 * scoreInside) + ", "+Math.min(Math.max((scoreInside * 10) - 255, 0), 255)+", 255)";
            if(scoreInside == 0){
                colorString = "rgb(177,177,177)";
                thisScoreBox.className = "scoreBox zero";
            }
            else{
                thisScoreBox.className = "scoreBox";
            }
            thisScoreBox.style.color = colorString;
            refreshStats();
        //});
    }
    function placePickup(whichPickup, placeOnX, placeOnY){
        if(pickupsArrayType.length == pickupsArrayX.length){
            pickupsArrayX.push(placeOnX);
            pickupsArrayY.push(placeOnY);
            switch(whichPickup){
                case "gemGreen":
                    pickupsArrayType.push("0000");
                    break;
                case "gemRed":
                    pickupsArrayType.push("1000");
                    break;
                case "gemBlue":
                    pickupsArrayType.push("2000");
                    break;
                case "closeShutters":
                    pickupsArrayType.push("3000");
                    break;
                case "rabbit":
                    pickupsArrayType.push("4000");
                    break;
                case "ghost":
                    pickupsArrayType.push("5000");
                    break;
                case "hourglass":
                    pickupsArrayType.push("6000");
                    break;
                case "teleport1":
                    pickupsArrayType.push("7000");
                    break;
                case "teleport2":
                    pickupsArrayType.push("7010");
                    break;
                case "teleport3":
                    pickupsArrayType.push("7020");
                    break;
                case "teleport4":
                    pickupsArrayType.push("7030");
                    break;
                case "target1":
                    pickupsArrayType.push("7040");
                    break;
                case "target2":
                    pickupsArrayType.push("7050");
                    break;
                case "target3":
                    pickupsArrayType.push("7060");
                    break;
                case "target4":
                    pickupsArrayType.push("7070");
                    break;
                case "slow":
                    pickupsArrayType.push("8000");
                    break;
            }
            howManyPickups += 1;
            hasPickups = true;
            CreateItem(placeOnX, placeOnY, whichPickup);
            refreshStats();
            console.log("Place Pickup OK - placed "+whichPickup+" at "+placeOnX+","+placeOnY);
            console.log("Pickups array: "+pickupsArrayType.join());
        }
        else{
            console.log("Place Pickup error - arrays not equal");
        }
    }
    function placeDot(dotX, dotY){
        dotsArrayX.push(dotX);
        dotsArrayY.push(dotY);
        howManyDots += 1;
        hasDots = true;
        CreateItem(dotX, dotY, "dot2");
        refreshStats();
    }

    function removeDot(dotX, dotY){
        console.log("function to remove dots");
        //remove from array
        for(let i = 0; i < dotsArrayX.length; i++){
            if(dotsArrayX[i] == dotX && dotsArrayY[i] == dotY){
                dotsArrayX.splice(i, 1);
                dotsArrayY.splice(i, 1);
                console.log("------------> Removing dot from coords "+dotX+","+dotY);
                howManyDots -= 1;
                if(howManyDots <= 0){
                    hasDots = false;
                    howManyDots = 0;
                }
            }
        }
        
        const gridCellX = (dotX - (dotX % 10)) / 10;
        const gridCellY = (dotY - (dotY % 10)) / 10;
        const smallCellX = dotX % 10;
        const smallCellY = dotY % 10;
        console.log("Trying to remove visual DOT from the map. GridCell X "+gridCellX+" Y "+gridCellY+" smallCell X "+smallCellX+" Y "+smallCellY);
        //remove from visual map
        const gridCell = document.querySelector(`.grid-cell[data-gridcellx="${gridCellX}"][data-gridcelly="${gridCellY}"]`);
        if (gridCell) {
            console.log("===> Found big cell where element should be removed.");
            // Step 2: Within the .grid-cell element, find the .smallCell element with specific data attributes
            const smallCell = gridCell.querySelector(`.smallCell[data-smallcellx="${smallCellX}"][data-smallcelly="${smallCellY}"]`);
          
            if (smallCell) {
                console.log("===> Found small cell where element should be removed.");
              // Step 3: Within the .smallCell element, remove all div elements with the class .pickupContainer
              const dotContainers = smallCell.querySelectorAll('.dotContainer');
              dotContainers.forEach((dotContainer) => {
                dotContainer.remove();
              });
            }
        }
        refreshStats();
    }

    function refreshStats(){
        console.log("Refreshing stats.");
        console.log("CURRENT THEME 3 = "+currentTheme);
        const mapSizeOutput = document.getElementById('mapSize');
        const startPointOutput = document.getElementById('startPoint');
        const goalPointOutput = document.getElementById('goalPoint');
        const pickupsOutput = document.getElementById('pickups');
        const flag2Output = document.getElementById('flag2');
        const dotsOutput = document.getElementById('dots');
        const timerOutput = document.getElementById('timer');
        const themeOutput = document.getElementById('mapInfoTheme');
        const gemGreenOutput = document.getElementById('mapInfoGemGreen');
        const gemRedOutput = document.getElementById('mapInfoGemRed');
        const gemBlueOutput = document.getElementById('mapInfoGemBlue');
        const closeShuttersOutput = document.getElementById('mapInfoCloseShutters');
        const rabbitOutput = document.getElementById('mapInfoRabbits');
        const teleportsOutput = document.getElementById('mapInfoTeleports');
        const slowsOutput = document.getElementById('mapInfoSlows');
        const ghostsOutput = document.getElementById('mapInfoGhosts');
        const hourglassesOutput = document.getElementById('mapInfoHourglasses');
        const wallsOutput = document.getElementById('mapInfoWalls');
        const holesOutput = document.getElementById('mapInfoHoles');
        const shuttersOutput = document.getElementById('mapInfoShutters');
        
        mapSizeOutput.innerText = mapSizeX + "," + mapSizeY;
        startPointOutput.innerText = startX + "," + startY;
        goalPointOutput.innerText = goalX + "," + goalY;
        pickupsOutput.innerText = hasPickups;
        flag2Output.innerText = flagTwo;
        dotsOutput.innerText = hasDots;
        timerOutput.innerText = timerValue;
        themeOutput.innerText = currentTheme;
        gemGreenOutput.innerText = getCount("gemGreen");
        gemRedOutput.innerText = getCount("gemRed");
        gemBlueOutput.innerText = getCount("gemBlue");
        closeShuttersOutput.innerText = getCount("closeShutters");
        rabbitOutput.innerText = getCount("rabbit");
        teleportsOutput.innerText = getCount("teles");
        slowsOutput.innerText = getCount("slow");
        ghostsOutput.innerText = getCount("ghost");
        hourglassesOutput.innerText = getCount("hourglass");
        wallsOutput.innerText = getCount("wall");
        holesOutput.innerText = getCount("hole");
        shuttersOutput.innerText = getCount("shutter");
        fixWalls();
    }

    selectTheme.addEventListener('change', function () {
        const selectedValue = selectTheme.value;
        // Call your function here, passing the selectedValue as an argument.
        changeTheme(selectedValue);
    });

    function changeTheme(selectedValue){
        console.log("selected theme: "+selectedValue);
        currentTheme = selectedValue;
        refreshStats();
    }

    function getCount(whatToCount){
        let value = 0;
        switch(whatToCount){
            case "gemGreen":
                value = getCountInArray("0000", pickupsArrayType);
                break;
            case "gemRed":
                value = getCountInArray("1000", pickupsArrayType);
                break;
            case "gemBlue":
                value = getCountInArray("2000", pickupsArrayType);
                break;
            case "closeShutters":
                value = getCountInArray("3000", pickupsArrayType);
                break;
            case "rabbit":
                value = getCountInArray("4000", pickupsArrayType);
                break;
            case "ghost":
                value = getCountInArray("5000", pickupsArrayType);
                break;
            case "hourglass":
                value = getCountInArray("6000", pickupsArrayType);
                break;
            case "teles":
                value = getCountInArray("7000", pickupsArrayType);
                value += getCountInArray("7010", pickupsArrayType);
                value += getCountInArray("7020", pickupsArrayType);
                value += getCountInArray("7030", pickupsArrayType);
                break;
            case "slow":
                value = getCountInArray("8000", pickupsArrayType);
                break;
            case "hole":
                value = getCountInArray("7000", geometryArray) * 0.25;
                value += getCountInArray("7100", geometryArray) * 0.25;
                value += getCountInArray("7200", geometryArray) * 0.25;
                value += getCountInArray("7300", geometryArray) * 0.25;
                break;
            case "shutter":
                value = getCountInArray("7001", geometryArray) * 0.25;
                value += getCountInArray("7101", geometryArray) * 0.25;
                value += getCountInArray("7201", geometryArray) * 0.25;
                value += getCountInArray("7301", geometryArray) * 0.25;
                break;
            case "wall":
                value = getCountInArray("5000", geometryArray);
                value += getCountInArray("5100", geometryArray);
                value += getCountInArray("5200", geometryArray);
                value += getCountInArray("5300", geometryArray);
                value += getCountInArray("6000", geometryArray);
                value += getCountInArray("4000", geometryArray);
                value += getCountInArray("4100", geometryArray);
                value += getCountInArray("4200", geometryArray);
                value += getCountInArray("4300", geometryArray);
                value += getCountInArray("5555", geometryArray);
                value += getCountInArray("1000", geometryArray);
                value += getCountInArray("1010", geometryArray);
                value += getCountInArray("1020", geometryArray);
                value += getCountInArray("1030", geometryArray);
                value += getCountInArray("3000", geometryArray);
                value += getCountInArray("3100", geometryArray);
                value += getCountInArray("3200", geometryArray);
                value += getCountInArray("3300", geometryArray);
                break;
        }
        return value;
    }

    function getCountInArray(value, array){
        //console.log("Counting "+value+" entries in array: "+array);
        let count = 0;
        for(let i = 0; i < array.length; i++){
            if(array[i] == value){
                count += 1;
            }
        }
        //console.log("Returning Count: "+count);
        return count;
    }

    function fixWalls(){
        for(let i = 0; i < geometryArray.length; i++){
            if(!checkIfCellIdIsWall(i)) continue; //skip loop if cell isn't a wall
            const gridCellX = i % mapSizeX;
            const gridCellY = Math.floor(i / mapSizeX);
            //CHECK RIGHT SIDE
            let wallToRight;
            if(gridCellX == (mapSizeX - 1)){
                //it's on the right edge
                wallToRight = false;
            }
            else{
                wallToRight = checkIfCellIdIsWall(i + 1);
            }
            //CHECK LEFT SIDE
            let wallToLeft;
            if(gridCellX == 0){
                //it's on the left edge
                wallToLeft = false;
            }
            else{
                wallToLeft = checkIfCellIdIsWall(i - 1);
            }
            //CHECK ABOVE
            let wallAbove;
            if(gridCellY == 0){
                //it's on the top edge
                wallAbove = false;
            }
            else{
                wallAbove = checkIfCellIdIsWall(i - mapSizeX);
            }
            //CHECK BELOW
            let wallBelow;
            if(gridCellY == (mapSizeY -1)){
                //it's on the bottom edge
                wallBelow = false;
            }
            else{
                wallBelow = checkIfCellIdIsWall(i + mapSizeX);
            }
            let howManyWallsAround = 0;
            if(wallAbove) howManyWallsAround += 1;
            if(wallBelow) howManyWallsAround += 1;
            if(wallToLeft) howManyWallsAround += 1;
            if(wallToRight) howManyWallsAround += 1;

            console.log("i: "+i+" => "+wallAbove+" "+wallBelow+" "+wallToLeft+" "+wallToRight+" wallsAround: "+howManyWallsAround);
            switch(howManyWallsAround){
                case 0:
                    geometryArray[i] = "6000";
                    break;
                case 1:
                    if(wallAbove) geometryArray[i] = "4000";
                    else if(wallBelow) geometryArray[i] = "4200";
                    else if(wallToLeft) geometryArray[i] = "4300";
                    else if(wallToRight) geometryArray[i] = "4100";
                    break;
                case 2:
                    if(wallAbove && wallBelow) geometryArray[i] = "1000";
                    else if(wallAbove && wallToLeft) geometryArray[i] = "5300";
                    else if(wallToRight && wallToLeft) geometryArray[i] = "1100";
                    else if(wallToRight && wallAbove) geometryArray[i] = "5000";
                    else if(wallBelow && wallToRight) geometryArray[i] = "5100";
                    else if(wallToLeft && wallBelow) geometryArray[i] = "5200";
                    break;
                case 3:
                    if(!wallAbove) geometryArray[i] = "3100";
                    else if(!wallBelow) geometryArray[i] = "3300";
                    else if(!wallToLeft) geometryArray[i] = "3000";
                    else if(!wallToRight) geometryArray[i] = "3200";
                    break;
                case 4:
                    geometryArray[i] = "2000";
                    break;
            }
        }
    }

    function checkIfCellIdIsWall(cellId){
        //cellId = locX + locY * mapSizeX;
        if(cellId < 0){
            console.log(cellId+ "is NOT a wall (below 0)");
            return false;
        }
        if(cellId >= geometryArray.length){
            console.log(cellId+ "is NOT a wall (larger than length)");
            return false;
        }
        switch(geometryArray[cellId]){
            case "5000":
            case "5100":
            case "5200":
            case "5300":
            case "6000":
            case "4000":
            case "4100":
            case "4200":
            case "4300":
            case "5555":
            case "1000":
            case "1020":
            case "1030":
            case "1100":
            case "1120":
            case "1130":
            case "2000":
            case "3000":
            case "3100":
            case "3200":
            case "3300":
                console.log(cellId+ "is a wall");
                return true;
            default:
                console.log(cellId+ "is NOT a wall");
                return false;
        }
    }

    function newMap(mapX, mapY){
        console.log("Started generating a new map...");
        let newMapArray = new Array();
        let newCheckpointsArray = new Array();
        mapSizeX = mapX;
        mapSizeY = mapY;
        for(let i = 0; i < mapY; i++){//columns
            for(let j = 0; j < mapX; j++){//rows
                if(j == 0 || j == (mapX - 1) || i == 0 || i == (mapY - 1)){
                    newMapArray.push("1000"); //edges of map = wall
                }
                else{
                    newMapArray.push("0000"); //non-edges of map = floor
                }
                newCheckpointsArray.push(0);
            }
        }
        startX = 1;
        startY = 1;
        goalX = 3;
        goalY = 1;
        geometryArray = newMapArray;
        checkpointsArray = newCheckpointsArray;
        howManyCheckpoints = newCheckpointsArray.length;
        GenerateGrid(geometryArray, mapSizeX, mapSizeY);
        centerGrid();
        fixWalls();
    }
    // Add a click event listener to the button
    /*
    const newMapButton = document.getElementById('new-map-button');
    newMapButton.addEventListener('click', newMap(24,24));
    */
    
    const newMapButtonTiny = document.getElementById('new-map-button-tiny');
    newMapButtonTiny.addEventListener('click', () => {
        newMap(12,12); // Recenter the grid and reset the zoom when the button is clicked
    });
    const newMapButtonSmall = document.getElementById('new-map-button-small');
    newMapButtonSmall.addEventListener('click', () => {
        newMap(16,16); // Recenter the grid and reset the zoom when the button is clicked
    });
    // Set up a click event listener for the "Recenter Grid" button
    const newMapButton = document.getElementById('new-map-button');
    newMapButton.addEventListener('click', () => {
        newMap(24,24); // Recenter the grid and reset the zoom when the button is clicked
    });
    
    const newMapButtonBig = document.getElementById('new-map-button-big');
    newMapButtonBig.addEventListener('click', () => {
        newMap(30,30); // Recenter the grid and reset the zoom when the button is clicked
    });

    
    const newMapButtonHuge = document.getElementById('new-map-button-huge');
    newMapButtonHuge.addEventListener('click', () => {
        newMap(40,40); // Recenter the grid and reset the zoom when the button is clicked
    });
    
});
//TODO:
//start, goal
//stats/
//wall generate fix 
//stats refresh
//