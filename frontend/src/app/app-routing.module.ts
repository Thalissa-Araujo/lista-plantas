import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'breed-list',
    loadChildren: () => import('./pages/breed-list/breed-list.module').then((m) => m.BreedListPageModule),
  },
  //{
  //  path: 'favorites',
  //  loadChildren: () => import('./pages/favorites/favorites.module').then((m) => m.FavoritesPageModule),
  //},
  {
    path: ':id',
    loadChildren: () => import('./pages/plants/plants.module').then(m => m.PlantsModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantsRoutingModule {}
;

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }