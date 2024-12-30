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

  getExpectedValueForInterval(interval: 'today' | 'week' | 'month') {
    let days = 1;
    const expectedPerDay = 100, additional = 50
    if (interval === 'week') {
      days = 7;
    } else if (interval === 'month') {
      let date = new Date();
      days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    return Math.round(days * (expectedPerDay + additional));
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
            labels.push(`${i / 2} Uhr`);
          } else {
            labels.push(`${Math.floor(i / 2)}:30 Uhr`);
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
        // Initialize day slots for the week, each day represented once
        labels = [];
        data = Array(7).fill(0); // 7 days
        for (let i = 0; i < 7; i++) {
          labels.push(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i]);
        }

        filteredSets.forEach(set => {
          const setDate = new Date(set.time);
          const day = (setDate.getDay() + 6) % 7; // Adjust to start week on Monday
          data[day] += set.repetitions;
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
            borderColor: 'darkblue', // Dark blue color
            tension: 0.1,
            pointRadius: 0 // Do not display points
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: this.getExpectedValueForInterval(this.timeFrame) // Set max based on time frame
            }
          },
          layout: {
            padding: {
              top: 30,
              bottom: 30
            }
          },
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              enabled: true, // Enable tooltips
              mode: 'index', // Show tooltip for the index of the clicked point
              intersect: false, // Allow tooltips to show when hovering over the chart
              callbacks: {
                label: (tooltipItem) => {
                  // Add " Uhr" suffix only for the 'today' time frame
                  return `Bis hier ${tooltipItem.raw} Wdh.`; // Customize tooltip label
                }
              }
            },
            legend: {
              display: false // Do not show the legend
            }
          }
        }
      });
    });
  }
} 