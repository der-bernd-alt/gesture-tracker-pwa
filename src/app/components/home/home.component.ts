import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { PushUpSet } from '../../models/push-up-set.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  pushUpSets: PushUpSet[] = [];

  constructor(private dbService: DatabaseService) {}

  ngOnInit() {
    this.dbService.getPushUpSets().subscribe((sets: PushUpSet[]) => {
      this.pushUpSets = sets;
    });
  }
} 