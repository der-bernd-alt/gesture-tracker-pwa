import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-graphical-display',
  templateUrl: './graphical-display.component.html',
  styleUrls: ['./graphical-display.component.css']
})
export class GraphicalDisplayComponent implements OnInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  private chart?: Chart;
  testValue = 20;

  constructor(private databaseService: DatabaseService) {}

  ngOnInit() {
    this.databaseService.getPushUpSets().subscribe(sets => {
      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: sets.map(set => new Date(set.time).toLocaleTimeString()),
          datasets: [{
            label: 'Push-ups',
            data: sets.map(set => set.repetitions),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }
} 