/**
 * MAIN GAME SCRIPT
 * 
 * This file acts as the controller
 * for all game aspects.
 */


/**
 * Import assets from the Three.js library under 
 * the alias 'THREE'
 */
import * as THREE from 'three';

/**
 * Import external game functions.
 */
import { generateEnemy, generateNPC, generatePlayer } from './gameAvatars';

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
    console.log(event.code)
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

// Speed.
const playerSpeed = 15.0;
const gameVelocity = 7.0;

// NPC behaviour.
const spawnRate = 120;
const positionFrequency = 0.75;
const npcArray = [];

// Perspective.
let firstPerson = false;

/*** GAME AVATARS ***/

let playerObject_Global;
let enemyObject_Global;

/*** LEVEL INITIALISATION ***/

function initialiseLevel1(){

    // Define scene.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000021);

    // Lighting.
    const ambientLight = new THREE.AmbientLight(0xE1E1FF, 1.5);
    scene.add(ambientLight);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 5, 12);

    // Define renderer.
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* Player - Generate and add to scene */
    const playerObject = generatePlayer();

    for (let item of playerObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable.
    playerObject_Global = playerObject;

    /* Enemy - Generate and add to scene. */
    const enemyObject = generateEnemy();

    for (let item of enemyObject.sceneObjects){
        scene.add(item);
    }

    // Store in global variable
    enemyObject_Global = enemyObject;


    // Define road plane.
    const floorGeometry = new THREE.PlaneGeometry(8, 1000);
    const floorMaterial = new THREE.MeshPhongMaterial({color: 0xF88379, side: THREE.DoubleSide});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(Math.PI / 2);
    floor.position.set(0, -1, 0);
    scene.add(floor);

    // Define sidewalk planes.
    const sideWalkGeometry = new THREE.BoxGeometry(1, 1000, 1.5);
    const sidewalkMaterial = new THREE.MeshPhongMaterial({color: 0xA0A0A0, side: THREE.DoubleSide});
    const sidewalkLeft = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
    const sidewalkRight = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);


    // Left sidewalk.
    sidewalkLeft.rotateX(Math.PI / 2);
    sidewalkLeft.position.set(-4.5, -1, 0)
    scene.add(sidewalkLeft);

    // Right sidewalk.
    sidewalkRight.rotateX(Math.PI / 2);
    sidewalkRight.position.set(4.5, -1, 0)
    scene.add(sidewalkRight);


    scene_Global = scene;
    camera_Global = camera;

    animate();
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

    updatePersonPerspective({playerMesh: playerMesh});

    /* Environment */

    // Add NPCs to level at defined spawn rate.
    if(gameTimer % spawnRate == 0){
        populateLevel({playerMesh: playerMesh});
    }

    // Update NPC positions.
    updateEnvironment({delta: delta, playerPositionX: playerMesh.position.x});

    // Update game timer after each frame.
    gameTimer++;

    requestAnimationFrame(animate);
    renderer.render(scene_Global, camera_Global);
}


/*** ANIMATION CALLBACK FUNCTIONS ***/


function updateEnvironment({delta, playerPositionX}){

    /* Enemy object */

    const enemyMesh = enemyObject_Global.mesh;

    // Enemy forward motion.
    enemyMesh.position.z -= gameVelocity * delta;
    
    // Enemy follows player in x direction (Horizontally).
    const followSpeed = 4;
    if(Math.round(enemyMesh.position.x) != Math.round(playerPositionX)){
        if(enemyMesh.position.x > playerPositionX ){
            enemyMesh.position.x -= followSpeed * delta;
        } else {
            enemyMesh.position.x += followSpeed * delta;
        }
    }

    // Update enemy light positions in 'loop unroll'.
    const leftAlignment = enemyMesh.position.x - 0.5;
    const rightAlignment = enemyMesh.position.x + 0.5;

    for(let i = 0; i < 2; i ++){

        enemyObject_Global.headlights[i].position.z = enemyMesh.position.z - 3;
        enemyObject_Global.sirenLights[i].position.z = enemyMesh.position.z - 1;
        enemyObject_Global.sirenObjects[i].position.z = enemyMesh.position.z;

        if(i % 2 == 0){
            enemyObject_Global.headlights[i].position.x = leftAlignment;
            enemyObject_Global.sirenLights[i].position.x = leftAlignment;
            enemyObject_Global.sirenObjects[i].position.x = leftAlignment;
        } else {
            enemyObject_Global.headlights[i].position.x = rightAlignment;
            enemyObject_Global.sirenLights[i].position.x = rightAlignment;
            enemyObject_Global.sirenObjects[i].position.x = rightAlignment;
        }

    }

    // Update bounding box.
    enemyObject_Global.boundingBox.copy(enemyMesh.geometry.boundingBox).applyMatrix4(enemyMesh.matrixWorld);

    /* NPC objects */

    for(let npc of npcArray){

        // NPC movement.
        npc.mesh.position.z -= npc.speed * delta;

        // NPC collision.
        npc.boundingBox.copy(npc.mesh.geometry.boundingBox).applyMatrix4(npc.mesh.matrixWorld);
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
function populateLevel({playerMesh}){

    // Compute position of NPC.
    const positionProbability = Math.round(Math.sin(positionFrequency * gameTimer));

    // Instantiate NPC, add NPC to scene.
    let npc = generateNPC(positionProbability, playerMesh.position.z);
    scene_Global.add(npc.mesh);

    npcArray.push(npc);
}

/**
 * Callback used to update player position.
 * @param playerMesh 
 * @param delta 
 */
function updatePlayerPosition({playerMesh, delta}){

    // Move left.
    if(keyStates['KeyA']){
        // Define player boundary.
        if(playerMesh.position.x > -2.5){
            playerMesh.position.x -= playerSpeed * delta;
        }
    }
    // Move right.
    if(keyStates['KeyD']){ 
        // Define player boundary.
        if(playerMesh.position.x < 2.5){
            playerMesh.position.x += playerSpeed * delta;
        }
    }

    // Forward player movement.
    playerMesh.position.z -= gameVelocity * delta;

    // Update bounding box.
    playerObject_Global.boundingBox.copy(playerMesh.geometry.boundingBox).applyMatrix4(playerMesh.matrixWorld);

    // Update light positions.
    const headlights = playerObject_Global.headlights;

    headlights[0].position.z = playerMesh.position.z - 3;
    headlights[0].position.x = playerMesh.position.x - 0.5;
    headlights[1].position.z = playerMesh.position.z - 3;
    headlights[1].position.x = playerMesh.position.x + 0.5;
}

/**
 * Callback to toggle between first and third
 * person.
 * @param playerMesh 
 */
function updatePersonPerspective({playerMesh}){
    if(firstPerson){
        // First person properties.
        camera_Global.position.z = playerMesh.position.z;
        camera_Global.position.x = playerMesh.position.x;
        camera_Global.position.y = 0.5;
    } else {
        // Third person properties.
        camera_Global.position.y = 5;
        camera_Global.position.x = 0;
        camera_Global.position.z = playerMesh.position.z + 12;
    }
}
