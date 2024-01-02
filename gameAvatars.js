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

/**
 * Import assets from the Three.js library under 
 * the alias 'THREE'
 */
import * as THREE from 'three';

/* Global Properties */
const carGeometry = new THREE.BoxGeometry(2, 1, 3);

const HEAD_LIGHT_COLOUR = 0xFFFFA9;


/* NPC Properties */
const npcMaterial = new THREE.MeshPhongMaterial( {color: 0xff0000} );


/**
 * Instantiation of player avatar.
 * function returns player object 
 * for manipulation during game 
 * runtime.
 * @returns Player Object
 */
export function generatePlayer(){

    /* Player Properties */

    const playerMaterial = new THREE.MeshPhongMaterial( {color: 0xFFFFFF } );
    const playerMesh = new THREE.Mesh(carGeometry, playerMaterial);

    // Bounding box.
    const boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    // Head lights.
    const leftHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 6);
    const rightHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 6);

    const headlights = [];

    /* Initial Position */

    playerMesh.position.set(1.5, 0, 0);

    // Bounding box.
    boundingBox.setFromObject(playerMesh);

    // Lights.
    leftHeadlight.position.set(playerMesh.position.x - 0.5, 0.5, playerMesh.position.z - 3);
    leftHeadlight.angle = - Math.PI; 
    rightHeadlight.position.set(playerMesh.position.x + 0.5, 0.5, playerMesh.position.z - 3);
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
    return playerObject;
}

/**
 * Instantiation of enemy avatar.
 * function returns enemy object 
 * for manipulation during game 
 * runtime.
 * @returns Enemy Object
 */
export function generateEnemy(){

    /* Enemy Properties */

    const enemyMaterial = new THREE.MeshPhongMaterial( {color: 0x000000 } );
    const enemyMesh = new THREE.Mesh(carGeometry, enemyMaterial);

    // Bounding box.
    const boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    // Head lights.
    const leftHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 4);
    const rightHeadlight = new THREE.SpotLight(HEAD_LIGHT_COLOUR, 4);

    // Police lights.
    const redSirenLight = new THREE.SpotLight(0xFF0000, 90);
    const blueSirenLight = new THREE.SpotLight(0x0000FF, 90);

    const capsuleGeometry = new THREE.CapsuleGeometry(0.1, 0.1, 10, 10);
    capsuleGeometry.rotateZ(Math.PI/2);

    const redSirenObject = new THREE.Mesh(capsuleGeometry, new THREE.MeshPhongMaterial({color: 0xFF0000}));
    const blueSirenObject = new THREE.Mesh(capsuleGeometry, new THREE.MeshPhongMaterial({color: 0x0000FF}));

    const headlights = [];
    const sirenLights = [];
    const sirenObjects = [];

    /* Initial Position */

    enemyMesh.position.set(1.5, 0, 6);

    // Bounding box.
    boundingBox.setFromObject(enemyMesh);

    // Lights.
    leftHeadlight.position.set(enemyMesh.position.x - 0.5, 0.5, enemyMesh.position.z - 3);
    leftHeadlight.angle = - Math.PI; 

    rightHeadlight.position.set(enemyMesh.position.x + 0.5, 0.5, enemyMesh.position.z - 3);
    rightHeadlight.angle = - Math.PI; 


    // Define sirens.

    redSirenObject.position.set(enemyMesh.position.x - 0.5, 1, enemyMesh.position.z);
    blueSirenObject.position.set(enemyMesh.position.x + 0.5, 1, enemyMesh.position.z);

    sirenObjects[0] = redSirenObject;
    sirenObjects[1] = blueSirenObject;

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
        redSirenObject, 
        blueSirenObject,
    ];
    
    // Define player object for game controller.
    const enemyObject = {
        mesh: enemyMesh,
        boundingBox: boundingBox,
        headlights: headlights,
        sirenLights: sirenLights,
        sirenObjects: sirenObjects,
        sceneObjects: sceneObjects, 
    }
    return enemyObject;
}

/**
 * Function used to generate NPC avatar.
 * @param positionProbability 
 * @param playerPositionZ 
 * @returns NPC Mesh
 */
export function generateNPC(positionProbability, playerPositionZ){
    
    /* NPC Properties */
    const npcMesh = new THREE.Mesh(carGeometry,  npcMaterial);

    // Bounding box.
    const boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

    // NPC speed - Random variable.
    let speed = Math.floor(Math.random() * 5) + 20;

    // NPC position - Sine curve variation.
    let randomX;
    let randomZ;

    if(positionProbability > 0){
        randomX = -1.5
    } else {
        randomX = 1.5
        speed *= -1.8;
    }

    /**
     * Spawn points depend on direction on road.
     * the NPC spawns, both positions should be 
     * at the respective clipping zones.
     */
    if(randomX > 0){
        randomZ = playerPositionZ - 150;
    } else {
        randomZ = playerPositionZ + 50;
    }

    // Set NPC position.
    npcMesh.position.set(randomX, 0, randomZ);
    boundingBox.setFromObject(npcMesh);

    const npcObject = {
        mesh: npcMesh, 
        speed: speed,
        boundingBox: boundingBox,
    }

    return npcObject;

}

