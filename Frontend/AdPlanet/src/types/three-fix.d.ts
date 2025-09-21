declare module "three" {
  export class Object3D {
    name: string;
    parent: Object3D | null;
    children: Object3D[];
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
  }
  export class PerspectiveCamera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    position: {
      x: number;
      y: number;
      z: number;
      set: (x: number, y: number, z: number) => void;
    };
    lookAt: (vector: { x: number; y: number; z: number }) => void;
    updateProjectionMatrix: () => void;
  }
}
