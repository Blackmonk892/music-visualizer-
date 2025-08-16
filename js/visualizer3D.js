// class Visualizer3D {
//     constructor(audioEngine) {
//         this.audioEngine = audioEngine;
//         this.mode = 'basscube';

//         // Set up Three.js scene
//         this.scene = new THREE.Scene();
//         this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         this.renderer = new THREE.WebGLRenderer({ antialias: true });
//         this.renderer.setSize(window.innerWidth, window.innerHeight);

//         // ✅ DOM fix inserted here
//         this.renderer.domElement.id = 'threejs-canvas';
//         document.body.appendChild(this.renderer.domElement);

//         // Resize handling
//         window.addEventListener('resize', () => this.onResize());

//         // Initialize modes
//         this.initBassCube();
//         this.initWaveGrid();
//         this.initGalaxyParticles();

//         this.camera.position.z = 5;
//         this.animate();
//     }

//     onResize() {
//         this.camera.aspect = window.innerWidth / window.innerHeight;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//     }

//     setMode(mode) {
//         this.mode = mode;
//         this.hideAll();
//         if (mode === 'basscube') this.bassCube.visible = true;
//         if (mode === 'wavegrid') this.waveGrid.visible = true;
//         if (mode === 'galaxy') this.galaxy.visible = true;
//     }

//     hideAll() {
//         this.bassCube.visible = false;
//         this.waveGrid.visible = false;
//         this.galaxy.visible = false;
//     }

//     initBassCube() {
//         const geometry = new THREE.BoxGeometry(1, 1, 1);
//         const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
//         this.bassCube = new THREE.Mesh(geometry, material);
//         this.scene.add(this.bassCube);

//         const light = new THREE.PointLight(0xffffff, 1, 100);
//         light.position.set(5, 5, 5);
//         this.scene.add(light);
//     }

//     initWaveGrid() {
//         const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);
//         const material = new THREE.MeshBasicMaterial({ color: 0x00aaff, wireframe: true });
//         this.waveGrid = new THREE.Mesh(geometry, material);
//         this.waveGrid.rotation.x = -Math.PI / 2;
//         this.waveGrid.visible = false;
//         this.scene.add(this.waveGrid);
//     }

//     initGalaxyParticles() {
//         const particles = new THREE.BufferGeometry();
//         const count = 1000;
//         const positions = new Float32Array(count * 3);

//         for (let i = 0; i < count * 3; i++) {
//             positions[i] = (Math.random() - 0.5) * 20;
//         }

//         particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//         const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
//         this.galaxy = new THREE.Points(particles, material);
//         this.galaxy.visible = false;
//         this.scene.add(this.galaxy);
//     }

//     animate() {
//         this._animationFrame = requestAnimationFrame(() => this.animate());
//         const freqData = this.audioEngine.getFrequencyData();
//         if (!freqData) return;

//         switch (this.mode) {
//             case 'basscube':
//                 const bass = freqData[1] / 255;
//                 this.bassCube.scale.set(1 + bass * 3, 1 + bass * 3, 1 + bass * 3);
//                 this.bassCube.rotation.x += 0.01;
//                 this.bassCube.rotation.y += 0.01;
//                 break;

//             case 'wavegrid':
//                 const positions = this.waveGrid.geometry.attributes.position.array;
//                 for (let i = 0; i < positions.length; i += 3) {
//                     positions[i + 2] = Math.sin(i + Date.now() * 0.002) * (freqData[i % freqData.length] / 255);
//                 }
//                 this.waveGrid.geometry.attributes.position.needsUpdate = true;
//                 break;

//             case 'galaxy':
//                 this.galaxy.rotation.y += 0.002;
//                 const scale = 1 + (freqData[10] / 255) * 2;
//                 this.galaxy.scale.set(scale, scale, scale);
//                 break;
//         }

//         this.renderer.render(this.scene, this.camera);
//     }

//     destroy() {
//         cancelAnimationFrame(this._animationFrame);
//         if (this.renderer.domElement && this.renderer.domElement.parentNode) {
//             this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
//         }

//         // Reactivate 2D canvas if needed
//         const canvas = document.getElementById('visualizer');
//         if (canvas) canvas.style.display = 'block';
//     }
// }

// window.Visualizer3D = Visualizer3D;
