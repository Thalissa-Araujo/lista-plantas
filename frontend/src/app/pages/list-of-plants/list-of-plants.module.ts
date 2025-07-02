import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PlantListPageRoutingModule } from './list-of-plants.routing.module';

import { PlantListComponent } from './list-of-plants.component';

@NgModule({
  declarations: [
    PlantListComponent,
  ],
  imports: [
    CommonModule,
    PlantListPageRoutingModule
  ]
})

export class PlantListPageModule {}

