/**
 * This script loads the screen to be displayed 
 * whilst selecting a level.
 */

/* Import utilities from THREE.js library */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SCALE_FACTOR = 2.5;

const policePositions = [
    {
        x: -2,
        y: -5,
        z: -50
    },
    {
        x: 20,
        y: -5,
        z: -70
    },
    {
        x: 20,
        y: -5,
        z: -30
    }
]

// Callback used to generate display.
export async function generateDisplay(){

    const displayMeshes = [];
    // Light.
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5.0);
    displayMeshes.push(ambientLight);

    // Player.
    const playerDisplay = await generatePlayerDisplay();
    displayMeshes.push(playerDisplay);

    // Police.
    for(let item of policePositions){
        const policeDisplay = await generateEnemyDisplay({x: item.x, y: item.y, z: item.z});
        displayMeshes.push(policeDisplay);
    }

    return displayMeshes;
}

// Display player model.
function generatePlayerDisplay(){

    return new Promise((resolve, reject) => {
        /* Load Player car model */
        const loader = new GLTFLoader();

        loader.load('./assets/models/PlayerCar.glb', function(glb) {
            const playerMesh = glb.scene;

            // Scale model.
            playerMesh.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        
    
            /* Initial Position */
            playerMesh.position.set(0, -5, -30);
            playerMesh.rotateY(Math.PI)
            playerMesh.rotateY(-Math.PI / 6)

    
            resolve(playerMesh);
        })
    })
}

// Display police car model.
function generateEnemyDisplay({x, y, z}){
    return new Promise((resolve, reject) => {
        /* Load Player car model */
        const loader = new GLTFLoader();

        loader.load('./assets/models/PoliceCar.glb', function(glb) {
            const playerMesh = glb.scene;

            // Scale model.
            playerMesh.scale.set(SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        
    
            /* Initial Position */
            playerMesh.position.set(x, y, z);
            playerMesh.rotateY(Math.PI)
            playerMesh.rotateY(-Math.PI / 6)

            resolve(playerMesh);
        })
    })
}
