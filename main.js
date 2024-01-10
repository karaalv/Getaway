/**
 * MAIN GAME SCRIPT
 * 
 * This file acts as the controller
 * for all game aspects.
 */

/* Import utilities from THREE.js library */
import * as THREE from 'three';

/**
 * Import external game functions.
 */
import { generateEnemy, generateNPC, generatePlayer } from './gameAvatars';
import { loadLevel1 } from './level1Loader';
import { loadLevel2 } from './level2Loader';

/*** GLOBAL VARIABLES ***/

/* THREE.js Properties */

// Game canvas.
const canvas = document.getElementById("canvas");

// Game renderer.
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});

// Scene.
const scene = new THREE.Scene();

// Game clock.
const gameClock = new THREE.Clock();

// Global camera.
let camera_Global;

// Camera properties.
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 200;

/* Game Properties */

// Time.
let gameTimer = 0; 

// Length.
const GAME_LENGTH = -200;

// Speed.
const playerHorizontalSpeed = 20.0;
let playerForwardSpeed = 30.0;

// NPC behaviour.
const spawnRate = 90;
const positionFrequency = 0.75;
const npcArray = [];

// Perspective.
let firstPerson = false;

// Level completion.
let levelCleared = false;
let levelFailed = false;

// Game avatars.
let playerObject_Global;
let enemyObject_Global;

/*** GAME CONTROLLER ***/

// Game control variables.
const gameMenu = document.getElementById('Game-menu');
const gamePausedText = document.getElementById('Paused-text');
const gameFailed = document.getElementById('Game-failed');
const gameCleared = document.getElementById('Game-cleared');
const levelSelectPanel = document.getElementById('Level-panel');
const levelEscapePrompt = document.getElementById('Level-escape');

const gameMenuButton = document.getElementById('Menu-button');
const level1Button = document.getElementById('Level1-button');
const level2Button = document.getElementById('Level2-button');

const keyStates =[];

// State variables.
let menuActive = true;
let failScreenActive = false;
let successScreenActive = false;
let gameActive = false;
let levelSelectScreenActive = true;
let pauseMenuActive = false;
let currentLevel = 'none';

/*** STATE MANAGEMENT CALLBACKS ***/

/**
 * Callback functions used to display game screens
 * and control game state.
 */

// Adjust menu color scheme for level 1.
function setLevel1Colours(){
    gameMenu.style.color = '#FFFFFF';
    gameMenuButton.style.color = '#FFFFFF';
    levelEscapePrompt.style.color = '#FFFFFF';
    document.getElementById('Menu-button-container').style.borderBottomColor = '#FFFFFF';
}

// Adjust menu color scheme for level 2.
function setLevel2Colours(){
    gameMenu.style.color = '#00008B';
    gameMenuButton.style.color = '#00008B';
    levelEscapePrompt.style.color = '#00008B';
    document.getElementById('Menu-button-container').style.borderBottomColor = '#00008B';
}

// Adjust menu color scheme for level select.
function setLevelSelectColours(){
    gameMenu.style.color = '#000000';
    gameMenuButton.style.color = '#000000';
    document.getElementById('Menu-button-container').style.borderBottomColor = '#000000';
}

// Render level select screen.
function returnToLevelSelect(){
    if(menuActive == true){
        deactivateMenu();
    }

    if(failScreenActive == true){
        deactivateFailScreen();
    }

    if(successScreenActive == true){
        deactivateSuccessScreen();
    }

    clearGameState();

    setLevelSelectColours();

    deactivatePauseDetails();
    activateMenu();
    activateLevelSelect();
}

// Start level 1 callback.
function startLevel1(){
    setLevel1Colours();

    deactivateLevelSelect();
    deactivateMenu();

    clearGameState();
    gameClock.start();
    initialiseLevel1();
}

// Start level 2 callback.
function startLevel2(){
    setLevel2Colours();

    deactivateLevelSelect();
    deactivateMenu();

    clearGameState();
    gameClock.start();
    initialiseLevel2();
}

