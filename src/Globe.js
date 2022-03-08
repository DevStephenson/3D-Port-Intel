import React, { Component } from "react";
// import './styles/App.scss';
import * as THREE from "three";
import * as _ from "lodash";
// import Moment from 'react-moment';
import moment from "moment";
// import map from "./earth-dark.jpg";
import map from "./earthmap1k.jpg";

// import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { shuffle, isWinningCombination } from "./helper/helper";
import { rubik_colors, color_opt_array } from "./cubes/colors";
import {
  getDraggableIntersectionsOfSelectedSq,
  getAvailableSqByDirection,
} from "./helper/intersects";
// import { generateGameboardCubes, generateMasterCubes } from './cubes/gameboard';
// import { generateMasterCubeDisplay } from './controls/controls';

import lFragment from "./utils/shader/line_fragment.glsl";
import lVertex from "./utils/shader/line_vertex.glsl";

// // import vertex from "./shader/vertex.glsl”;
import {
  BsChevronDown,
  BsChevronLeft,
  BsChevronRight,
  BsChevronUp,
} from "react-icons/bs";
import { FiMenu } from "react-icons/fi";

// debuger
// const gui = new dat.GUI({ closed: true });

const globeRadius = 3;
// global
let camera, dragControls, scene, renderer, appEl;
let controls;
let cubes = [];
let globeGroup;
let materialShader;
// let setInervalTimer;

let masterGameMap = new Map();
const boardGameMap = new Map();

const game_map_row1 = new Map();
const game_map_row2 = new Map();
const game_map_row3 = new Map();

const boardGameMap_row1 = new Map();
const boardGameMap_row2 = new Map();
const boardGameMap_row3 = new Map();

masterGameMap.set(0, game_map_row1);
masterGameMap.set(1, game_map_row2);
masterGameMap.set(2, game_map_row3);

boardGameMap.set(0, boardGameMap_row1);
boardGameMap.set(1, boardGameMap_row2);
boardGameMap.set(2, boardGameMap_row3);

class Globe extends Component {
  constructor() {
    super();
    this.state = {
      startTime: 0,
      clock: 0,
      masterCubeArr: [],
    };
  }

  componentDidMount() {
    appEl = document.getElementsByClassName("webgl")[0];
    this.init();
    this.bindResize();
    this.bindKeyPress();
  }

  bindKeyPress = () => {
    window.addEventListener("keydown", (e) => {
      e.preventDefault();

      let isAnimating = false;

      if (!this.debouncedFn) {
        this.debouncedFn = _.debounce((key) => {
          switch (key) {
            case "ArrowLeft": // left
              break;

            case "ArrowUp": // up
              break;

            case "ArrowRight": // right
              break;

            case "ArrowDown": // down
              break;
            default:
              return; // exit this handler
          }
        }, 100);
      }

      if (!isAnimating) {
        isAnimating = true;
        this.debouncedFn(e.key);
      }
    });
  };

