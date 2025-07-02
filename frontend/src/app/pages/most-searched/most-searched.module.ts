import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MostSearchedPageRoutingModule } from './most-searched.routing.module';

import { MostSearchedComponent } from './most-searched.component';
import { LatestPlantsModule } from 'src/app/components/latest-plants/latest-plants.module';
import { LoaderModule } from 'src/app/components/loader/loader.module';

@NgModule({
  declarations: [
    MostSearchedComponent
  ],
  imports: [
    CommonModule,
    LatestPlantsModule,
    MostSearchedPageRoutingModule,
    LoaderModule
  ],
  exports: [
    MostSearchedComponent
  ]
})

export class MostSearchedPageModule {}

