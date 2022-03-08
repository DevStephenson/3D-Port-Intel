import React, { Component } from "react";
// import './styles/App.scss';
import * as THREE from "three";
import * as _ from "lodash";
// import Moment from 'react-moment';
import moment from "moment";
// import map from "./earth-dark.jpg";
import map from "./earthmap1k.jpg";
import mapDark from "./earth-dark.jpg";
import bumpMap from "./earthbump1k.jpg";


// import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { shuffle, isWinningCombination } from "./helper/helper";
import { rubik_colors, color_opt_array } from "./cubes/colors";
import {
  getDraggableIntersectionsOfSelectedSq,
  getAvailableSqByDirection,
} from "./helper/intersects";
import portdata from "./Drew.json";

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

const globeRadius = 1;
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

//     globeGroup.rotation.y -= 0.015

    cubes.forEach((o) => {
      o.userData.update(o);
    });

    controls.update();
    renderer.render(scene, camera);
  };

//   calcPosFromLatLonRadN = (lat, lon, radius) => {
//     const phi = lat * (Math.PI / 180);
//     const theta = -lon * (Math.PI / 180);

//     var x = radius * Math.cos(phi) * Math.cos(theta);
//     var y = radius * Math.cos(phi) * Math.sin(theta);
//     var z = radius * Math.sin(phi);
//     return { x, y, z };
//   };

  calcPosFromLatLonRadN = (lat,lon,radius) => {
  
        // var phi   = (90-lat)*(Math.PI/180);
        // var theta = (lon)*(Math.PI/180);
    
        // const x = -(radius * Math.sin(phi)*Math.cos(theta));
        // const z = (radius * Math.sin(phi)*Math.sin(theta));
        // const y = (radius * Math.cos(phi));
      
        // return { x, y, z };

        const phi = lat * (Math.PI / 180);
        const theta = -lon * (Math.PI / 180);
    
        var x = radius * Math.cos(phi) * Math.cos(theta);
        var y = radius * Math.cos(phi) * Math.sin(theta);
        var z = radius * Math.sin(phi);
        return { x, y, z };
    
    }

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
    camera.position.z = 2;
//     globeGroup.rotateY(180)
//     globeGroup.rotateX(-5)
    scene = new THREE.Scene();
//     alpha: true 
    renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setClearColor(0x000000, 0); // the default
    renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
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

//     const axesHelper = new THREE.AxesHelper(5);
//     scene.add(axesHelper);

    const globeGeo = new THREE.SphereBufferGeometry(globeRadius, 72, 72);

//     uniform mat4 projectionMatrix;
//         uniform mat4 viewMatrix;
//         uniform mat4 modelMatrix;
// attribute vec3 position;
    //     attribute vec2 vUv;
    //     uniform smapler2D globeTexture;

//     precision mediump float;

//     const material = new THREE.ShaderMaterial({

//       vertexShader: `
//         varying vec2 vUv;

//         void main()
//         {
//                 vUv = uv;
//                 gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
//         }`,
//       fragmentShader: `
//         uniform sampler2D globeTexture;

//         varying vec2 vUv;

//         void main() {
//             gl_FragColor = vec4(texture2D(globeTexture, vUv).xyz, .9);
//         }`,
//       uniforms: {
//         globalTexture: {
//           value: new THREE.TextureLoader().load(map),
//         },
//       },
//     });

//     material.uniforms.globalTexture.value = new THREE.TextureLoader().load(map);

//     uniforms: {
//         globalTexture: {
//           value: new THREE.TextureLoader().load(map),
//         },
//       },


    //  vUv = uv;
    //       uniform mat4 projectionMatrix;
    //           uniform mat4 viewMatrix;
    //           uniform mat4 modelMatrix;

    //           attribute vec3 position;

    //       precision mediump float;

    //       ./earth-dark.jpg
        const material = new THREE.MeshPhongMaterial({
          roughness: .5,
          metalness: 1,
          map: new THREE.TextureLoader().load(map),
          bumpMap: new THREE.TextureLoader().load(bumpMap),
          bumpScale:   0.05,
        });


        // const globeMesh = new THREE.Mesh(globeGeo,material )
        // map: new THREE.TextureLoader().load(map),
        //   displacementMap: new THREE.TextureLoader().load(bumpMap),

    const globe = new THREE.Mesh(globeGeo, material);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);


    const pointLight2 = new THREE.PointLight(0xffffff, 1);
    pointLight2.position.set(-5, 3, -5);
    scene.add(pointLight2);
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

    console.log("portdata ==> ", portdata);

    const colorArray = [
      "#15bece",
      "#bbbd21",
      "#7f7f7f",
      "#e377c2",
      "#8c554a",
      "#9466bd",
      "#d62827",
      "#2da02b",
      "#ff7f0f",
      "#000000",
    ];
    let count = 0;

    for (const port of portdata) {
      //     const port = portdata[i];
//       console.log("port _ ", port);

      const paths = JSON.parse(port.path);
      //       console.log("paths ==> ", paths);

      for (const path of paths) {
        var color = new THREE.Color(colorArray[count]); // "FFA6A6" won't work!
        color.getHex(); // 0xFFA6A6

        let mesh = new THREE.Mesh(
          new THREE.SphereBufferGeometry(0.001, 20, 20),
          new THREE.MeshBasicMaterial({ color })
          // this.material
        );
        let pos = this.calcPosFromLatLonRadN(path.LAT, path.LON, globeRadius);
        mesh.position.set(pos.x, pos.z, pos.y);
        scene.add(mesh);
      }
      //         let pos = this.calcPosFromLatLonRadN(
      //         flight[i].lat,
      //         flight[i].lng,
      //         globeRadius
      //       );

      //       let mesh = new THREE.Mesh(
      //         new THREE.SphereBufferGeometry(0.01, 20, 20),
      //         new THREE.MeshBasicMaterial({ color: 0xff0000 })
      //         // this.material
      //       );
      //       mesh.position.set(pos.x, pos.z, pos.y);
      //       scene.add(mesh);

      //       if (i < flight.length - 1) {
      //         let pos1 = this.calcPosFromLatLonRadN(
      //           flight[i + 1].lat,
      //           flight[i + 1].lng,
      //           globeRadius
      //         );
      //         this.getCurve(pos, pos1);
      //       }
      count++;
    }

    scene.add(globeGroup);
    appEl.appendChild(renderer.domElement);
  };

  getCurve(p1, p2) {
    let v1 = new THREE.Vector3(p1.x, p1.z, p1.y);
    let v2 = new THREE.Vector3(p2.x, p2.z, p2.y);
    let points = [];

    for (let i = 0; i <= 10; i++) {
      let p = new THREE.Vector3().lerpVectors(v1, v2, i / 10);
      //       console.log("getCurve ==> ", p);
      p.normalize();
      //       p.multiplyScalar(1 + 0.41 * Math.sin((Math.PI * i) / 10));
      // p.multiplyScalar(1 + 0.1 * Math.sin((Math.PI * i) / 10));
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
      vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;
        
        attribute vec3 position;
        attribute vec2 vUv;
            
        void main()
        {
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        precision mediump float;

        uniform smapler2D globeTexture;

        void main() {
                gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }`,
    });

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
