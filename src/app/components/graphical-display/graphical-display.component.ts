import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-graphical-display',
  templateUrl: './graphical-display.component.html',
  styleUrls: ['./graphical-display.component.css']
})
export class GraphicalDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private chart?: Chart;
  testValue = 20;

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    // Initialization logic that doesn't require the view
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  private initializeChart() {
    this.databaseService.getPushUpSets().subscribe(sets => {
      if (!sets || sets.length === 0) {
        return;
      }
      if (this.chart) {
        this.chart.destroy();
      }

      // Get today's date
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      // Filter sets to include only today's data
      const todaysSets = sets.filter(set => {
        const setDate = new Date(set.time);
        return setDate >= startOfDay && setDate < endOfDay;
      });

      let halfHourData = [];
      let accumulatedSum = 0; // To keep track of the accumulated sum

      // Initialize half-hour slots
      for (let i = 0; i < 48; i++) { // 48 half-hour slots in a day
        halfHourData[i] = 0; // Initialize each half-hour slot to 0
      }

      for (let i = 0; i < todaysSets.length; i++) {
        let set = todaysSets[i];
        let setDate = new Date(set.time);
        let setHalfHourIndex = setDate.getHours() * 2 + Math.floor(setDate.getMinutes() / 30);
        
        // Accumulate the repetitions for the corresponding half-hour slot
        halfHourData[setHalfHourIndex] += set.repetitions;
      }

      // Calculate accumulated sums
      for (let i = 0; i < halfHourData.length; i++) {
        accumulatedSum += halfHourData[i];
        halfHourData[i] = accumulatedSum; // Update to the accumulated sum
      }

      let labels = [];
      for (let i = 0; i < halfHourData.length; i++) {
        if (i % 2 === 0) {
          labels.push(`${i / 2}:00`);
        } else {
          labels.push(`${Math.floor(i / 2)}:30`);
        }
      }

      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: "",
            data: halfHourData,
            borderColor: 'rgb(105, 105, 105)', // Dark grey color
            tension: 0.1,
            pointRadius: 0 // Do not display points
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          },
          layout: {
            padding: {
              top: 30,
              bottom: 30
            }
          },
          maintainAspectRatio: false, // Adjust the config to take as much space as possible
        }
      });
    });
  }
} 