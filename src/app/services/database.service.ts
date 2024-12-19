import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { PushUpSet } from '../models/push-up-set.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = `${'https://fitness-tracker-api-ten.vercel.app'}/api`;
  private pushUpSets = new BehaviorSubject<PushUpSet[]>([]);
  private allowUpdates = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) {
    this.loadPushUpSets();
  }

  getPushUpSets(): Observable<PushUpSet[]> {
    return this.pushUpSets.asObservable();
  }


  setAllowUpdates(allow: boolean) {
    this.allowUpdates.next(allow);
  }

  getAllowUpdates(): Observable<boolean> {
    return this.allowUpdates.asObservable();
  }

  addPushUpSet(repetitions: number): Observable<PushUpSet> {
    if (!this.allowUpdates.value) {
      console.log('Updates are disabled');
      return of({ id: 0, repetitions, time: new Date() } as PushUpSet);
    }

    return this.http.post<PushUpSet>(`${this.apiUrl}/push-up-sets`, { repetitions })
      .pipe(
        tap(newSet => {
          const currentSets = this.pushUpSets.value;
          this.pushUpSets.next([newSet, ...currentSets]);
        })
      );
  }

  private loadPushUpSets(returnAll: boolean = false) {
    const params = returnAll ? { return_all: 'true' } : { return_all: 'false' };

    this.http.get<PushUpSet[]>(`${this.apiUrl}/push-up-sets`, { params })
      .pipe(
        tap(sets => {
          console.log(`✅ Successfully loaded push-up sets (${returnAll ? 'all time' : 'past 90 days'})`);
          console.log(`📊 Total sets: ${sets.length}`);
          console.log('📝 Latest 3 sets:', sets.slice(0, 3));
        })
      )
      .subscribe(sets => this.pushUpSets.next(sets));
  }

  loadAllPushUpSets() {
    this.loadPushUpSets(true);
  }
}