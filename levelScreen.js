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
];

const buildingPositions = [
    {
        x: -60,
        y: -15,
        z: -150,
        scale: 10
    },
    {
        x: -50,
        y: -15,
        z: -250,
        scale: 10
    },
    {
        x: -120,
        y: -15,
        z: -100,
        scale: 10
    },
    {
        x: -80,
        y: -15,
        z: -120,
        scale: 5
    },
];

const cloudPositions = [
    {
        x: -80,
        y: 70,
        z: -120,
    },
    {
        x: 80,
        y: 70,
        z: -120,
    },
    {
        x: 30,
        y: 65,
        z: -200,
    },
    {
        x: 30,
        y: 50,
        z: -300,
    },
    {
        x: 100,
        y: 40,
        z: -100,
    },
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

    // Buildings.
    for(let item of buildingPositions){
        const building = await generateBuildingDisplay({x: item.x, y: item.y, z: item.z, scale: item.scale});
        displayMeshes.push(building);
    }

    // Clouds.
    for(let item of cloudPositions){
        const cloud = generateCloud({x: item.x, y: item.y, z: item.z});
        displayMeshes.push(cloud);
    }

    // Road Plane. 
    const roadGeometry = new THREE.PlaneGeometry(125, 500);
    const roadMaterial = new THREE.MeshPhongMaterial({color: 0x666666, side: THREE.DoubleSide});
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.rotateX(Math.PI / 2);
    roadMesh.rotateZ(Math.PI / 5);
    roadMesh.position.set(5, -7, -50);    
    displayMeshes.push(roadMesh);

    // Sidewalk.
    const sideWalkGeometry = new THREE.BoxGeometry(5, 500, 10);
    const sideWalkGeometry2 = new THREE.BoxGeometry(5, 800, 10);

    const sidewalkMaterial = new THREE.MeshPhongMaterial({color: 0xC1B094, side: THREE.DoubleSide});
    const leftSidewalkMesh = new THREE.Mesh(sideWalkGeometry, sidewalkMaterial);
    const rightSidewalkMesh = new THREE.Mesh(sideWalkGeometry2, sidewalkMaterial);

    leftSidewalkMesh.rotateX(Math.PI / 2);
    leftSidewalkMesh.rotateZ(Math.PI / 5);
    leftSidewalkMesh.position.set(0, -7, -200);

    rightSidewalkMesh.rotateX(Math.PI / 2);
    rightSidewalkMesh.rotateZ(Math.PI / 5);
    rightSidewalkMesh.position.set(-50, -7, 125);

    displayMeshes.push(leftSidewalkMesh);
    displayMeshes.push(rightSidewalkMesh);

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

// Display building model.
function generateBuildingDisplay({x, y, z, scale}){
    return new Promise((resolve, reject) => {
        /* Load Player car model */
        const loader = new GLTFLoader();

        loader.load('./assets/models/Building.glb', function(glb) {
            const mesh = glb.scene;

            // Scale model.
            mesh.scale.set(scale, scale, scale);
        
    
            /* Initial Position */
            mesh.position.set(x, y, z);
            mesh.rotateY(Math.PI)
            mesh.rotateY(-Math.PI / 6)

            resolve(mesh);
        })
    })
}

function generateCloud({x, y, z}){
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

    cloudMesh.position.set(x, y, z);

    return cloudMesh;
}