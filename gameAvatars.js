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


/* Enemy Properties */
const enemyMaterial = new THREE.MeshPhongMaterial( {color: 0x000000 } );

// Head lights.
const enemyLeftHeadlight = new THREE.SpotLight(0xFFFFA9, 4);
const enemyRightHeadlight = new THREE.SpotLight(0xFFFFA9, 4);

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
    const leftHeadlight = new THREE.SpotLight(0xFFFFA9, 6);
    const rightHeadlight = new THREE.SpotLight(0xFFFFA9, 6);

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

    // Define player object for game controller.
    const playerObject = {
        mesh: playerMesh,
        boundingBox: boundingBox,
        headlights: headlights
    }
    return playerObject;
}

export function generateEnemy(){

    const enemyMesh = new THREE.Mesh(carGeometry, enemyMaterial)
}

/**
 * Function used to generate NPC avatar.
 * @param positionProbability 
 * @param playerPositionZ 
 * @returns NPC Mesh
 */
export function generateNPC(positionProbability, playerPositionZ){
    
    // Define NPC object.
    let objectMesh = new THREE.Mesh(carGeometry,  npcMaterial);

    // Define bounding box.
    let boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

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
    objectMesh.position.set(randomX, 0, randomZ);
    boundingBox.setFromObject(objectMesh);

    return (
        {
            object: objectMesh,
            speed: speed,
            boundingBox: boundingBox
        }
    )

}

