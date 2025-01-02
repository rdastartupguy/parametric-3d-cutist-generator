import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import * as dat from "dat.gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { ParametricMesh, ParametricGroup } from "./parametriceditor";

let renderer;
let topTableMesh, bottomTableMesh, leftTableMesh, rightTableMesh;
let parametricgroup;
let pickableObjects = [];
let panelMaterial, legMaterial;
let topgeometry;
let cutpieces;
let mmtocm = 0.1;
let convertDimention = {
  width:0,
  height:0,
  depth:0
}
let thickness = {
  panel: 4,
  leg: 5,
  radius: 1.0,
  posx: 10,
  posy: 5,
  scale: 1.0,
  svg: "circle",
};



/**
 * Object representing a group size with width, height, and depth properties.
 * Contains a method to generate cut pieces based on the group size.
 * @type {Object}
 * @property {number} group_width - The width of the group.
 * @property {number} group_height - The height of the group.
 * @property {number} group_depth - The depth of the group.
 * @method generate - Generates cut pieces based on the group size and opens a new window with the cut list.
 */
let groupsize = {
  group_width: 1000, // mm
  group_height: 300, // mm
  group_depth: 1000, // mm
  generate:function(){ 
      cutpieces = [
       {
        label:"Top Plank", 
        width:groupsize.group_width, 
        length:groupsize.group_depth,  
      }
      ,{
        label:"left Leg",
        width:groupsize.group_width * 0.5, 
        length:groupsize.group_height,  
      }
      ,{
        label:"right Leg",
        width:groupsize.group_width * 0.5, 
        length:groupsize.group_height, 
      }];

      let cutlistjsonData = encodeURIComponent(JSON.stringify(cutpieces));
      window.open('http://localhost:4200/?cutlist='+cutlistjsonData, '_blank');
  }
};





// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

const Logo = document.querySelector("#logo");
Logo.setAttribute("src", "./assets/logo.png");

// Scene
const scene = new THREE.Scene();
panelMaterial = new THREE.MeshStandardMaterial({color:0x563517,side:THREE.DoubleSide});
legMaterial =  new THREE.MeshStandardMaterial({color:0x6f4827,side:THREE.DoubleSide});

parametricgroup = new ParametricGroup();

/* Top Panel Mesh */
topTableMesh = new ParametricMesh();

// https://stackoverflow.com/questions/66257241/how-to-create-shelf-with-rounded-corner-in-three-js
// https://threejs.org/docs/#api/en/extras/core/Path.absarc
/**
 * Generates a rounded shape with the specified width, height, and radius using the THREE.js library.
 * @param {number} width - The width of the shape.
 * @param {number} height - The height of the shape.
 * @param {number} radius - The radius of the rounded corners.
 * @returns {THREE.Shape} A THREE.js shape representing the rounded shape.
 */
function generateroundedshape(width, height, radius) {
  let shape = new THREE.Shape();
  let halfX = width * 0.5 - radius;
  let halfY = height * 0.5 - radius;
  let baseAngle = Math.PI * 0.5;

  shape.absarc(halfX, halfY, radius, baseAngle * 0, baseAngle * 0 + baseAngle);
  shape.absarc(-halfX, halfY, radius, baseAngle * 1, baseAngle * 1 + baseAngle);
  shape.absarc(
    -halfX,
    -halfY,
    radius,
    baseAngle * 2,
    baseAngle * 2 + baseAngle
  );
  shape.absarc(halfX, -halfY, radius, baseAngle * 3, baseAngle * 3 + baseAngle);

  return shape;
}

convertDimention = {
  width : groupsize.group_width * mmtocm,
  height : groupsize.group_height * mmtocm,
  depth : groupsize.group_depth * mmtocm
}

let topshape = generateroundedshape(
  convertDimention.width,
  convertDimention.depth,
  thickness.radius
);

let extrudeSettings = {
  depth: 4,
};




/**
 * Creates a 3D extruded geometry for a top panel using the provided shape and extrude settings.
 * Computes vertex normals for the geometry and assigns it to the topTableMesh.
 * Sets the material, name, and adds a box helper to the topTableMesh for visualization.
 * Sets the position and rotation of the topTableMesh.
 * @param {THREE.Shape} topshape - The shape to extrude for the top panel.
 * @param {THREE.ExtrudeGeometrySettings} extrudeSettings - The settings for extruding the shape.
 * @param {THREE.Mesh} topTableMesh - The mesh representing the top panel.
 * @param {THREE.Material} panelMaterial - The material to apply
 */
