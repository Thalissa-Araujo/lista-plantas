import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then((m) => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'list-of-plants',
    loadChildren: () => import('./pages/list-of-plants/list-of-plants.module').then((m) => m.PlantListPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./pages/cadastro/cadastro.module').then(m => m.CadastroModule)
  },
  {
    path: 'add-plant',
    loadChildren: () => import('./pages/add-plant/add-plant.module').then(m => {
      console.log('Módulo AddPlant carregado com sucesso!', m);
      return m.AddPlantModule;
    }).catch(err => {
      console.error('Erro ao carregar módulo:', err);
      throw err;
    }),
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadChildren: () => import('./pages/plants/plants.module').then(m => m.PlantsModule)
  },
  {
    path: 'favorites',
    loadChildren: () => import('./pages/favorites/favorites.module').then(m => {
      console.log('Módulo Favorites carregado com sucesso!', m);
      return m.FavoritesModule;
    }).catch(err => {
      console.error('Erro ao carregar módulo:', err);
      throw err;
    }),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
