import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import type * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class ThreeService {
  private three: typeof THREE | null = null;

  async loadThree(): Promise<typeof THREE> {
    if (this.three) {
      return this.three;
    }
    
    const THREE = await import('three');
    this.three = THREE;
    return THREE;
  }

  // Optional: Create methods for specific loaders or controls
  async loadOrbitControls() {
    const THREE = await this.loadThree();
    return await import('three/examples/jsm/controls/OrbitControls').then(
      module => module.OrbitControls
    );
  }
}