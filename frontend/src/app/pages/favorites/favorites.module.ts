import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderModule } from '../../components/loader/loader.module';

import { FavoritesComponent } from './favorites.component';
import { FavoritesRoutingModule } from './favorites-routing.module';

@NgModule({
  declarations: [FavoritesComponent],
  imports: [
    CommonModule,
    LoaderModule,
    FavoritesRoutingModule
  ],
  exports: []
})
export class FavoritesModule {}
