import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlantListComponent } from './list-of-plants.component';

const routes: Routes = [
  {
    path: '',
    component: PlantListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class PlantListPageRoutingModule {}
