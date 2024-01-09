/**
 * Level 1 Environment loader.
 * 
 * This file encapsulates the creation
 * of world building assets used in 
 * level 1: Retro World.
 */

/* Import utilities from THREE.js library */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Game variables.
const BLENDER_SCALE_FACTOR = 0.45;
const ENLARGEMENT_SCALE_FACTOR = 4;

const GAME_LENGTH = -500; // actual: -1000 test: -500
const ROAD_LENGTH = 750; // actual: 1500 test: 750
const ROAD_MIDDLE_POSITION = -250; // actual: -700 test: -250

// Variables used to coordinate environment generation.
let sharedZ = -15;
let positionBias = true;

/**
 * Function used to render all environment
 * features for the level.
 * @returns Array of all 3.js scene object.
 */
export async function loadLevel1(){
    // Iterable array used to load level.
    const meshArray = [];

    /* Level Features */

    // Ambient lighting.
    const ambientLight = new THREE.AmbientLight(0xE1E1FF, 2.0);
    meshArray.push(ambientLight);

    // Define road plane.
    const roadGeometry = new THREE.PlaneGeometry(8, ROAD_LENGTH);

    // Road material.
    const roadMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x24123E, 
        side: THREE.BackSide,
    })

    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotateX(Math.PI / 2);
    roadMesh.position.set(0, -1, ROAD_MIDDLE_POSITION);
    meshArray.push(roadMesh)

    // Define sidewalk planes.
    const sideWalkGeometry = new THREE.BoxGeometry(1, ROAD_LENGTH, 1.5);

    const sidewalkMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
    });

    const sidewalkLeft = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
    const sidewalkRight = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);

    // Left sidewalk.
    sidewalkLeft.rotateX(Math.PI / 2);
    sidewalkLeft.position.set(-4.5, -1, ROAD_MIDDLE_POSITION);
    meshArray.push(sidewalkLeft);

    // Right sidewalk.
    sidewalkRight.rotateX(Math.PI / 2);
    sidewalkRight.position.set(4.5, -1, ROAD_MIDDLE_POSITION)
    meshArray.push(sidewalkRight);

    // Objective.
    const goalGeometry = new THREE.PlaneGeometry(8, 2);
    const goalMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00, side: THREE.DoubleSide, opacity: 0.5, transparent: true});
    const goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
    goalMesh.position.set(0, 0, GAME_LENGTH);
    meshArray.push(goalMesh);

    // Flat plane for world building.
    const levelPlaneGeometry = new THREE.PlaneGeometry(1500, 1500);
    const retroTexture = new THREE.TextureLoader().load('./assets/textures/retroTexture.jpg');

    const levelPlaneMaterial = new THREE.MeshPhongMaterial({map: retroTexture, side: THREE.DoubleSide});
    const levelPlane = new THREE.Mesh(levelPlaneGeometry, levelPlaneMaterial);
    levelPlane.rotateX(Math.PI / 2);
    levelPlane.position.set(0, -1.5, ROAD_MIDDLE_POSITION);
    meshArray.push(levelPlane);


    /* Load environment features */
    const environment = await getLevel1Environment();
    for(let item of environment){
        meshArray.push(item);
    }

    return meshArray;
}

/**
 * @returns Array of environment meshes.
 */
async function getLevel1Environment(){
    const number = 10;
    const environmentArray = [];
    let data;

    for(let i = 0; i < number; i++){
        data = await getRetroPalmTree();
        environmentArray.push(data.mesh)
        environmentArray.push(data.light)
    }
    
    sharedZ = 0;
    return environmentArray;
}

/**
 * @returns Loader for palm tree models.
 */
function getRetroPalmTree() {
    return new Promise((resolve, reject) => {
        /* Load retro palm tree model */
        const loader = new GLTFLoader();
        loader.load('./assets/models/RetroPalmTree.glb', function (glb) {
            const mesh = glb.scene;

            // Scale model.
            mesh.scale.set(ENLARGEMENT_SCALE_FACTOR, ENLARGEMENT_SCALE_FACTOR, ENLARGEMENT_SCALE_FACTOR);

            // Place mesh at random point along game course.
            const min = 6;
            const max = 30;

            let randX = Math.floor(Math.random() * (max - min + 1)) + min;
            if(positionBias){
                randX *= -1;
                positionBias = false;
            } else {
                positionBias = true;
            }
            sharedZ -= 100;
            const randZ = sharedZ

            mesh.position.set(randX, -1, randZ);

            // Define retro light.
            let light;
            if(Math.random() > 0.5){
                light = new THREE.SpotLight(0xFF3864, 300);
            } else {
                light = new THREE.SpotLight(0xF9C80E, 300);
            }

            light.position.set(randX, 5, randZ);
            light.angle = - Math.PI;

            const retroPalmTreeObject = {
                mesh: mesh,
                light: light,
            }

            resolve(retroPalmTreeObject)
        })

    })
}