// import React from 'react';
// import * as THREE from "three";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// // import fragment from "./shader/fragment.glsl";
// // import vertex from "./shader/vertex.glsl”;

// //

// import * as dat from "dat.gui";
// import gsap from "gsap";

// import map from './earth-dark.jpg';


// // let scene;
// // let container;
// // let width;
// // let height;
// // let renderer;
// // let controls;
// // let camera;
// // let isPlaying;
// // let time;

// export default class Sketch extends React.Component {


//   constructor(options) {
//     super();
    
//     this.scene = new THREE.Scene();

//     if(options.dom){
//         console.log('options ==> ', options.dom?.offsetWidth)
//         this.container = options.dom;
    
//         console.log('container ==> ', this.container.offsetWidth )
//         this.width = this.container.offsetWidth;
//         this.height = this.container.offsetHeight;
//         this.renderer = new THREE.WebGLRenderer();
//         this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//         this.renderer.setSize(this.width, this.height);
//         this.renderer.setClearColor(0xeeeeee, 1); 
    
//         this.container.appendChild(this.renderer.domElement);
    
//         this.camera = new THREE.PerspectiveCamera(
//           70,
//           window.innerWidth / window.innerHeight,
//           0.001,
//           1000
//         );
    
//         // var frustumSize = 10;
//         // var aspect = window.innerWidth / window.innerHeight;
//         // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
//         this.camera.position.set(0, 0, 2);
//         this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//         this.time = 0;
    
//         this.isPlaying = true;
        
//         this.addObjects();
//         this.resize();
//         this.render();
//         this.setupResize();
//         // this.settings();
//     } else {
//         console.log('No Options available.. . ');
//         this.addObjects();
//         this.render();
//     }
    
//   }

//   settings() {
//     let that = this;
//     this.settings = {
//       progress: 0,
//     };
//     this.gui = new dat.GUI();
//     this.gui.add(this.settings, "progress", 0, 1, 0.01);
//   }

//   setupResize() {
//     window.addEventListener("resize", this.resize.bind(this));
//   }

//   resize() {
//     this.width = this.container.offsetWidth;
//     this.height = this.container.offsetHeight;
//     this.renderer.setSize(this.width, this.height);
//     this.camera.aspect = this.width / this.height;
//     this.camera.updateProjectionMatrix();
//   }

//   addObjects() {
//     let that = this;
//     this.materialShader = new THREE.ShaderMaterial({
//       extensions: {
//         derivatives: "#extension GL_OES_standard_derivatives : enable"
//       },
//       side: THREE.DoubleSide,
//       uniforms: {
//         time: { value: 0 },
//         resolution: { value: new THREE.Vector4() },
//       },
//       // wireframe: true,
//       transparent: true,
//     //   vertexShader: vertex,
//     //   fragmentShader: fragment
//     });

//     this.material = new THREE.MeshBasicMaterial({
//       map: new THREE.TextureLoader().load(map)
//     })

//     this.geometry = new THREE.SphereBufferGeometry(1, 30,30);

//     this.planet = new THREE.Mesh(this.geometry, this.material);
//     this.scene.add(this.planet);

//     // add pin

//     let mesh = new THREE.Mesh(
//       new THREE.SphereBufferGeometry(0.03,20,20),
//       new THREE.MeshBasicMaterial({color:0xff0000})
//     )
//     let mesh1 = new THREE.Mesh(
//       new THREE.SphereBufferGeometry(0.03,20,20),
//       new THREE.MeshBasicMaterial({color:0x00ff00})
//     )

//     let mesh2 = mesh1.clone();

//     // @todo VITE!!
//     // let lat = 15.6677 * Math.PI/180;
//     // let lng = 96.5545 * Math.PI/180;


//     // WRONG
//     function convertLatLngToCartesian(p){
//       let lat = (p.lat) * Math.PI/180;
//       let lng = (180+p.lng) * Math.PI/180;
//       let x = Math.sin(lat)*Math.sin(lng)
//       let y = Math.sin(lat)*Math.cos(lng)
//       let z = Math.cos(lat)
//       return {
//         x,y,z
//       }

//     }

//     // RIGHT!!!!
//     function calcPosFromLatLonRad(lat,lon) {
//       var phi   = (lat)*(Math.PI/180);
//       var theta = (lon+180)*(Math.PI/180);
//       let x = -(Math.cos(phi)*Math.cos(theta));
//       let z = ( Math.cos(phi)*Math.sin(theta));
//       let y = ( Math.sin(phi));
//       return {x,y,z};
//     }

//     // let point2 = {
//     //   lat:  34.0522,
//     //   lng: -118.2437
//     // }

//     // let point2 = {
//     //   lat: -23.6345,
//     //   lng: 102.5528
//     // }

//     let point1 = {
//       lat: 50.4501,
//       lng: 30.5234
//     }

//     let point2 = {
//       lat: 25.3548,
//       lng: 51.1839,
//     }

