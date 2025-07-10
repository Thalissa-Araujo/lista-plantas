import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantDetailComponent } from './plant-detail.component';
import { PlantsRoutingModule } from './plants.routing.module';
import { LoaderModule } from '../../components/loader/loader.module';

@NgModule({
  declarations: [PlantDetailComponent],
  imports: [
    CommonModule,
    PlantsRoutingModule,
    LoaderModule
  ]
})
export class PlantsModule {}