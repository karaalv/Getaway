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

/*** GAME CONTROLLER ***/

/**
 * Game state is measured alongside 
 * menu sate, when menu is active 
 * game is paused.
 */

// Menu controller variables.
const gameMenu = document.getElementById('Game-menu');
const gameMenuButton = document.getElementById('Menu-button');
const keyStates =[];
// let menuActive = true;
// let gameActive = !menuActive;

let menuActive = false;
let gameActive = true;

/*** CALLBACK FUNCTIONS ***/

/**
 * Callback functions used to display game menu
 * and control game state.
 */
function activateMenu(){
    menuActive = true;
    gameActive = false;
    gameMenu.style.display = 'block';
}
//
function deactivateMenu(){
    menuActive = false;
    gameActive = true;

    gameMenu.style.display = 'none';
    initialiseLevel1();
}


/*** WINDOW LISTENERS AND CALLBACKS ***/ 

// Toggle game menu listener.
gameMenuButton.addEventListener('click', () => {
    if(gameActive){
        activateMenu();
    } else {
        deactivateMenu();
    }
});

// Keyboard input listener.
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

// Press key.
function keyDown(event){
    keyStates[event.code] = true;

    // Pause game.
    if(event.code == 'KeyP'){
        gameActive = !gameActive;
        if(gameActive){
            animate();
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

/*** THREE.js GLOBAL VARIABLES ***/

// Game canvas.
const canvas = document.getElementById("canvas");

// Game renderer.
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

// Game clock.
const gameClock = new THREE.Clock();

// Global scene.
let scene_Global;

// Global camera.
let camera_Global;

// Camera properties.
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 200;

/*** GAME PROPERTIES ***/

// Time.
let gameTimer = 0; 

// Length.
const GAME_LENGTH = -500;

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

/*** GAME AVATARS ***/

let playerObject_Global;
let enemyObject_Global;
/*** LEVEL INITIALISATION ***/

async function initialiseLevel1(){

    /* THREE JS Properties */

    // Define scene.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000021);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 5.75, 13);

    // Define renderer.
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene_Global = scene;
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

    // Call animation loop.
    animate();
}

function level2(){
    // Define sidewalk planes.
    const sideWalkGeometry = new THREE.BoxGeometry(1, 750, 1.5);

    // Concrete texture.
    const concreteTexture = new THREE.TextureLoader().load('./assets/ConcreteTexture.jpg');

    // Wrap texture.
    concreteTexture.wrapS = THREE.RepeatWrapping;
    concreteTexture.wrapT = THREE.RepeatWrapping;
    concreteTexture.repeat.set(0.05, 20)

    const sidewalkMaterial = new THREE.MeshPhongMaterial({map: concreteTexture, side: THREE.DoubleSide});
    const sidewalkLeft = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
    const sidewalkRight = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
}

initialiseLevel1();


/*** ANIMATION LOOP ***/
function animate(){

    // If game state is off, pause game.
    if(!gameActive){
        console.log('game paused')
        return;
    }

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
    renderer.render(scene_Global, camera_Global);
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
            console.log('collision');
            // gameActive = false;
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
    scene_Global.add(npc.mesh);

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
        setInterval(closeLevel, 7000);
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
    activateMenu();
}