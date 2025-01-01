import { Component, Input, OnInit, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { PushUpSet } from '../../models/push-up-set.model';

interface DailyPushUps {
  date: Date;
  totalReps: number;
  sets: PushUpSet[];
}

@Component({
  selector: 'app-text-card',
  templateUrl: './text-card.component.html',
  styleUrls: ['./text-card.component.css']
})
export class TextCardComponent implements OnInit {
  @Input() sets: PushUpSet[] = [];
  dailyPushUps: DailyPushUps[] = [];
  private allDailyPushUps: DailyPushUps[] = [];
  private loadCount: number = 20;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.allDailyPushUps = this.groupSetsByDay(this.sets);
    this.dailyPushUps = this.allDailyPushUps.slice(0, this.loadCount);

    const contentElement = document.querySelector('.content') as HTMLElement;
    if (contentElement) {
      this.renderer.listen(contentElement, 'scroll', () => this.onScroll(contentElement));
    }
  }

  private onScroll(contentElement: HTMLElement): void {
    if ((contentElement.scrollTop + contentElement.clientHeight) >= contentElement.scrollHeight - 300) {
      this.loadMoreDays();
    }
  }

  private loadMoreDays(): void {
    const currentLength = this.dailyPushUps.length;
    const moreDays = this.allDailyPushUps.slice(currentLength, currentLength + this.loadCount);
    this.dailyPushUps = [...this.dailyPushUps, ...moreDays];
  }

  private groupSetsByDay(sets: PushUpSet[]): DailyPushUps[] {
    const grouped = new Map<string, DailyPushUps>();

    sets.forEach(set => {
      const date = new Date(set.time);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString();

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date,
          totalReps: 0,
          sets: []
        });
      }

      const day = grouped.get(dateKey)!;
      day.sets.push(set);
      day.totalReps += set.repetitions;
    });

    return Array.from(grouped.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  formatDate(date: Date): string {
    const weekday = date.toLocaleDateString('de-DE', { weekday: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${weekday} ${day}.${month}.`;
  }

  formatTime(time: string | Date): string {
    const date = new Date(time);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
} 