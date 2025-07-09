import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LatestPlantsComponent } from './latest-plants.component';

import { RouterModule } from '@angular/router';

import { LoaderModule } from '../loader/loader.module';

@NgModule({
  declarations: [
    LatestPlantsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LoaderModule
  ],
  exports: [
    LatestPlantsComponent
  ]
})
export class LatestPlantsModule { }