topgeometry = new THREE.ExtrudeGeometry(topshape, extrudeSettings);

topgeometry.computeVertexNormals();

topTableMesh.geometry = topgeometry;
// panelMaterial.map.repeat.set(0.08, 0.08);
topTableMesh.material = panelMaterial;
topTableMesh.name = "top-panel";
const topTableMeshbox = new THREE.BoxHelper(topTableMesh, 0xc0392b);
topTableMeshbox.visible = false;
topTableMesh.add(topTableMeshbox);
topTableMesh.boxhelper = topTableMeshbox;
// topTableMesh.position.y = 0;
topTableMesh.position.y = convertDimention.height + thickness.panel;
topTableMesh.position.z = 0;
topTableMesh.position.x = 0;
topTableMesh.rotation.set(-1.57, 0, 0);



/* Left Panel Mesh */
/**
 * Creates a left table mesh with specified dimensions and materials.
 * @returns None
 */
leftTableMesh = new ParametricMesh();

let leftgeometry = new THREE.BoxGeometry(
  convertDimention.width * 0.5,
  convertDimention.height,
  thickness.leg
);
leftgeometry.translate(
  0,
  convertDimention.height / 2 + thickness.panel,
  convertDimention.depth * 0.25
);

leftTableMesh.geometry = leftgeometry;
leftTableMesh.material = legMaterial;
leftTableMesh.name = "left-panel";
const leftTableMeshbox = new THREE.BoxHelper(leftTableMesh, 0xc0392b);
leftTableMeshbox.visible = false;
leftTableMesh.add(leftTableMeshbox);
leftTableMesh.boxhelper = leftTableMeshbox;

/* Right Panel Mesh */

/**
 * Creates a right table mesh with specified dimensions and materials.
 * @returns None
 */
rightTableMesh = new ParametricMesh();
let rightgeometry = new THREE.BoxGeometry(
  convertDimention.width * 0.5,
  convertDimention.height,
  thickness.leg
);
rightgeometry.translate(
  0,
  convertDimention.height / 2 + thickness.panel,
  -convertDimention.depth * 0.25
);
rightTableMesh.geometry = rightgeometry;
rightTableMesh.material = legMaterial;
rightTableMesh.name = "right-panel";
const rightTableMeshbox = new THREE.BoxHelper(rightTableMesh, 0xc0392b);
rightTableMeshbox.visible = false;
rightTableMesh.add(rightTableMeshbox);
rightTableMesh.boxhelper = rightTableMeshbox;
rightTableMesh.position.y = 0;
rightTableMesh.position.z = 0;



let vertexs = [];

/* add Mesh to parametricGroup */
/**
 * Add the specified meshes to the parametric group.
 * @param {Mesh} topTableMesh - The mesh to add to the parametric group for the top table.
 * @param {Mesh} bottomTableMesh - The mesh to add to the parametric group for the bottom table.
 * @param {Mesh} leftTableMesh - The mesh to add to the parametric group for the left table.
 * @param {Mesh} rightTableMesh - The mesh to add to the parametric group for the right table.
 * @returns None
 */
parametricgroup.add(topTableMesh);
parametricgroup.add(bottomTableMesh);
parametricgroup.add(leftTableMesh);
parametricgroup.add(rightTableMesh);

/**
 * Add the specified mesh objects to the list of pickable objects.
 * @param {Mesh} topTableMesh - The mesh object representing the top table.
 * @param {Mesh} bottomTableMesh - The mesh object representing the bottom table.
 * @param {Mesh} leftTableMesh - The mesh object representing the left table.
 * @param {Mesh} rightTableMesh - The mesh object representing the right table.
 * @returns None
 */
pickableObjects.push(topTableMesh);
pickableObjects.push(bottomTableMesh);
pickableObjects.push(leftTableMesh);
pickableObjects.push(rightTableMesh);

/**
 * Set the y position of the parametric group to half the negative height of the converted dimension
 * and add the parametric group to the scene.
 */
parametricgroup.position.y = -convertDimention.height * 0.5;
scene.add(parametricgroup);

// Make sure the .matrix of each mesh is current
topTableMesh.updateMatrix();


const light = new THREE.AmbientLight(0xffffff, 0.6); // soft white light
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(-100, 50, 50);

scene.add(dirLight);


const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight1.position.set(100, 50, -80);
scene.add(dirLight1);

