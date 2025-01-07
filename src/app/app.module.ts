import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js';
import { TimeScale } from 'chart.js';
import { LinearScale } from 'chart.js';
import { PointElement } from 'chart.js';
import { LineElement } from 'chart.js';
import { Title } from 'chart.js';
import { Legend } from 'chart.js';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { GraphicalDisplayComponent } from './components/graphical-display/graphical-display.component';
import { TextCardComponent } from './components/text-card/text-card.component';
import { AddPushUpsDialogComponent } from './components/add-push-ups-dialog/add-push-ups-dialog.component';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { DragCircleComponent } from './components/drag-circle/drag-circle.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HumanMeshBackgroundComponent } from './human-mesh-background/human-mesh-background.component';

Chart.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GraphicalDisplayComponent,
    TextCardComponent,
    AddPushUpsDialogComponent,
    DragCircleComponent,
    HumanMeshBackgroundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatCardModule,
    HttpClientModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
