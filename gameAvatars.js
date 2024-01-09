/**
 * GAME AVATARS
 * 
 * This file encapsulates all logic 
 * relating to drawing game avatars.
 * 
 * Objects describing the properties 
 * of each avatar are returned to the 
 * main game script for manipulation.
 */

/* Import utilities from THREE.js library */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* Global Properties */
const BLENDER_SCALE_FACTOR = 0.45;
const HEAD_LIGHT_COLOUR = 0xFFFFA9;

/**
 * Instantiation of player avatar.
 * function returns player object 
 * for manipulation during game 
 * runtime.
 * @returns Player Object
 */
export function generatePlayer(){

    return new Promise((resolve, reject) => {
        /* Load Player car model */
        const loader = new GLTFLoader();

        loader.load('./assets/models/PlayerCar.glb', function(glb) {
            const playerMesh = glb.scene;

            // Scale model.
            playerMesh.scale.set(0.55, 0.55, 0.55);

            // Bounding box.
            const boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    
            // Head lights.
            const leftHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 10);
            const rightHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 10);
    
            const headlights = [];
    
            /* Initial Position */
            playerMesh.position.set(1.5, -1, 0);
    
            // Bounding box.
            boundingBox.setFromObject(playerMesh);
    
            // Lights.
            leftHeadlight.position.set(playerMesh.position.x - 0.6, -0.25, playerMesh.position.z - 3.5);
            leftHeadlight.angle = - Math.PI; 
            rightHeadlight.position.set(playerMesh.position.x + 0.6, -0.25, playerMesh.position.z - 3.5);
            rightHeadlight.angle = - Math.PI; 
    
            headlights[0] = leftHeadlight;
            headlights[1] = rightHeadlight;
    
            const sceneObjects = [
                playerMesh, 
                leftHeadlight, 
                rightHeadlight,
            ]
    
            // Define player object for game controller.
            const playerObject = {
                mesh: playerMesh,
                boundingBox: boundingBox,
                headlights: headlights,
                sceneObjects: sceneObjects
            }
            resolve(playerObject);
        })
    })
}

/**
 * Instantiation of enemy avatar.
 * function returns enemy object 
 * for manipulation during game 
 * runtime.
 * @returns Enemy Object
 */
export function generateEnemy(){

    return new Promise((resolve, reject) => {
        /* Load Police car model */
        const loader = new GLTFLoader();

        loader.load('./assets/models/PoliceCar.glb', function(glb) {
            const enemyMesh = glb.scene;

            // Scale model.
            enemyMesh.scale.set(BLENDER_SCALE_FACTOR, BLENDER_SCALE_FACTOR, BLENDER_SCALE_FACTOR);

            // Head lights.
            const leftHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 4);
            const rightHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 4);

            // Police lights.
            const redSirenLight = new THREE.SpotLight(0xFF0000, 100);
            const blueSirenLight = new THREE.SpotLight(0x0000FF, 100);

            const headlights = [];
            const sirenLights = [];

            /* Initial Position */

            enemyMesh.position.set(1.5, -1, 6.5);

            // Lights.
            leftHeadlight.position.set(enemyMesh.position.x - 0.5, 0.5, enemyMesh.position.z - 3);
            leftHeadlight.angle = - Math.PI; 

            rightHeadlight.position.set(enemyMesh.position.x + 0.5, 0.5, enemyMesh.position.z - 3);
            rightHeadlight.angle = - Math.PI; 


            // Define sirens.

            redSirenLight.position.set(enemyMesh.position.x - 0.5, 1.5, enemyMesh.position.z);
            redSirenLight.angle = - Math.PI; 

            blueSirenLight.position.set(enemyMesh.position.x + 0.5, 1.5, enemyMesh.position.z);
            blueSirenLight.angle = - Math.PI; 

            headlights[0] = leftHeadlight;
            headlights[1] = rightHeadlight;

            sirenLights[0] = redSirenLight;
            sirenLights[1] = blueSirenLight;

            const sceneObjects = [
                enemyMesh, 
                leftHeadlight, 
                rightHeadlight, 
                redSirenLight, 
                blueSirenLight, 
            ];
            
            // Define player object for game controller.
            const enemyObject = {
                mesh: enemyMesh,
                headlights: headlights,
                sirenLights: sirenLights,
                sceneObjects: sceneObjects, 
            }
            resolve(enemyObject);
    })

    })
}

/**
 * Function used to generate NPC avatar.
 * @param positionProbability 
 * @param playerPositionZ 
 * @returns NPC Mesh
 */
export function generateNPC(positionProbability, playerPositionZ) {
    // Handle asynchronous loading.
    return new Promise((resolve, reject) => {

        /* Load NPC model */
        const loader = new GLTFLoader();
        loader.load('./assets/models/NPCcar.glb', function (glb) {
           const npcMesh = glb.scene;

           // Scale model.
           npcMesh.scale.set(BLENDER_SCALE_FACTOR, BLENDER_SCALE_FACTOR, BLENDER_SCALE_FACTOR);

            // Bounding box.
            const boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

            // NPC speed - Random variable.
            let speed = Math.floor(Math.random() * 5) + 25;

            // NPC position - Sine curve variation.
            let randomX;
            let randomZ;

            if (positionProbability > 0) {
                randomX = -1.5;
            } else {
                randomX = 1.5;
                speed *= -1;
                npcMesh.rotateY(Math.PI)
            }

            /**
             * Spawn points depend on direction on road.
             * the NPC spawns, both positions should be
             * at the respective clipping zones.
             */
            if (randomX > 0) {
                randomZ = playerPositionZ - 150;
            } else {
                randomZ = playerPositionZ + 50;
            }

            // Set NPC position.
            npcMesh.position.set(randomX, -1, randomZ);
            boundingBox.setFromObject(npcMesh);

            const npcObject = {
                mesh: npcMesh,
                speed: speed,
                boundingBox: boundingBox,
            };

            resolve(npcObject);
        });
    });
}

