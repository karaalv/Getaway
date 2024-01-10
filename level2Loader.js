/**
 * Level 2 Environment loader.
 * 
 * This file encapsulates the creation
 * of world building assets used in 
 * level 2: City Skylines.
 */

/* Import utilities from THREE.js library */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Game variables.
const BLENDER_SCALE_FACTOR = 0.45;
const ENLARGEMENT_SCALE_FACTOR = 15;

const CLIPPING = 200;

const GAME_LENGTH = -500; // actual: -1000 test: -500
const ROAD_LENGTH = 750; // actual: 1500 test: 750
const ROAD_MIDDLE_POSITION = -250; // actual: -700 test: -250

// Variables used to coordinate environment generation.
let buildingPositionBias = true;
let cloudPositionBias = true;

/**
 * Function used to render all environment
 * features for the level.
 * @returns Array of all 3.js scene object.
 */
export async function loadLevel2(){
    // Iterable array used to load level.
    const meshArray = [];

    /* Level Features */

    // Ambient lighting.
    const ambientLight = new THREE.AmbientLight(0xC8C8D4, 2.0);
    meshArray.push(ambientLight);

    // Define road plane.
    const roadGeometry = new THREE.PlaneGeometry(16, ROAD_LENGTH);

    // Asphalt texture.
    const asphaltTexture = new THREE.TextureLoader().load('./assets/textures/AsphaltTexture.jpg');

    // Wrap texture.
    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(1, 20);

    // Road material.
    const roadMaterial = new THREE.MeshPhongMaterial({
        map: asphaltTexture, 
        side: THREE.BackSide,
    })

    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotateX(Math.PI / 2);
    roadMesh.position.set(0, -1, ROAD_MIDDLE_POSITION);
    meshArray.push(roadMesh)

    // Define sidewalk planes.
    const sideWalkGeometry = new THREE.BoxGeometry(1, ROAD_LENGTH, 1.5);

    // Concrete texture.
    const concreteTexture = new THREE.TextureLoader().load('./assets/textures/ConcreteTexture.jpg');

    // Wrap texture.
    concreteTexture.wrapS = THREE.RepeatWrapping;
    concreteTexture.wrapT = THREE.RepeatWrapping;
    concreteTexture.repeat.set(0.05, 20)

    const sidewalkMaterial = new THREE.MeshPhongMaterial({
        map: concreteTexture, 
        side: THREE.DoubleSide
    });

    const sidewalkLeft = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
    const sidewalkRight = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);

    // Left sidewalk.
    sidewalkLeft.rotateX(Math.PI / 2);
    sidewalkLeft.position.set(-8.5, -1, ROAD_MIDDLE_POSITION);
    meshArray.push(sidewalkLeft);

    // Right sidewalk.
    sidewalkRight.rotateX(Math.PI / 2);
    sidewalkRight.position.set(8.5, -1, ROAD_MIDDLE_POSITION)
    meshArray.push(sidewalkRight);

    // Objective.
    const goalGeometry = new THREE.PlaneGeometry(16, 2);
    const goalMaterial = new THREE.MeshPhongMaterial({color: 0x00FF00, side: THREE.DoubleSide, opacity: 0.5, transparent: true});
    const goalMesh = new THREE.Mesh(goalGeometry, goalMaterial);
    goalMesh.position.set(0, 0, GAME_LENGTH);
    meshArray.push(goalMesh);

    return meshArray;
}

/**
 * Environment feature.
 * @param playerPositionZ 
 * @returns Building model.
 */
export async function getBuilding({playerPositionZ}){
    return new Promise((resolve, reject) => {
        /* Load retro palm tree model */
        const loader = new GLTFLoader();
        loader.load('./assets/models/Building.glb', function (glb) {
            const mesh = glb.scene;

            // Scale model.
            mesh.scale.set(ENLARGEMENT_SCALE_FACTOR, ENLARGEMENT_SCALE_FACTOR, ENLARGEMENT_SCALE_FACTOR);

            // Place mesh at random point along game course.
            const min = 30;
            const max = 60;

            let randX = Math.floor(Math.random() * (max - min + 1)) + min;
            if(buildingPositionBias){
                randX *= -1;
                buildingPositionBias = false;
            } else {
                buildingPositionBias = true;
            }

            const posZ = playerPositionZ - CLIPPING

            const randY = Math.floor(Math.random() * (200 - 100 + 1)) + 100;
            mesh.position.set(randX, -randY, posZ);

            const buildingObject = {
                mesh: mesh,
            }

            resolve(buildingObject);
        })

    })
}

/**
 * Environment feature.
 * @param playerPositionZ
 * @returns Cloud mesh.
 */
export async function getCloud({playerPositionZ}){

    const sizeX = Math.floor(Math.random() * (30 - 5 + 1)) + 5;
    const sizeY = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
    const sizeZ = 10;

    const cloudGeometry = new THREE.BoxGeometry(sizeX * 2, sizeY, sizeZ);

    const cloudMaterial = new THREE.MeshPhongMaterial({
        color: 0xC7C4BF,
        side: THREE.DoubleSide,
        opacity: 0.5,
        transparent: true
    })

    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

    // Place at random position.
    const positionMin = 10;
    const positionMax = 50;

    let randX = Math.floor(Math.random() * (positionMax - positionMin + 1)) + positionMin;
    if(cloudPositionBias){
        randX *= -1;
        cloudPositionBias = false;
    } else {
        cloudPositionBias = true;
    }

    const posZ = playerPositionZ - CLIPPING

    cloudMesh.position.set(randX, -2, posZ);

    return cloudMesh;
}