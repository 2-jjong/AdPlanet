import * as THREE from "three/src/Three.js";

export const initialStates = {
    ocean: { position: [400, 300, -350], scale: 200, rotation: [0, 5, 0] },
    ice: { position: [0, -200, -500], scale: 230, rotation: [-Math.PI / 2, 0, 0] },
    mars: { position: [0, -100, 530], scale: 100, rotation: [-Math.PI / 2, 0, 0] },
    green: { position: [0, 250, 300], scale: 130, rotation: [-Math.PI / 2, 0, 0] },
};
export const initialCameraPos = new THREE.Vector3(0, 0, 10);