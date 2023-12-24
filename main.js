/**
 * Import assets from the Three.js library under 
 * the alias 'THREE'
 */
import * as THREE from 'three';

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
    if (keyStates['KeyP']){
        gameActive = false;
    }
}
//
function keyUp(event){
    keyStates[event.code] = false;
}

/*** WINDOW LISTENERS ***/ 

// // Toggle game menu listener.
// gameMenuButton.addEventListener('click', () => {
//     if(gameActive){
//         activateMenu();
//     } else {
//         deactivateMenu();
//     }
// });

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

// Global enemy object.
let enemy_Global;

// Camera properties.
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;

/*** GAME PROPERTIES ***/
const playerSpeed = 5.0;
const gameVelocity = 5.0;
const cameraVelocity = gameVelocity

/*** LEVEL INITIALISATION ***/

function initialiseLevel1(){

    // Define scene.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 5, 12);

    // Define renderer.
    renderer.setSize( window.innerWidth, window.innerHeight );

    // Define player object.
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff } );
    let playerObject = new THREE.Mesh(playerGeometry, playerMaterial);

    player_Global = playerObject;
    scene.add(playerObject);

    // Define enemy object.
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshBasicMaterial( {color: 0x000000 } );
    let enemyObject = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemyObject.position.set(0, 0, 4)
    
    enemy_Global = enemyObject;
    scene.add(enemyObject);

    // Define floor plane.
    const floorGeometry = new THREE.PlaneGeometry(10, 1000);
    const floorMaterial = new THREE.MeshBasicMaterial({color: 0xF88379, side: THREE.DoubleSide});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(Math.PI / 2);
    floor.position.set(0, -1, 0)
    scene.add(floor);

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
    console.log('game active')

    /* Player */
    /**
     * User input handles.
     * Time delta used for smother movement.
     * Camera is kept in defined position.
     */
    const delta = gameClock.getDelta();
    // Move right.
    if (keyStates['KeyA']){
        player_Global.position.x -= playerSpeed * delta;
    }
    // Move left.
    if (keyStates['KeyD']){ 
        player_Global.position.x += playerSpeed * delta;
    }

    // Constant forward motion.
    player_Global.position.z -= gameVelocity * delta;
    camera_Global.position.z -= cameraVelocity * delta;

    /* Environment */
    environment(delta, player_Global.position.x)


    requestAnimationFrame(animate);
    renderer.render(scene_Global, camera_Global)
}

// Environment update callback functions

function environment(delta, playerPositionX){
    // Enemy forward motion.
    enemy_Global.position.z -= (gameVelocity) * delta;
    
    if(enemy_Global.position.x != playerPositionX ){
        if(enemy_Global.position.x > playerPositionX ){
            enemy_Global.position.x -= 3 * delta;
        } else {
            enemy_Global.position.x += 3 * delta;
        }
    }
}






