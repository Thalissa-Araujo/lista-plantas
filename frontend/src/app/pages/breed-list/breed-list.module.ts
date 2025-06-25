import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BreedListPageRoutingModule } from './breed-list.routing.module';

import { BreedListComponent } from './breed-list.component';

@NgModule({
  declarations: [
    BreedListComponent,
  ],
  imports: [
    CommonModule,
    BreedListPageRoutingModule
  ]
})

export class BreedListPageModule {}

