import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlantListPageRoutingModule } from './list-of-plants.routing.module';

import { PlantListComponent } from './list-of-plants.component';
import { LatestPlantsModule } from '../../components/latest-plants/latest-plants.module';

@NgModule({
  declarations: [
    PlantListComponent,
  ],
  imports: [
    CommonModule,
    PlantListPageRoutingModule,
    LatestPlantsModule
  ]
})

export class PlantListPageModule {}

