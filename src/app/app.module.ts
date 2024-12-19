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

Chart.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { GraphicalDisplayComponent } from './components/graphical-display/graphical-display.component';
import { TextCardComponent } from './components/text-card/text-card.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GraphicalDisplayComponent,
    TextCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatCardModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
