import THREE from "three.js";

class Box  {
  constructor(geometry, material, index) {
    this.index = index;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.set(0,0,0);
    // this.mesh.castShadow = true;
    // this.mesh.receiveShadow = true;
  }

  update(time)
  {
    // console.log(time);
    // console.log(Math.cos(time))
    let scale = Math.sin(time + (this.index * .2));
    this.mesh.scale.set(scale, scale, scale);
    this.mesh.position.z += Math.sin(time + (this.index * .2)) / 10;
  }

}

export default Box;