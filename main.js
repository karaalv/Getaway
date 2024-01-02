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
import { generateNPC, generatePlayer } from './gameAvatars';

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

/**
 * Callback functions used to set key states 
 * controlling user input.
 */
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
//
function keyUp(event){
    keyStates[event.code] = false;
}

/*** WINDOW LISTENERS ***/ 

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

// Global player object.
let player_Global;
let playerBB;
const playerHeadLights = [];

// Global enemy object.
let enemy_Global;
let enemyBB;
const enemyHeadLights = []

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
    renderer.setSize( window.innerWidth, window.innerHeight );

    /* Player - Generate and add to scene */
    const playerObject = generatePlayer();

    // Mesh.
    scene.add(playerObject.mesh);

    // Lights.
    scene.add(playerObject.headlights[0]);
    scene.add(playerObject.headlights[1]);

    // Store in global variable.
    playerObject_Global = playerObject;

    /* Enemy */
    const enemyGeometry = new THREE.BoxGeometry(2, 1, 3);
    const enemyMaterial = new THREE.MeshPhongMaterial( {color: 0x000000 } );
    let enemyObject = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemyObject.position.set(1.5, 0, 6);

    // Define bounding box.
    enemyBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    enemyBB.setFromObject(enemyObject);

    // Define headlights.
    const enemyLeftHeadlight = new THREE.SpotLight(0xFFFFA9, 4);
    const enemyRightHeadlight = new THREE.SpotLight(0xFFFFA9, 4);

    enemyLeftHeadlight.position.set(enemyObject.position.x - 0.5, 0.5, enemyObject.position.z - 3);
    enemyLeftHeadlight.angle = - Math.PI; 
    enemyRightHeadlight.position.set(enemyObject.position.x + 0.5, 0.5, enemyObject.position.z - 3);
    enemyRightHeadlight.angle = - Math.PI; 

    enemyHeadLights[0] = enemyLeftHeadlight;
    enemyHeadLights[1] = enemyRightHeadlight;

    // Define sirens.
    const capsuleGeometry = new THREE.CapsuleGeometry(0.1, 0.1, 10, 10);
    capsuleGeometry.rotateZ(Math.PI/2)
    const red = new THREE.MeshPhongMaterial({color: 0xFF0000});
    const blue = new THREE.MeshPhongMaterial({color: 0x0000FF});


    const redSiren = new THREE.SpotLight(0xFF0000, 70);
    const redSirenObject = new THREE.Mesh(capsuleGeometry, red);

    const blueSiren = new THREE.SpotLight(0x0000FF, 70);
    const blueSirenObject = new THREE.Mesh(capsuleGeometry, blue);

    redSirenObject.position.set(enemyObject.position.x - 0.5, 1, enemyObject.position.z);
    redSiren.position.set(enemyObject.position.x - 0.5, 1.5, enemyObject.position.z);
    redSiren.angle = - Math.PI; 

    blueSirenObject.position.set(enemyObject.position.x + 0.5, 1, enemyObject.position.z);
    blueSiren.position.set(enemyObject.position.x + 0.5, 1.5, enemyObject.position.z);
    blueSiren.angle = - Math.PI; 

    enemyHeadLights[2] = redSiren;
    enemyHeadLights[3] = blueSiren;
    
    enemyHeadLights[4] = redSirenObject;
    enemyHeadLights[5] = blueSirenObject

    scene.add(enemyLeftHeadlight);
    scene.add(enemyRightHeadlight);
    scene.add(redSiren);
    scene.add(blueSiren);
    scene.add(redSirenObject);
    scene.add(blueSirenObject);

    
    enemy_Global = enemyObject;
    scene.add(enemyObject);

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

    /* Animation variables */

    // Player mesh for local scope.
    const playerMesh = playerObject_Global.mesh;

    // Time delta for smooth movement.
    const delta = gameClock.getDelta();

    /* Game Control */

    // If game state is off, pause game.
    if(!gameActive){
        console.log('game paused')
        return;
    }

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
    updateEnvironment(delta, playerMesh.position.x, playerMesh.position.z);



    /* Collisions */

    // Update bonding box positions.
    enemyBB.copy(enemy_Global.geometry.boundingBox).applyMatrix4(enemy_Global.matrixWorld);


    // Update game timer after each frame.
    gameTimer++;

    requestAnimationFrame(animate);
    renderer.render(scene_Global, camera_Global);
}


/*** ANIMATION CALLBACK FUNCTIONS ***/

/**
 * Move NPC objects.
 * @param delta 
 * @param playerPositionX 
 */
function updateEnvironment(delta, playerPositionX, playerPositionZ){

    /* Enemy object */

    // Enemy forward motion.
    enemy_Global.position.z -= (gameVelocity) * delta;
    
    // Enemy follows player in x direction (Horizontally).
    const followSpeed = 4;
    if(Math.round(enemy_Global.position.x) != Math.round(playerPositionX)){
        if(enemy_Global.position.x > playerPositionX ){
            enemy_Global.position.x -= followSpeed * delta;
        } else {
            enemy_Global.position.x += followSpeed * delta;
        }
    }

    enemyHeadLights[0].position.z = enemy_Global.position.z - 3;
    enemyHeadLights[0].position.x = enemy_Global.position.x - 0.5;

    enemyHeadLights[1].position.z = enemy_Global.position.z - 3;
    enemyHeadLights[1].position.x = enemy_Global.position.x + 0.5;

    enemyHeadLights[2].position.z = enemy_Global.position.z - 1;
    enemyHeadLights[2].position.x = enemy_Global.position.x - 0.5;

    enemyHeadLights[3].position.z = enemy_Global.position.z - 1;
    enemyHeadLights[3].position.x = enemy_Global.position.x + 0.5;


    enemyHeadLights[4].position.z = enemy_Global.position.z;
    enemyHeadLights[4].position.x = enemy_Global.position.x - 0.5;

    enemyHeadLights[5].position.z = enemy_Global.position.z;
    enemyHeadLights[5].position.x = enemy_Global.position.x + 0.5;

    /* NPC objects*/
    for(let npc of npcArray){

        // NPC movement.
        npc.object.position.z -= npc.speed * delta;

        // NPC collision.
        npc.boundingBox.copy(npc.object.geometry.boundingBox).applyMatrix4(npc.object.matrixWorld);
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
    scene_Global.add(npc.object);
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
