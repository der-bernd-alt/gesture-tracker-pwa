import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PushUpSet } from '../models/push-up-set.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private apiUrl = 'http://localhost:3000/api';
  private pushUpSets = new BehaviorSubject<PushUpSet[]>([]);

  constructor(private http: HttpClient) {
    this.loadPushUpSets();
  }

  getPushUpSets(): Observable<PushUpSet[]> {
    return this.pushUpSets.asObservable();
  }

  addPushUpSet(repetitions: number): Observable<PushUpSet> {
    return this.http.post<PushUpSet>(`${this.apiUrl}/push-up-sets`, { repetitions });
  }

  private loadPushUpSets() {
    this.http.get<PushUpSet[]>(`${this.apiUrl}/push-up-sets`)
      .pipe(
        tap(sets => {
          console.log('✅ Successfully loaded push-up sets');
          console.log(`📊 Total sets: ${sets.length}`);
          console.log('📝 Latest 3 sets:', sets.slice(0, 3));
        })
      )
      .subscribe(sets => this.pushUpSets.next(sets));
  }
}