// Pause game callback.
function pauseGame(){
    if(gameActive == true && levelFailed == false && levelCleared == false && levelSelectScreenActive == false){
        gameActive = false;
        gameClock.stop();
        activatePauseDetails();
        activateMenu();
        console.log('game paused')
    }
}

// Resume game callback.
function resumeGame(){
    console.log(`gameActive: ${gameActive}, levelfailed: ${levelFailed}, levelclearled: ${levelCleared}, level screen: ${levelSelectScreenActive}`)
    if(gameActive == false && levelFailed == false && levelCleared == false && levelSelectScreenActive == false){
        gameActive = true;
        gameClock.start();
        deactivatePauseDetails();
        deactivateMenu();
        console.log('game resumed')
        animate();
    }
}

// Restart game callback.
function restartGame(){
    // Toggle screens.
    if(failScreenActive == true){
        deactivateFailScreen();
    }
    if(successScreenActive == true){
        deactivateSuccessScreen();
    }
    if(menuActive == true){
        deactivateMenu();
    }
    console.log('restarting level')

    clearGameState();
    gameClock.start();

    if(currentLevel == '1'){
        initialiseLevel1();
    } else if (currentLevel == '2'){
        initialiseLevel2();
    } else {
        console.log('state error');
    }
}

// Restart game sate
function clearGameState(){
    console.log('clearing game state')

    scene.clear();
    renderer.clear();

    npcArray.length = 0;
    playerForwardSpeed = 30.0;
    levelFailed = false;
    levelCleared = false;
    gameActive = false;
    firstPerson = false;
    gameTimer = 0;
}

/* Display states. */

// Menu.
function activateMenu(){
    menuActive = true;
    gameMenu.style.display = 'block';
}

function deactivateMenu(){
    menuActive = false;
    gameMenu.style.display = 'none';
}

// Success screen.
function activateSuccessScreen(){
    successScreenActive = true;
    gameCleared.style.display = 'block';
    levelEscapePrompt.style.display = 'block';
}

function deactivateSuccessScreen(){
    successScreenActive = false;
    gameCleared.style.display = 'none';
    levelEscapePrompt.style.display = 'none';
}

// Failure screen.
function activateFailScreen(){
    failScreenActive = true;
    gameFailed.style.display = 'block';
    levelEscapePrompt.style.display = 'block';
}

function deactivateFailScreen(){
    failScreenActive = false;
    gameFailed.style.display = 'none';
    levelEscapePrompt.style.display = 'none';
}

// Level select panel.
function activateLevelSelect(){
    levelSelectScreenActive = true;
    levelSelectPanel.style.display = 'block';
}

function deactivateLevelSelect(){
    levelSelectScreenActive = false;
    levelSelectPanel.style.display = 'none';
}

// Game paused.
function activatePauseDetails(){
    pauseMenuActive = true;
    levelEscapePrompt.style.display = 'block';
    gamePausedText.style.display = 'block';
}

function deactivatePauseDetails(){
    pauseMenuActive = false;
    levelEscapePrompt.style.display = 'none';
    gamePausedText.style.display = 'none';
}

/*** WINDOW LISTENERS AND CALLBACKS ***/ 

// Toggle game menu listener.
gameMenuButton.addEventListener('click', () => {
    if(gameActive == true){
        pauseGame();
    } else {
        resumeGame();
    }
});

// Start level 1 listener.
level1Button.addEventListener('click', () => {
    startLevel1();
})

// Start level 2 listener.
level2Button.addEventListener('click', () => {
    startLevel2();
})

// Keyboard input listener.
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

// Press key.
function keyDown(event){

    keyStates[event.code] = true;

    // Pause game.
    if(event.code == 'KeyP'){
        if(gameActive == true){
            pauseGame();
        } else {
            resumeGame();
        }
    }

    // Restart game.
    if(event.code == 'KeyR'){
        if(levelFailed == true || levelCleared == true){
            restartGame();
        }
    }

    // Escape to level select.
    if(event.code == 'Escape'){
        if(
            (gameActive == false && levelCleared == true) || 
            (gameActive == false && levelFailed == true) ||
            (gameActive == false && menuActive == true && levelSelectScreenActive == false)
            ){
            returnToLevelSelect();
        }
    }

    // Toggle camera perspective.
    if(event.code == 'KeyC'){
        firstPerson = !firstPerson;
    }
}

