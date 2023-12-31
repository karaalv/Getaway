/**
 * Import assets from the Three.js library under 
 * the alias 'THREE'
 */
import * as THREE from 'three';

// NPC properties.
const npcObject = new THREE.BoxGeometry(2, 1, 3);
const npcMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000} );

/**
 * Function used to generate NPC objects.
 * @param positionProbability 
 * @param playerPositionZ 
 * @returns NPC Mesh
 */
export function generateNPC(positionProbability, playerPositionZ){
    // Define NPC object.

    let objectMesh = new THREE.Mesh(npcObject,  npcMaterial);

    // NPC speed - Random variable.
    let speed = Math.floor(Math.random() * 5) + 20;

    // NPC position - Sine curve variation.
    let randomX;
    let randomZ;

    if(positionProbability > 0){
        randomX = -1.5
    } else {
        randomX = 1.5
        speed *= -1;
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

    objectMesh.position.set(randomX, 0, randomZ)

    return (
        {
            object: objectMesh,
            speed: speed,
        }
    )

}