/**
 * Creates a folder in the GUI interface for controlling table resize options.
 * Allows the user to customize the width, height, and depth of the table.
 * Also provides an option to generate a cutlist for the table.
 * @param {string} "Table Resize Controls" - The name of the folder in the GUI.
 * @returns None
 */
const customizableFolder = gui.addFolder("Table Resize Controls");

customizableFolder
  .add(groupsize, "group_width", 500, 1200, 10)
  .onChange(function (value) {
    groupsize.group_width = value;
    resizePanelTable();
  })
  .name("width (mm)");
customizableFolder
  .add(groupsize, "group_height", 300, 800, 10)
  .onChange(function (value) {
    groupsize.group_height = value;
    resizePanelTable();
  })
  .name("height (mm)");
customizableFolder
  .add(groupsize, "group_depth", 500, 1200, 10)
  .onChange(function (value) {
    groupsize.group_depth = value;
    resizePanelTable();
  })
  .name("depth (mm)");



  customizableFolder
  .add(groupsize, "generate")
  .name("Generate Cutlist");

customizableFolder.open();



/**
 * Resize the panel table based on the provided dimensions and settings.
 * This function calculates the dimensions of the panel table, generates the shapes,
 * and positions the table mesh accordingly.
 * @returns None
 */
function resizePanelTable() {
  convertDimention = {
    width : groupsize.group_width * mmtocm,
    height : groupsize.group_height * mmtocm,
    depth : groupsize.group_depth * mmtocm
  }
  extrudeSettings.depth = thickness.panel;
  topshape = generateroundedshape(
    convertDimention.width,
    convertDimention.depth,
    thickness.radius
  );
 

  topgeometry = new THREE.ExtrudeGeometry(topshape, extrudeSettings);

  // topgeometry.translate(0, groupsize.group_height, 0);
  topTableMesh.geometry.dispose();
  topTableMesh.geometry = topgeometry;

  topTableMesh.position.y = convertDimention.height + thickness.panel;
  topTableMesh.position.z = 0;
  topTableMesh.position.x = 0;
  topTableMesh.rotation.set(-1.57, 0, 0);

  extrudeSettings.depth = thickness.panel;

  leftgeometry = new THREE.BoxGeometry(
    (convertDimention.width) * 0.5,
    (convertDimention.height),
    thickness.leg
  );
  leftgeometry.translate(
    0,
    convertDimention.height / 2 + thickness.panel,
    convertDimention.depth * 0.25
  );
  leftTableMesh.geometry.dispose();
  leftTableMesh.geometry = leftgeometry;

  rightgeometry = new THREE.BoxGeometry(
    convertDimention.width * 0.5,
    convertDimention.height,
    thickness.leg
  );
  rightgeometry.translate(
    0,
    convertDimention.height / 2 + thickness.panel,
    -convertDimention.depth * 0.25
  );
  rightTableMesh.geometry.dispose();
  rightTableMesh.geometry = rightgeometry;
  parametricgroup.position.y = -convertDimention.height * 0.5;
  
}



/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
/**
 * Creates a new PerspectiveCamera object with the specified parameters and adds it to the scene.
 * @param {number} 35 - The field of view in degrees.
 * @param {number} sizes.width / sizes.height - The aspect ratio.
 * @param {number} 1 - The near clipping plane.
 * @param {number} 100000 - The far clipping plane.
 * @returns None
 */
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  1,
  100000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 400;
scene.add(camera);



//Controls
/**
 * Initializes a new instance of OrbitControls with the given camera and canvas,
 * and sets various properties for controlling the camera movement.
 * @param {THREE.Camera} camera - The camera to be controlled.
 * @param {HTMLCanvasElement} canvas - The canvas element for interaction.
 * @returns None
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = false;
;

/**
 * Renderer
 */
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMapAutoUpdate = true;
renderer.physicallyCorrectLights = false;
renderer.shadowMapSoft = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Loads an HDR environment map and sets it as the scene's environment.
 * @param {string} path - The path to the HDR environment map file.
 * @returns None
 */
function hdrimapLoader(path) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  new RGBELoader().load(path, (hdrEquiRect, textureData) => {
    let hdrCubeRenderTarget = pmremGenerator.fromEquirectangular(hdrEquiRect);
    pmremGenerator.compileCubemapShader();

    scene.environment = hdrCubeRenderTarget.texture;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
  });
}

hdrimapLoader("./hdr/Studio2/brown_photostudio_02_1k.hdr");



/**
 * Animate
 */


const tick = () => {
 
  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();


