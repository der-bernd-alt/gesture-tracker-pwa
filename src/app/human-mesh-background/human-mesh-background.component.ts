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
  private readonly CUBOID_PARTICLES = 2000;
  private readonly SHOW_AXIS_HELPER = false;
  private readonly IS_CAMERA_MOVING = true;

  // Animation parameters
  private readonly radius = 5; // Same as initial camera.position.z
  private readonly rotationSpeed = 0.5; // Rotations per second
  private angle = 0;
  private staticSpotLight!: THREE.SpotLight;
  private movingSpotLight!: THREE.SpotLight;

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
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.y = 4
    this.camera.position.z = 5;
    this.camera.lookAt(0, 3, 0);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Add axis helper
    if (this.SHOW_AXIS_HELPER) {
      const axesHelper = new THREE.AxesHelper(5);
      this.scene.add(axesHelper);
    }

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
        [0, 2.1, 0],     // Top of head
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
      if (index == 0) {
        jointRadiusFactor = 1.8;
      }
      const jointGeometry = new THREE.SphereGeometry(jointRadius * jointRadiusFactor, 16, 16);
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      joint.position.set(x, y, z);
      this.scene.add(joint);

      // Add particles around the joint
      this.addParticlesAroundPoint(x, y, z, jointRadiusFactor);
    });

    // Add lights for reflection
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    // Add spot light
    const staticSpotLight = new THREE.SpotLight(0x00ffff, 4);
    staticSpotLight.position.set(0, 1.5, 1);
    staticSpotLight.target.position.set(0, 1, 0);
    staticSpotLight.angle = Math.PI / 4;
    staticSpotLight.penumbra = 0.3;
    staticSpotLight.decay = 1;
    staticSpotLight.distance = 5;
    this.scene.add(staticSpotLight);
    this.scene.add(staticSpotLight.target);
    this.staticSpotLight = staticSpotLight;

    const movingSpotLight = new THREE.SpotLight(0xffffff, 10);
    movingSpotLight.position.set(0, 1.5, 1);
    movingSpotLight.target.position.set(0, 1, 0);
    movingSpotLight.angle = Math.PI / 2;
    movingSpotLight.penumbra = 0.3;
    movingSpotLight.decay = 1;
    movingSpotLight.distance = 5;
    this.scene.add(movingSpotLight);
    this.scene.add(movingSpotLight.target);
    this.movingSpotLight = movingSpotLight;

    // Add text plane (add this before the particle cuboid)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      canvas.width = 50;
      canvas.height = 25;
      
      // Set background transparent
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      context.font = 'bold 9px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('#TEAM', 25, 6);
      context.fillText('BERND', 25, 20);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const geometry = new THREE.PlaneGeometry(0.4, 0.4);
      const textPlane = new THREE.Mesh(geometry, material);
      textPlane.position.set( 0, 1.5, 0.3); // Position in front of the chest
      textPlane.rotation.x = -0.2; // Slight tilt
      this.scene.add(textPlane);
    }

    // Add particle cuboid after other elements
    this.addParticleCuboid(
      { x: -5, y: -3, z: -3 },    // min bounds
      { x: 5, y: 5, z: 3 },      // max bounds
      this.CUBOID_PARTICLES / 3,
      new THREE.Color(0x0066ff)
    );
    this.addParticleCuboid(
      { x: -5, y: -3, z: -3 },    // min bounds
      { x: 5, y: 5, z: 3 },      // max bounds
      this.CUBOID_PARTICLES,
      new THREE.Color(0xffffff)
    );

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

    // Update camera position
    if (this.IS_CAMERA_MOVING) {
      this.camera.position.x = this.radius * Math.cos(this.angle);
      this.camera.position.z = this.radius * Math.sin(this.angle);
      this.angle += this.rotationSpeed * 0.005;
    }

    // Update spot light position
    this.movingSpotLight.position.x = this.radius * Math.cos(this.angle);
    this.movingSpotLight.position.z = this.radius * Math.sin(this.angle);
  }

  private addParticlesAroundPoint(x: number, y: number, z: number, jointRadiusFactor: number): void {
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
      const r = Math.random() * this.PARTICLE_RADIUS * jointRadiusFactor;

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

  private addParticleCuboid(
    min: { x: number; y: number; z: number },
    max: { x: number; y: number; z: number },
    particleCount: number,
    color: THREE.Color
  ): void {
    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      color: color,
      size: 0.01,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true
    });

    const positions: number[] = [];

    // Generate random particles within the cuboid bounds
    for (let i = 0; i < particleCount; i++) {
      const x = min.x + Math.random() * (max.x - min.x);
      const y = min.y + Math.random() * (max.y - min.y);
      const z = min.z + Math.random() * (max.z - min.z);

      positions.push(x, y, z);
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }
} 