import { Mesh, Object3D } from "three";

// console.log(Mesh);

class ParametricMesh extends Mesh {
  constructor() {
    super();
  }
}

class ParametricGroup extends Object3D {
  constructor() {
    super();
  }
}

export { ParametricMesh, ParametricGroup };
