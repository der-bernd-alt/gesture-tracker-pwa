import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-vertical-slider',
  template: `
    <div class="slider-container">
      <div class="preview">{{ value }}</div>
      <div class="slider-track" #track (click)="onTrackClick($event)">
        <div class="slider-line"></div>
        <div class="slider-thumb" 
             [style.bottom.%]="thumbPosition"
             (mousedown)="startDragging($event)"
             (touchstart)="startDragging($event)">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .slider-container {
      height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 0;
    }

    .preview {
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .slider-track {
      height: 100%;
      width: 60px;
      position: relative;
      cursor: pointer;
    }

    .slider-line {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 100%;
      background-color: #e0e0e0;
    }

    .slider-thumb {
      position: absolute;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: #1976d2;
      cursor: grab;
      transition: background-color 0.2s;
    }

    .slider-thumb:hover {
      background-color: #1565c0;
    }

    .slider-thumb:active {
      cursor: grabbing;
    }
  `]
})
export class VerticalSliderComponent {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() value = 50;
  @Output() valueChange = new EventEmitter<number>();

  private isDragging = false;

  get thumbPosition(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  startDragging(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDragging = true;

    const moveHandler = (e: MouseEvent | TouchEvent) => {
      if (this.isDragging) {
        const track = (event.target as HTMLElement).parentElement!;
        const rect = track.getBoundingClientRect();
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        let percentage = (rect.bottom - clientY) / rect.height;
        percentage = Math.max(0, Math.min(1, percentage));
        
        const newValue = this.min + (this.max - this.min) * percentage;
        const steppedValue = Math.round(newValue / this.step) * this.step;
        const clampedValue = Math.min(Math.max(steppedValue, this.min), this.max);
        
        if (clampedValue !== this.value) {
          this.value = clampedValue;
          this.valueChange.emit(this.value);
        }
      }
    };

    const stopDragging = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchend', stopDragging);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);
  }

  onTrackClick(event: MouseEvent) {
    const track = event.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const percentage = (rect.bottom - event.clientY) / rect.height;
    
    const newValue = this.min + (this.max - this.min) * percentage;
    const steppedValue = Math.round(newValue / this.step) * this.step;
    this.value = Math.min(Math.max(steppedValue, this.min), this.max);
    this.valueChange.emit(this.value);
  }
} 