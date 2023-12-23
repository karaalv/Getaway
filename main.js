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
let menuActive = true;
let gameActive = !menuActive;


// Toggle menu function to control game
// state.
function toggleMenu(){
    menuActive = !menuActive;
    gameActive = !menuActive;
    console.log(`game state ${gameActive}`);
    gameMenu.style.opacity = menuActive? 'none' : 'block';
    initialiseLevel1();
}

// Toggle game menu listener.
gameMenuButton.addEventListener('click', toggleMenu);

/*** THREE.js GLOBAL VARIABLES ***/

// Game canvas.
const canvas = document.getElementById("canvas");

// Game renderer.
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});

// Global scene
let scene_Global;

// Global camera
let camera_Global;


// Camera properties.
const fov = 75;
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100;



/*** LEVEL INITIALISATION ***/

function initialiseLevel1(){
    // Define scene.
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Define camera and camera position.
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    camera.position.set(0, 2, 4);

    // Define renderer.
    renderer.setSize( window.innerWidth, window.innerHeight );

    // Define cube object.
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial( {color: 0xffffff } );
    let object = new THREE.Mesh(geometry, material);
    scene.add(object);

    // Define Floor.
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshBasicMaterial({color: 0xF88379, side: THREE.DoubleSide});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(Math.PI / 2);
    scene.add(floor);

    scene_Global = scene;
    camera_Global = camera;

    animate();
}


/*** ANIMATION LOOP ***/
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene_Global, camera_Global)
}








