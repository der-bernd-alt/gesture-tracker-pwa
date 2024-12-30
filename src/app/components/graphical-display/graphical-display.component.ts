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
  timeFrame: 'today' | 'week' | 'month' = 'today';

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    // Initialization logic that doesn't require the view
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  setTimeFrame(frame: 'today' | 'week' | 'month') {
    this.timeFrame = frame;
    this.initializeChart(); // Re-initialize the chart with the new time frame
  }

  private initializeChart() {
    this.databaseService.getPushUpSets().subscribe(sets => {
      if (!sets || sets.length === 0) {
        return;
      }
      if (this.chart) {
        this.chart.destroy();
      }

      // Get date range based on the selected time frame
      const today = new Date();
      let startOfRange: Date;
      let endOfRange: Date;

      if (this.timeFrame === 'today') {
        startOfRange = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endOfRange = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      } else if (this.timeFrame === 'week') {
        startOfRange = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        endOfRange = new Date(startOfRange);
        endOfRange.setDate(endOfRange.getDate() + 7);
      } else { // 'month'
        startOfRange = new Date(today.getFullYear(), today.getMonth(), 1);
        endOfRange = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      }

      // Filter sets to include only the selected time frame's data
      const filteredSets = sets.filter(set => {
        const setDate = new Date(set.time);
        return setDate >= startOfRange && setDate < endOfRange;
      });

      let labels: string[] = [];
      let data: number[] = [];
      if (this.timeFrame === 'today') {
        // Initialize half-hour slots for today
        labels = [];
        for (let i = 0; i < 48; i++) { // 48 half-hour slots in a day
          if (i % 2 === 0) {
            labels.push(`${i / 2}:00`);
          } else {
            labels.push(`${Math.floor(i / 2)}:30`);
          }
          data[i] = 0;
        }

        filteredSets.forEach(set => {
          const setDate = new Date(set.time);
          const index = setDate.getHours() * 2 + Math.floor(setDate.getMinutes() / 30);
          data[index] += set.repetitions;
        });

        // Calculate accumulated sums
        let accumulatedSum = 0;
        for (let i = 0; i < data.length; i++) {
          accumulatedSum += data[i];
          data[i] = accumulatedSum;
        }
      } else if (this.timeFrame === 'week') {
        // Initialize day slots for the week, each day split into two halves
        labels = [];
        data = Array(14).fill(0); // 7 days * 2
        for (let i = 0; i < 7; i++) {
          labels.push(`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]} AM`);
          labels.push(`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]} PM`);
        }

        filteredSets.forEach(set => {
          const setDate = new Date(set.time);
          const day = setDate.getDay();
          const half = setDate.getHours() < 12 ? 0 : 1;
          const index = day * 2 + half;
          data[index] += set.repetitions;
        });

        // Calculate accumulated sums
        let accumulatedSum = 0;
        for (let i = 0; i < data.length; i++) {
          accumulatedSum += data[i];
          data[i] = accumulatedSum;
        }
      } else { // 'month'
        // Initialize day slots for the month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        labels = [];
        data = Array(daysInMonth).fill(0);
        for (let i = 1; i <= daysInMonth; i++) {
          labels.push(`Day ${i}`);
        }

        filteredSets.forEach(set => {
          const setDate = new Date(set.time);
          const day = setDate.getDate();
          const index = day - 1;
          data[index] += set.repetitions;
        });

        // Calculate accumulated sums
        let accumulatedSum = 0;
        for (let i = 0; i < data.length; i++) {
          accumulatedSum += data[i];
          data[i] = accumulatedSum;
        }
      }

      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: "",
            data: data,
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
          maintainAspectRatio: false,
        }
      });
    });
  }
} 