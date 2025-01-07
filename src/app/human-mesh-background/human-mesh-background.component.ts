import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-human-mesh-background',
  templateUrl: './human-mesh-background.component.html',
  styleUrls: ['./human-mesh-background.component.css']
})
export class HumanMeshBackgroundComponent implements OnInit {
  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private readonly PARTICLES_PER_JOINT = 700;
  private readonly PARTICLE_SIZE = 0.01;
  private readonly PARTICLE_RADIUS = 0.25;

  ngOnInit(): void {
    this.initThreeJS();
    this.animate();
  }

  private initThreeJS(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Add axis helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // Create joints
    const jointRadius = 0.15;
    const jointMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      metalness: 0.9,
      roughness: 0.1,
      reflectivity: 1.0
    });

    const jointPositions = {
      bodyBuilder: [
        // Head and neck
        [0, 2.2, 0],     // Top of head
        [0, 1.8, 0],     // Neck

        // Torso
        [-0.8, 1.5, 0], [0.8, 1.5, 0],   // Shoulders
        [-0.4, 1.3, 0], [0.4, 1.3, 0],   // Upper chest
        [-0.9, 1.0, 0], [0.9, 1.0, 0],   // Arms upper

        // Arms
        [-1.3, 1.2, 0], [1.3, 1.2, 0],   // Biceps
        [-1.8, 0.9, 0], [1.8, 0.9, 0],   // Elbows
        [-2.2, 0.5, 0], [2.2, 0.5, 0],   // Wrists

        // Core
        [-0.3, 0.7, 0], [0.3, 0.7, 0],   // Upper abs
        [-0.3, 0.3, 0], [0.3, 0.3, 0],   // Lower abs

        // Hips and legs
        [-0.4, 0, 0], [0.4, 0, 0],       // Hips
        [-0.5, -0.5, 0], [0.5, -0.5, 0], // Upper thighs
        [-0.6, -1.0, 0], [0.6, -1.0, 0], // Lower thighs
        [-0.7, -1.5, 0], [0.7, -1.5, 0], // Knees
      ],
      athlete: [
        // Head and neck
        [0, 2.15, 0],     // Top of head
        [0, 1.55, 0],     // Neck

        // Torso and arms
        [-0.5, 1.6, 0], [0.5, 1.6, 0],   // Shoulders
        [-0.7, 1.2, 0], [0.7, 1.2, 0],   // Elbows
        [-0.8, 0.8, 0], [0.8, 0.8, 0],   // Wrists

        // Abs
        [-0.27, 1.2, 0], [0.27, 1.2, 0],       // Upper abs
        [-0.27, 0.8, 0], [0.27, 0.8, 0], // Lower abs
        [-0.27, 0.4, 0], [0.27, 0.4, 0], // Lower abs

        // Hips and legs
        [-0.4, 0.0, 0], [0.4, 0.0, 0], // Upper thighs
        [-0.4, -0.5, 0], [0.4, -0.5, 0], // Lower thighs
        [-0.45, -1.0, 0], [0.45, -1.0, 0], // Feet
        [-0.5, -1.0, 0], [0.5, -1.0, 0]  // Ankles
      ]
    }

    // Create joints and particles
    jointPositions.athlete.forEach(([x, y, z], index) => {
      // Create joint sphere
      let jointRadiusFactor = 1;
      if(index == 0){
        jointRadiusFactor = 2.5;
      }
      const jointGeometry = new THREE.SphereGeometry(jointRadius * jointRadiusFactor, 16, 16);
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      joint.position.set(x, y, z);
      this.scene.add(joint);

      // Add particles around the joint
      this.addParticlesAroundPoint(x, y, z);
    });

    // Add lights for reflection
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    // Add blue spotlight
    const spotLight = new THREE.SpotLight(0x0066ff, 2);
    spotLight.position.set(0, 1.5, 1);
    spotLight.target.position.set(0, 1, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.3;
    spotLight.decay = 1;
    spotLight.distance = 5;
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private addParticlesAroundPoint(x: number, y: number, z: number): void {
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: this.PARTICLE_SIZE,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const positions: number[] = [];

    // Generate random particles around the point
    for (let i = 0; i < this.PARTICLES_PER_JOINT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      const r = Math.random() * this.PARTICLE_RADIUS;

      const px = x + r * Math.sin(phi) * Math.cos(theta);
      const py = y + r * Math.sin(phi) * Math.sin(theta);
      const pz = z + r * Math.cos(phi);

      positions.push(px, py, pz);
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }
} 