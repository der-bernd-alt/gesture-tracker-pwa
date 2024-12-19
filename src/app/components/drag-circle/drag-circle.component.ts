import { Component, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-drag-circle',
  templateUrl: './drag-circle.component.html',
  styleUrls: ['./drag-circle.component.css']
})
export class DragCircleComponent {
  @ViewChild('circle') circleElement!: ElementRef;
  
  isDragging = false;
  isLoading = false;
  isSuccess = false;
  circlePosition = 0;
  readonly initialValue = 14;
  currentValue = this.initialValue;
  private startY = 0;
  private startPosition = 0;
  private trackHeight = 0;

  constructor(private databaseService: DatabaseService) {}

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    this.startY = clientY;
    this.startPosition = this.circlePosition;
    
    const track = this.circleElement.nativeElement.parentElement.querySelector('.track');
    this.trackHeight = track.offsetHeight;

    const moveHandler = (e: MouseEvent | TouchEvent) => {
      if (this.isDragging) {
        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const delta = this.startY - currentY;
        
        let newPosition = this.startPosition + delta;
        newPosition = Math.max(0, Math.min(newPosition, this.trackHeight));
        
        this.circlePosition = -newPosition;
        
        const percentage = newPosition / this.trackHeight;
        this.currentValue = Math.round(15 + (percentage * 10));
      }
    };

    const stopDrag = () => {
      if (this.isDragging) {
        this.isDragging = false;
        if (this.currentValue !== this.initialValue) {
          this.isLoading = true;
          this.databaseService.addPushUpSet(this.currentValue).subscribe({
            next: () => {
              this.isLoading = false;
              this.isSuccess = true;
              setTimeout(() => {
                this.isSuccess = false;
              }, 1500); // Show checkmark for 1.5 seconds
              console.log('✅ Added new set:', this.currentValue);
            },
            error: (error) => {
              this.isLoading = false;
              console.error('❌ Error adding set:', error);
            }
          });
        }
        this.circlePosition = 0;
      }
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchend', stopDrag);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    if (!('touches' in event)) {
      event.preventDefault();
    }
  }
} 