  bindResize = () => {
    window.addEventListener("resize", (e) => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  generateGridHelper = () => {
    var standardPlaneNormal = new THREE.Vector3(0, 0, 1);
    var GridHelperPlaneNormal = new THREE.Vector3(0, 1, 0);
    var GridHelperPlaneMaster = new THREE.Vector3(0, 1, 0);

    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(standardPlaneNormal, GridHelperPlaneNormal);

    var masterQuaternion = new THREE.Quaternion();
    masterQuaternion.setFromUnitVectors(
      standardPlaneNormal,
      GridHelperPlaneMaster
    );

    var largeGridGuide = new THREE.GridHelper(10, 10);
    largeGridGuide.rotation.setFromQuaternion(quaternion);

    scene.add(largeGridGuide);
  };

  animation = (_time) => {
    if (this.materialShader) {
      this.materialShader.uniforms.time = _time;
    }

    cubes.forEach((o) => {
      o.userData.update(o);
    });

    controls.update();
    renderer.render(scene, camera);
  };

  calcPosFromLatLonRadN = (lat, lon, radius) => {
    const phi = lat * (Math.PI / 180);
    const theta = -lon * (Math.PI / 180);

    var x = radius * Math.cos(phi) * Math.cos(theta);
    var y = radius * Math.cos(phi) * Math.sin(theta);
    var z = radius * Math.sin(phi);
    return { x, y, z };
  };

  vertexShader = () => {
    return `
          varying vec3 vUv; 
      
          void main() {
            vUv = position; 
      
            vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
          }
        `;
  };

  //   gl_FragColor =  vec4(vUv.y, 0, 0, 1.0)
  fragShader = () => {
    return `
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec3 vUv;
  
        void main() {
                float dash = sin(vUv.x*50)
                if(dash<0) discard;
        gl_FragColor = vec4(vUv.y, 0, 0, 1.0);
        }
    `;
  };

  init = () => {
    globeGroup = new THREE.Group();
    camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    camera.position.z = 6;
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // the default
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.setAnimationLoop(this.animation);

    controls = new OrbitControls(camera, appEl);
    controls.enableDamping = true;

    let uniforms = {
      time: { value: 0 },
      side: THREE.DoubleSide,
      colorB: { type: "vec3", value: new THREE.Color(0xacb6e5) },
      colorA: { type: "vec3", value: new THREE.Color(0x74ebd5) },
    };

    materialShader = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: uniforms,
      fragmentShader: this.fragShader(),
      vertexShader: this.vertexShader(),
    });

    // materialShader = new THREE.ShaderMaterial({
    //   extensions: {
    //     derivatives: "#extension GL_OES_standard_derivatives : enable",
    //   },
    //   side: THREE.DoubleSide,
    //   uniforms: {
    //     time: { value: 0 },
    //     resolution: { value: new THREE.Vector4() },
    //     colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
    //     colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
    //   },
    //   wireframe: true,
    //   transparent: true,
    //   vertexShader: this.vertexShader(),
    //   fragmentShader: this.fragShader(),
    // });

    // setup Map

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const globeGeo = new THREE.SphereBufferGeometry(globeRadius);
    const material = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(map),
    });

    const globe = new THREE.Mesh(globeGeo, material);

    //     const atl = [33.749, -84];
    //     const chi = [41.8781, -87.6298];

    //     const atlv = this.calcPosFromLatLonRadN(atl[0], atl[1], globeRadius);
    //     let atlMesh = new THREE.Mesh(
    //       new THREE.SphereBufferGeometry(0.03, 20, 20),
    //       new THREE.MeshBasicMaterial({ color: 0xad1001 })
    //     );
    //     atlMesh.position.set(atlv.x, atlv.z, atlv.y);
    //     globeGroup.add(atlMesh);

    //     const chiV = this.calcPosFromLatLonRadN(chi[0], chi[1], globeRadius);
    //     let chiMesh = new THREE.Mesh(
    //       new THREE.SphereBufferGeometry(0.03, 20, 20),
    //       new THREE.MeshBasicMaterial({ color: 0xf04e37 })
    //     );
    //     chiMesh.position.set(chiV.x, chiV.z, chiV.y);
    //     globeGroup.add(chiMesh);
    globeGroup.add(globe);

    // Atl
    let point1 = {
      lat: 33.749,
      lng: -84,
    };

    // Chi
    let point2 = {
      lat: 41.8781,
      lng: -87.6298,
    };

    // LA
    let point3 = {
      lat: 34.0522,
      lng: -118.2437,
    };

    //
    let point4 = {
      lat: 35.6762,
      lng: 139.6503,
    };

    let flight = [point1, point2, point3, point4];

    for (var i = 0; i < flight.length; i++) {
      let pos = this.calcPosFromLatLonRadN(
        flight[i].lat,
        flight[i].lng,
        globeRadius
      );

      let mesh = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.03, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // this.material
      );
      mesh.position.set(pos.x, pos.z, pos.y);
      scene.add(mesh);

      if (i < flight.length - 1) {
        let pos1 = this.calcPosFromLatLonRadN(
          flight[i + 1].lat,
          flight[i + 1].lng,
          globeRadius
        );
        this.getCurve(pos, pos1);
      }
    }
    scene.add(globeGroup);
    appEl.appendChild(renderer.domElement);
  };

  getCurve(p1, p2) {
    let v1 = new THREE.Vector3(p1.x, p1.z, p1.y);
    let v2 = new THREE.Vector3(p2.x, p2.z, p2.y);
    let points = [];

    for (let i = 0; i <= 20; i++) {
      let p = new THREE.Vector3().lerpVectors(v1, v2, i / 20);
      //       console.log("getCurve ==> ", p);
//       p.normalize()
      p.multiplyScalar(1 + 0.51 * Math.sin((Math.PI * i) / 20));
      points.push(p);
    }
    let path = new THREE.CatmullRomCurve3(points, false);

    const geometry = new THREE.TubeGeometry(path, 72, 0.005, 8, false);

    let uniforms = {
      time: { value: 0 },
      side: THREE.DoubleSide,
      colorB: { type: "vec3", value: new THREE.Color(0xacb6e5) },
      colorA: { type: "vec3", value: new THREE.Color(0x74ebd5) },
    };

//     const material = new THREE.ShaderMaterial({
//       extensions: {
//         derivatives: "#extension GL_OES_standard_derivatives : enable",
//       },
//       side: THREE.DoubleSide,
//       uniforms: uniforms,
//       fragmentShader: fragment,
//       vertexShader: this.vertexShader(),
//     });

    const material = new THREE.RawShaderMaterial({
        vertexShader:lVertex,
        fragmentShader: lFragment
    })

    const mesh = new THREE.Mesh(geometry, material);
    globeGroup.add(mesh);
  }

  render() {
    return (
      <>
        <div className="webgl"></div>
      </>
    );
  }
}

export default Globe;
