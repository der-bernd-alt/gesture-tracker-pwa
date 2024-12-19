import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-push-ups-dialog',
  template: `
    <div class="dialog-content">
      <button mat-icon-button class="close-button" (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="value-display">{{ currentValue }}</div>
      
      <div class="slider-container">
        <mat-slider
          vertical
          min="15"
          max="25"
          step="1"
          showTickMarks
          discrete>
          <input matSliderThumb [(ngModel)]="currentValue">
        </mat-slider>
      </div>

      <button mat-raised-button 
              color="primary" 
              class="save-button"
              (click)="save()">
        {{ currentValue }} Wiederholungen speichern
      </button>
    </div>
  `,
  styles: [`
    .dialog-content {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      position: relative;
      height: 100%;
    }

    .close-button {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .value-display {
      font-size: 48px;
      margin-top: 24px;
    }

    .slider-container {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }

    mat-slider {
      height: 300px;
    }

    .save-button {
      width: 100%;
      height: 50px;
      font-size: 18px;
    }
  `]
})
export class AddPushUpsDialogComponent {
  currentValue = 20;

  constructor(public dialogRef: MatDialogRef<AddPushUpsDialogComponent>) {}

  save() {
    this.dialogRef.close(this.currentValue);
  }
} 