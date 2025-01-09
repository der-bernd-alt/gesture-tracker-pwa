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
  private expectedPerDay = 100;

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

  getExpectedValueForInterval(interval: 'today' | 'week' | 'month', mode: "repetitions" | "scale") {
    const additional = 50;
    let days = 1;
    if (interval === 'week') {
      days = 7;
    } else if (interval === 'month') {
      let date = new Date();
      days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    return Math.round(days * (this.expectedPerDay + (mode === "repetitions" ? 0 : additional)));
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
            label: "Actual",
            data: data,
            borderColor: 'darkblue', // Dark blue 
            tension: 0.1,
            pointRadius: 0 // Do not display points
          },
          {
            label: 'Expected',
            data: Array(labels.length).fill(this.getExpectedValueForInterval(this.timeFrame, "repetitions")), // Create a flat line at the expected value
            borderColor: 'darkblue',
            borderDash: [5, 5], // Create a dashed line
            tension: 0,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Current',
            data: Array(labels.length).fill(null).map((_, index) => {
              const now = new Date();
              let currentIndex;
              if (this.timeFrame === 'today') {
                currentIndex = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);
              } else if (this.timeFrame === 'week') {
                currentIndex = (now.getDay() + 6) % 7; // Adjust to start week on Monday
              } else {
                currentIndex = now.getDate() - 1;
              }
              return index === currentIndex ? data[currentIndex] : null;
            }),
            borderColor: 'darkblue',
            backgroundColor: 'white',
            pointRadius: 5,
            pointStyle: 'circle',
            borderWidth: 2,
            order: -1, // This ensures it's drawn on top
            showLine: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: this.getExpectedValueForInterval(this.timeFrame, "scale"), // Set max based on time frame
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
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
              enabled: true,
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (tooltipItem) => {
                  if (tooltipItem.datasetIndex === 0) {
                    return `Bis hier ${tooltipItem.raw} Wdh.`;
                  } else {
                    return `Ziel: ${tooltipItem.raw} Wdh.`;
                  }
                }
              }
            },
            legend: {
              display: false
            }
          }
        }
      });
    });
  }
} 