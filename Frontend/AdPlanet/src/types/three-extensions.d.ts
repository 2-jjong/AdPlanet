declare module "three/examples/jsm/loaders/GLTFLoader" {
  import { Loader, LoadingManager } from "three";
  import { Group } from "three";

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (gltf: { scene: Group }) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: ErrorEvent) => void
    ): void;
  }
}

declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, EventDispatcher, MOUSE, Vector3 } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement: HTMLElement);
    object: Camera;
    domElement: HTMLElement | Document;

    enabled: boolean;
    target: Vector3;

    enableZoom: boolean;
    enablePan: boolean;

    update(): void;
  }
}