// Release key.
function keyUp(event){
    keyStates[event.code] = false;
}

// Window resizing.
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
})

/*** LEVEL INITIALISATION ***/

// Level 1.
async function initialiseLevel1(){
    console.log('drawing level 1')
    currentLevel = '1';
    /* THREE JS Properties */

    // Define scene.
    scene.background = new THREE.Color(0x000021);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 5.75, 13);

    // Define renderer.
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera_Global = camera;

    /* Level Properties */

    // Generate level.
    const level1SceneObjects = await loadLevel1();
    for(let item of level1SceneObjects){
        scene.add(item);
    }

    /* Avatars */

    // Player - Generate and add to scene 
    const playerObject = await generatePlayer();

    for(let item of playerObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable.
    playerObject_Global = playerObject;

    // Enemy - Generate and add to scene.
    const enemyObject = await generateEnemy();

    for(let item of enemyObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable
    enemyObject_Global = enemyObject;

    /* Set game to active. */
    gameActive = true;

    // Call animation loop.
    animate();
}

// Level 2.
async function initialiseLevel2(){
    console.log('drawing level 2')
    currentLevel = '2'
    /* THREE JS Properties */

    // Define scene.
    scene.background = new THREE.Color(0xDBD3CE);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 5.75, 13);

    // Define renderer.
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera_Global = camera;

    /* Level Properties */

    // Generate level.
    const level2SceneObjects = await loadLevel2();
    for(let item of level2SceneObjects){
        scene.add(item);
    }

    /* Avatars */

    // Player - Generate and add to scene 
    const playerObject = await generatePlayer();

    for(let item of playerObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable.
    playerObject_Global = playerObject;

    // Enemy - Generate and add to scene.
    const enemyObject = await generateEnemy();

    for(let item of enemyObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable
    enemyObject_Global = enemyObject;

    /* Set game to active. */
    gameActive = true;

    // Call animation loop.
    animate();
}

/*** ANIMATION LOOP ***/
function animate(){

    // If game state is off, pause game.
    if(gameActive == false){
        console.log('animation block')
        return;
    } else {
        console.log(`animating gameActive: ${gameActive}`)

        /* Animation variables */

        // Player mesh for local scope.
        const playerMesh = playerObject_Global.mesh;

        // Time delta for smooth movement.
        const delta = gameClock.getDelta();

        /* Player Movement */

        updatePlayerPosition({delta: delta, playerMesh: playerMesh});

        /* Camera Control */

        updateCameraPerspective({playerMesh: playerMesh, delta: delta});

        /* Environment */

        // Add NPCs to level at defined spawn rate.
        // Pause NPC spawn as player approaches goal.
        if(playerMesh.position.z - 100 > GAME_LENGTH){
            if(gameTimer % spawnRate == 0){
                populateLevel({playerMesh: playerMesh});
            }
        }

        // Update NPC positions.
        updateEnvironment({delta: delta, playerPositionX: playerMesh.position.x});

        // Update game timer after each frame.
        gameTimer++;
        requestAnimationFrame(animate);
        renderer.render(scene, camera_Global);
    }

}


/*** ANIMATION CALLBACK FUNCTIONS ***/

/**
 * Callback used to update player position.
 * @param playerMesh 
 * @param delta 
 */
function updatePlayerPosition({playerMesh, delta}){

    // End level if goal reached.
    if(playerMesh.position.z < GAME_LENGTH){
        levelCleared = true;
        playerForwardSpeed = 10;
        // Use game timer to define closing camera pan.
        if(gameTimer % 60 == 0){
            closeLevel();
        }
    }

    // Move left.
    if(keyStates['KeyA']){
        // Define player boundary.
        if(playerMesh.position.x > -2.5){
            playerMesh.position.x -= playerHorizontalSpeed * delta;
        }
    }
    // Move right.
    if(keyStates['KeyD']){ 
        // Define player boundary.
        if(playerMesh.position.x < 2.5){
            playerMesh.position.x += playerHorizontalSpeed * delta;
        }
    }

    // Forward player movement.
    playerMesh.position.z -= playerForwardSpeed * delta;

    // Update bounding box.
    playerObject_Global.boundingBox.setFromObject(playerObject_Global.mesh);

    // Update light positions.
    const headlights = playerObject_Global.headlights;

    headlights[0].position.z = playerMesh.position.z - 3.5;
    headlights[0].position.x = playerMesh.position.x - 0.6;
    headlights[1].position.z = playerMesh.position.z - 3.5;
    headlights[1].position.x = playerMesh.position.x + 0.6;
}

/**
 * Callback used to update positions of
 * NPCs
 * @param delta
 * @param playerPositionX
 */
function updateEnvironment({delta, playerPositionX}){

    /* Enemy object */

    const enemyMesh = enemyObject_Global.mesh;
    const followSpeed = 5.0;

    // Enemy forward motion.
    if(levelCleared == false ){
        enemyMesh.position.z -= playerForwardSpeed * delta;
           
        // Enemy follows player in x direction (Horizontally).
        if(Math.round(enemyMesh.position.x) != Math.round(playerPositionX)){
            if(enemyMesh.position.x > playerPositionX ){
                enemyMesh.position.x -= followSpeed * delta;
            } else {
                enemyMesh.position.x += followSpeed * delta;
            }
        }
    }
    
    // Update enemy light positions in 'loop unroll'.
    const leftAlignment = enemyMesh.position.x - 0.5;
    const rightAlignment = enemyMesh.position.x + 0.5;

    for(let i = 0; i < 2; i ++){

        enemyObject_Global.headlights[i].position.z = enemyMesh.position.z - 3;
        enemyObject_Global.sirenLights[i].position.z = enemyMesh.position.z - 1;

        if(i % 2 == 0){
            enemyObject_Global.headlights[i].position.x = leftAlignment;
            enemyObject_Global.sirenLights[i].position.x = leftAlignment;
        } else {
            enemyObject_Global.headlights[i].position.x = rightAlignment;
            enemyObject_Global.sirenLights[i].position.x = rightAlignment;
        }

    }

    /* NPC objects */

    for(let npc of npcArray){

        // NPC movement.
        npc.mesh.position.z -= npc.speed * delta;
        // NPC collision.
        npc.boundingBox.setFromObject(npc.mesh);
        if(playerObject_Global.boundingBox.intersectsBox(npc.boundingBox)){
            crashHandler();
        }

    }

}

/**
 * Callback used to add NPC objects to scene.
 * @param playerMesh 
 */
async function populateLevel({playerMesh}){
    // Convert game timer to radians.
    const fraction = gameTimer / 60;
    const radians = (Math.sqrt(3) / 2 ) * fraction

    // Compute position of NPC.
    const positionProbability = Math.round(Math.sin(positionFrequency * radians));

    // Instantiate NPC, add NPC to scene.
    let npc = await generateNPC(positionProbability, playerMesh.position.z);
    scene.add(npc.mesh);

    npcArray.push(npc);
}

/**
 * Callback to toggle between first and third
 * person.
 * @param playerMesh 
 */
function updateCameraPerspective({playerMesh, delta}){
    // If level cleared begin ending camera pan out.
    if(levelCleared){
        camera_Global.position.z += 6 * delta;
        camera_Global.position.x = 0;
        camera_Global.position.y += 4 * delta;
    } else {
        if(firstPerson){
            // First person properties.
            camera_Global.position.z = playerMesh.position.z - 0.5;
            camera_Global.position.x = playerMesh.position.x;
            camera_Global.position.y = 0.5;
        } else {
            // Third person properties.
            camera_Global.position.y = 5.75;
            camera_Global.position.x = 0;
            camera_Global.position.z = playerMesh.position.z + 13;
        }
    }

}

/**
 * Callback used to close a level.
 */
function closeLevel(){
    gameActive = false;
    console.log('closing level');
    gameClock.stop();
    activateSuccessScreen();
}

/**
 * Callback used when detecting crash.
 */
function crashHandler(){
    console.log('collision')
    gameActive = false;
    levelFailed = true;
    gameClock.stop();
    activateFailScreen();
}