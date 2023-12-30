/**
 * Import assets from the Three.js library under 
 * the alias 'THREE'
 */
import * as THREE from 'three';


export function generateNPC(positionProbability, playerPositionZ){
    // Define NPC object.
    const object = new THREE.BoxGeometry(2, 1, 3);
    const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    let objectMesh = new THREE.Mesh(object,  material);

    // NPC speed - Random variable.
    let speed = Math.floor(Math.random() * 5) + 20;

    // NPC position - Sine curve variation.
    let randomX;
    let randomZ;

    if(positionProbability > 0){
        randomX = 1.5
        speed *= -1;
    } else {
        randomX = -1.5
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