//     let point3 = {
//       lat: 41.8781,
//       lng: -87.6298,
//     }
//     // Dallas
//     let point4 = {
//       lat: 32.7767,
//       lng: -96.7970,
//     }
//     // Cancun
//     let point5 = {
//       lat: 21.1619,
//       lng: -86.8515,
//     }

//     // Puerto Escondido
//     let point6 = {
//       lat: 15.8720,
//       lng: -97.0767,
//     }

//     let flight = [
//       point1,
//       point2,
//       point3,
//       point4,
//       point5,
//       point6,
//     ]


//     for (var i = 0; i < flight.length; i++) {
//       let pos = calcPosFromLatLonRad(flight[i].lat,flight[i].lng);
      
//       let mesh = new THREE.Mesh(
//         new THREE.SphereBufferGeometry(0.03,20,20),
//         new THREE.MeshBasicMaterial({color:0xff0000})
//         // this.material
//       )
//       mesh.position.set(pos.x,pos.y,pos.z)
//       this.scene.add(mesh);
//       if(i<flight.length-1){
//         let pos1 = calcPosFromLatLonRad(flight[i+1].lat,flight[i+1].lng);
//         this.getCurve(pos,pos1)
//       }
      
//     }


//   }


//   getCurve(p1,p2){
//     let v1 = new THREE.Vector3(p1.x,p1.y,p1.z);
//     let v2 = new THREE.Vector3(p2.x,p2.y,p2.z);
//     let points = []
//     for (let i = 0; i <=20; i++) {
//       let p = new THREE.Vector3().lerpVectors(v1,v2, i/20)
//       p.normalize()
//       p.multiplyScalar(1 + 0.04*Math.sin(Math.PI*i/20));
//       points.push(p)
//     }

//     let path = new THREE.CatmullRomCurve3(points);



//     const geometry = new THREE.TubeGeometry( path, 20, 0.005, 8, false );
//     const material = this.materialShader
//     const mesh = new THREE.Mesh( geometry, material );
//     this.scene.add( mesh );

//   }


//   stop() {
//     this.isPlaying = false;
//   }

//   play() {
//     if(!this.isPlaying){
//       this.render()
//       this.isPlaying = true;
//     }
//   }

//   render() {
//     if (!this.isPlaying) return;
//     this.time += 0.05;
//     this.scene.rotation.y = -this.time/30
//     this.materialShader.uniforms.time.value = this.time;
//     requestAnimationFrame(this.render.bind(this));
//     this.renderer.render(this.scene, this.camera);
//   }
// }

// new Sketch({
//   dom: document.getElementById("container")
// });





// /********************************************************************************************************************************/

// import React from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// // import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// // import fragment from "./shader/fragment.glsl";
// // import vertex from "./shader/vertex.glsl”;

// //

// import * as dat from "dat.gui";
// import gsap from "gsap";

// import map from "./earth-dark.jpg";

// let scene;
// let container;
// let scene_width;
// let scene_height;
// let renderer;
// let controls;
// let camera;
// let isPlaying;
// let time;

// // export default class Sketch extends React.Component {
// function Globe() {
//   scene = new THREE.Scene();
//   container = document.getElementById("globe");
//   scene_width = container.offsetWidth;
//   scene_height = container.offsetHeight;
//   renderer = new THREE.WebGLRenderer();
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//   renderer.setSize(scene_width, scene_height);
//   renderer.setClearColor(0xeeeeee, 1);
//   container.appendChild(renderer.domElement);

//   camera = new THREE.PerspectiveCamera(
//     70,
//     window.innerWidth / window.innerHeight,
//     0.001,
//     1000
//   );
//   camera.position.set(0, 0, 2);
//   controls = new OrbitControls(camera, renderer.domElement);
//   time = 0;
//   isPlaying = true;

//   const addPlanet = () => {
//     const materialShader = new THREE.ShaderMaterial({
//       extensions: {
//         derivatives: "#extension GL_OES_standard_derivatives : enable",
//       },
//       side: THREE.DoubleSide,
//       uniforms: {
//         time: { value: 0 },
//         resolution: { value: new THREE.Vector4() },
//       },
//       // wireframe: true,
//       transparent: true,
//       //       vertexShader: vertex,
//       //       fragmentShader: fragment,
//     });

//     const material = new THREE.MeshBasicMaterial({
//       map: new THREE.TextureLoader().load(map),
//     });

//     const geometry = new THREE.SphereBufferGeometry(1, 30, 30);

//     const planet = new THREE.Mesh(geometry, material);
//     scene.add(planet);
//   };

//   const addObjects = () => {
//     addPlanet();
//   };

//   const resize = () => {
//     scene_width = container.offsetWidth;
//     scene_height = this.container.offsetHeight;
//     renderer.setSize(scene_width, scene_height);
//     camera.aspect = scene_width / scene_height;
//     camera.updateProjectionMatrix();
//   };

//   const render = () => {};

//   const setupResize = () => {
//     window.addEventListener("resize", resize.bind(this));
//   };

//   function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
//   }
//   animate();

//   addObjects();
//   // this.resize();
//   // this.render();
//   // this.setupResize();

//   return <div id="globe"></div>;
// }

// export default Globe;
