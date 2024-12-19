import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddPushUpsDialogComponent } from '../add-push-ups-dialog/add-push-ups-dialog.component';
import { DatabaseService } from '../../services/database.service';
import { PushUpSet } from '../../models/push-up-set.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  pushUpSets: PushUpSet[] = [];
  activeView: 'graph' | 'history' = 'graph';
  allowUpdates$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private databaseService: DatabaseService
  ) {
    this.allowUpdates$ = this.databaseService.getAllowUpdates();
  }

  ngOnInit() {
    this.databaseService.getPushUpSets().subscribe((sets: PushUpSet[]) => {
      this.pushUpSets = sets;
    });
  }

  onUpdateToggle(event: MatCheckboxChange) {
    this.databaseService.setAllowUpdates(event.checked);
  }

  openAddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.position = { bottom: '0' };
    dialogConfig.width = '100%';
    dialogConfig.maxWidth = '100%';
    dialogConfig.height = '80vh';
    dialogConfig.panelClass = 'bottom-dialog';
    dialogConfig.enterAnimationDuration = '300ms';
    dialogConfig.exitAnimationDuration = '200ms';

    const dialogRef = this.dialog.open(AddPushUpsDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.databaseService.addPushUpSet(result).subscribe();
      }
    });
  }
} 