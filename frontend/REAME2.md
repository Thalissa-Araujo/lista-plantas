# Backend

### Pasta app

path: /home/thalissa/lista-plantas/lista-plantas/backend/plant-api-backend/app

### Pasta Http

path: /home/thalissa/lista-plantas/lista-plantas/backend/plant-api-backend/app/Http

### Pasta Controllers

path: /home/thalissa/lista-plantas/lista-plantas/backend/plant-api-backend/app/Http/Controllers

AuthController.php

`````````````````````php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Aqui você pode implementar tokens JWT ou Sanctum se quiser
        return response()->json([
            'message' => 'Login successful',
            'user' => $user
        ]);
    }
}
```````````````````````````````

Controller.php

````````````````php
<?php

namespace App\Http\Controllers;

abstract class Controller
{
    //
}
```````````````````````````````

PlantController.php

`````````````````````php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Plant;
use Illuminate\Support\Facades\Storage;

class PlantController extends Controller
{
    private $trefleToken;
    private $baseUrl = 'https://trefle.io/api/v1/';

    public function __construct()
    {
        $this->trefleToken = env('TREFLE_TOKEN');
    }

    public function searchPlants($query)
    {
        $response = Http::get($this->baseUrl . 'plants/search', [
            'token' => $this->trefleToken,
            'q' => $query
        ]);

        return response()->json($response->json());
    }

    public function getPlant($id)
    {
        // Primeiro verifica se é uma planta local
        $localPlant = Plant::find($id);
        
        if ($localPlant) {
            return response()->json([
                'data' => $localPlant,
                'source' => 'local'
            ]);
        }

        // Se não for local, busca na API Trefle
        $response = Http::get($this->baseUrl . 'plants/' . $id, [
            'token' => $this->trefleToken
        ]);

        if ($response->successful()) {
            return response()->json([
                'data' => $response->json(),
                'source' => 'trefle'
            ]);
        }

        return response()->json([
            'message' => 'Planta não encontrada'
        ], 404);
    }

    public function listPlants($page = 1, $perPage = 30)
    {
        // Combina plantas locais e da API
        $localPlants = Plant::latest()
            ->paginate($perPage, ['*'], 'local_page', $page);

        $trefleResponse = Http::get($this->baseUrl . 'plants', [
            'token' => $this->trefleToken,
            'page' => $page,
            'per_page' => $perPage
        ]);

        return response()->json([
            'local_plants' => $localPlants,
            'trefle_plants' => $trefleResponse->successful() ? $trefleResponse->json() : []
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'common_name' => 'required|string|max:255',
            'scientific_name' => 'required|string|max:255',
            'family' => 'required|string|max:255',
            'genus' => 'required|string|max:255',
            'observations' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'synonyms' => 'nullable|array',
            'synonyms.*' => 'string|max:255'
        ]);

        try {
            $imagePath = $request->file('image')->store('plants', 'public');
            
            $plant = Plant::create([
                'common_name' => $validated['common_name'],
                'scientific_name' => $validated['scientific_name'],
                'family' => $validated['family'],
                'genus' => $validated['genus'],
                'observations' => $validated['observations'],
                'image_url' => Storage::url($imagePath), // Forma mais segura de gerar a URL
                'synonyms' => $validated['synonyms'] ?? [],
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $plant,
                'message' => 'Planta cadastrada com sucesso!'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao cadastrar planta: ' . $e->getMessage()
            ], 500);
        }
    }
}
```````````````````````````````

### Pasta Models

Plant.php

`````````````````````php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    //
}
```````````````````````````````

# Pasta src
 
path: /home/thalissa/lista-plantas/lista-plantas/frontend/src

### Pasta enviroments

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/environments

environment.prod.ts

```````````````typescript
export const environment = {
  production: true,
  apiUrl: 'https://angular-tailwind-bff.vercel.app'
};
``````````````````````````````

environment.ts

```````````````````typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api' // URL do backend Laravel
};
````````````````````````````````````
-----------------------------------------------------------------------

## Pasta app

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app

app-routing.module.ts

``````````````````typescript
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
    path: ':id',
    loadChildren: () => import('./pages/plants/plants.module').then(m => m.PlantsModule)
  },
  {
    path: 'add-plant',
    loadChildren: () => import('./pages/add-plant/add-plant.module').then(m => m.AddPlantModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'favorites',
    loadChildren: () => import('./pages/favorites/favorites.module').then(m => m.FavoritesModule),
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
``````````````````````````````````

app.component.html

```````````````````````html
<div class="min-h-full">

  <ng-container *ngIf="!isAuthPage()">
    <app-menu [offsetMenu]="emitMenu" (offsetMenuEvent)="getEmit($event)"></app-menu>

    <div class="lg:pl-64 flex flex-col flex-1">
      <app-header (offsetMenuEvent)="getEmit($event)"></app-header>

      <main class="flex-1 p-12">
        <app-latest-plants></app-latest-plants>
        <router-outlet></router-outlet>
      </main>
    </div>
  </ng-container>

  <ng-container *ngIf="isAuthPage()">
    <router-outlet></router-outlet>
  </ng-container>

</div>
````````````````````````````````````````

app.component.spec.ts

```````````````````typescript
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('frontend');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('frontend app is running!');
  });
});
````````````````````````````````

app.component.ts

```````````````````````typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  emitMenu = false;

  constructor(public router: Router) {}

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/cadastro';
  }

  getEmit(value: boolean) {
    this.emitMenu = value;
  }
}
````````````````````````````````````

app.module.ts

````````````````````typescript
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { LoaderModule } from './components/loader/loader.module';
import { CadastroModule } from './pages/cadastro/cadastro.module';
import { LoginModule } from './pages/login/login.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LoaderModule,
    AppRoutingModule,
    ComponentsModule,
    //LatestPlantsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    LoaderModule,
    // Angular Material Modules
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ClipboardModule,
    CadastroModule,
    LoginModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
``````````````````````````````````````

auth.guard.spec.ts

``````````````````````````typescript
import { TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
``````````````````````````````````````````

auth.guard.ts

```````````````````````typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../app/services/auth/auth.service'; // ajuste o caminho conforme seu projeto

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
```````````````````````````````````````
---------------------------------

### Pasta components

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/components

components.module.ts

`````````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms"
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './menu/menu.component';

import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    MenuComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    MenuComponent,
  ]
})
export class ComponentsModule { }
````````````````````````````````````

-----------------------------------------------------------------------

### Pasta header

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/components/header

header.component.html

```````````````html
<div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none shadow-lg">
  <button type="button" class="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden" (click)="offsetMenu = !offsetMenu; onMenu(offsetMenu)">
    <span class="sr-only">Open sidebar</span>

    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  </button>

  <div class="flex-1 px-4 flex justify-between sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
    <div class="flex-1 flex">
      <form class="w-full flex md:ml-0" action="#" method="GET">
        <label for="search-field" class="sr-only">Search</label>

        <div class="relative w-full text-gray-400 focus-within:text-gray-600">
          <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none" aria-hidden="true">

            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>

          <input id="search-field" name="search-field" class="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent sm:text-sm" [(ngModel)]="enteredSearchValue" placeholder="Pesquise sua planta" (ngModelChange)="onSearchChange()" (blur)="outSearch()" type="search">

          <div *ngIf="showResults">
            <ul *ngIf="showSuggested" class="bg-white text-gray-700 border mt-[-10px] rounded-lg shadow-lg absolute py-2" style="min-width: 15rem;">
              <li *ngFor="let plant of suggestedPlants">
                <a href="/plant/{{plant.id}}" (click)="closeSearch()" class="block hover:bg-gray-100 whitespace-no-wrap py-2 px-4">
                  {{plant.name}}
                </a>
              </li>
            </ul>

            <ul *ngIf="!showSuggested" class="bg-white text-gray-700 border mt-[-10px] rounded-lg shadow-lg absolute py-2" style="min-width: 15rem;">
              <li class="block bg-gray-100  whitespace-no-wrap py-2 px-4">
                Nenhum resultado encontrado!
              </li>
            </ul>
          </div>
        </div>
      </form>
    </div>

    <div class="ml-4 flex items-center md:ml-6">
      <!-- ... -->
    </div>
  </div>
</div>
``````````````````````````````````````````````````````````

header.component.spec.ts

```````````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
``````````````````````````````````

header.component.ts

`````````````````````````typescript
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PlantService } from 'src/app/services/plant/plant.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() offsetMenuEvent: EventEmitter<boolean> = new EventEmitter();
  offsetMenu = false;

  enteredSearchValue: string = '';
  showSuggested: boolean = false;
  showResults: boolean = false;
  suggestedPlants: any = [];

  constructor(private plantService: PlantService) { }

  ngOnInit(): void {}

  onMenu(val: boolean): void {
    this.offsetMenuEvent.emit(val);
    this.offsetMenu = !this.offsetMenu;
  }

  closeSearch(): void {
    this.showResults = false;
    this.enteredSearchValue = '';
    this.suggestedPlants = [];
  }

  outSearch(): void {
    setTimeout(() => {
      this.closeSearch();
    }, 200);
  }

  onSearchChange(): void {
    if (this.enteredSearchValue !== '') {
      this.showResults = true;
      this.plantService.searchPlants(this.enteredSearchValue).subscribe({
        next: (data) => {
          this.suggestedPlants = data;
          this.showSuggested = this.suggestedPlants.length > 0;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.suggestedPlants = [];
          this.showSuggested = false;
        }
      });
    } else {
      this.showResults = false;
      this.suggestedPlants = [];
    }
  }
}
````````````````````````````````````````

### Pasta latest-plants

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/components/latest-plants

latest-plants.component.html

``````````````````````````````html
<app-loader *ngIf="showLoader"></app-loader>

<div *ngIf="!showLoader" class="relative grid gap-6 bg-cover sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
  <a *ngFor="let plant of plants" 
     [routerLink]="['/plants', plant.id]" 
     class="relative flex flex-col items-center justify-center p-6 space-y-4 overflow-hidden transition-shadow duration-100 bg-cover shadow-xl rounded-2xl group hover:shadow-2xl">
     
    <div class="absolute inset-0">
      <div class="absolute bottom-0 left-0 z-10 opacity-30 bg-gradient-to-b from-transparent to-gray-900"></div>
      <img class="absolute inset-0 object-cover transition duration-500 opacity-100 group-hover:opacity-70 group-hover:scale-125" 
           [src]="plant.image_url || plant.default_image?.regular_url" 
           [alt]="plant.common_name" 
           loading="lazy">
    </div>

    <div class="relative z-10 flex flex-col items-center justify-center w-full">
      <h4 class="text-2xl font-bold text-gray-100 drop-shadow-[0_1.3px_1.3px_rgba(0,0,0,0.8)]">
        {{plant.common_name || 'Unknown Plant'}}
      </h4>
    </div>
  </a>
</div>
``````````````````````````````````````````

latest-plants.component.spec.ts

```````````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestPlantsComponent } from './latest-plants.component';

describe('LatestPlantsComponent', () => {
  let component: LatestPlantsComponent;
  let fixture: ComponentFixture<LatestPlantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatestPlantsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatestPlantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`````````````````````````````````````````````

latest-plants.component.ts

```````````````````````typescript
import { Component, OnInit, Input } from '@angular/core';
import { PlantService } from 'src/app/services/plant/plant.service';

@Component({
  selector: 'app-latest-plants',
  templateUrl: './latest-plants.component.html'
})
export class LatestPlantsComponent implements OnInit {
  plants: any[] = [];
  showLoader: boolean = true;

  @Input() limit: number = 10;

  constructor(private plantService: PlantService) { }

  ngOnInit(): void {
    this.loadPlants();
  }

  loadPlants(): void {
    this.showLoader = true;
    this.plantService.getPlants(this.limit).subscribe({
      next: (data) => {
        this.plants = data?.data || data || [];
        this.showLoader = false;
      },
      error: (err) => {
        console.error('Error loading plants:', err);
        this.showLoader = false;
      }
    });
  }
}
```````````````````````````````````````````

latest-plants.module.ts

`````````````````````typescript
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
`````````````````````````````````````````

### Pasta loader

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/components/loader

loader.component.html

````````````````````````html
<div class="flex justify-center items-center">
  <div aria-label="Loading..." role="status">
    <svg class="h-12 w-12 animate-spin" viewBox="3 3 18 18">
      <path
        class="fill-gray-200"
        d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"></path>
      <path
        class="fill-gray-800"
        d="M16.9497 7.05015C14.2161 4.31648 9.78392 4.31648 7.05025 7.05015C6.65973 7.44067 6.02656 7.44067 5.63604 7.05015C5.24551 6.65962 5.24551 6.02646 5.63604 5.63593C9.15076 2.12121 14.8492 2.12121 18.364 5.63593C18.7545 6.02646 18.7545 6.65962 18.364 7.05015C17.9734 7.44067 17.3403 7.44067 16.9497 7.05015Z"></path>
    </svg>
  </div>
</div>
``````````````````````````````````````

loader.component.spec.ts

`````````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`````````````````````````````````````````````

loader.component.ts

````````````````````````typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-loader', 
  templateUrl: './loader.component.html'
})
export class LoaderComponent {}
`````````````````````````````````````````

loader.module.ts

```````````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader.component';

import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    LoaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    LoaderComponent
  ]
})
export class LoaderModule { }
`````````````````````````````````````````

### Pasta menu

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/components/menu

menu.component.html

````````````````````````````html
<!-- Off-canvas menu para mobile -->
<!-- Menu lateral mobile -->
<div class="fixed inset-0 flex z-40 lg:hidden transition ease-in-out duration-700 transform -translate-x-full" [ngClass]="{'translate-x-0': offsetMenu}" role="dialog" aria-modal="true">

  <!-- Fundo escurecido -->
  <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" [ngClass]="{'opacity-100': offsetMenu}" aria-hidden="true"></div>

  <!-- Menu lateral -->
  <div class="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-[#2D9263] transition-transform duration-500" [ngClass]="{'translate-x-0': offsetMenu}">
    
    <!-- Botão fechar -->
    <div class="absolute top-0 right-0 -mr-12 pt-2">
      <button type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" (click)="offsetMenu = !offsetMenu; onMenu(offsetMenu)">
        <span class="sr-only">Fechar</span>
        <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Logo -->
    <div class="flex items-center px-4">
      <h2 class="font-bold text-[#021D11] text-2xl">Plantarium</h2>
    </div>

    <!-- Navegação -->
    <nav class="mt-5 h-full divide-y divide-[#2D9263] overflow-y-auto" aria-label="Sidebar">
      <div class="px-2 space-y-1">
        <a *ngFor="let item of sideMenu"
           [routerLink]="item.url"
           routerLinkActive="bg-[#2D9263]"
           [routerLinkActiveOptions]="{exact:true}"
           (click)="offsetMenu = false; onMenu(offsetMenu)"
           [innerHTML]="getSVGImage(item.icon)"
           class="text-[#021D11] hover:text-white hover:bg-[#2D9263] group flex items-center px-2 py-2 text-lg leading-6 font-medium rounded-md"
           [attr.title]="item.title">
        </a>
      </div>

      <!-- Login/Logout -->
      <div class="px-2 mt-6 space-y-1">
        <a *ngIf="isLoggedIn" (click)="logout()" class="cursor-pointer flex items-center px-2 py-2 text-sm font-medium text-[#021D11] hover:text-white hover:bg-[#2D9263] rounded-md">
          <svg class="mr-4 h-6 w-6 text-[#021D11]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </a>
        <a *ngIf="!isLoggedIn" routerLink="/login" class="flex items-center px-2 py-2 text-sm font-medium text-[#021D11] hover:text-white hover:bg-[#2D9263] rounded-md">
          <svg class="mr-4 h-6 w-6 text-[#021D11]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Entrar
        </a>
      </div>
    </nav>
  </div>
</div>

<!-- Menu lateral desktop -->
<div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#2D9263]">
  <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
    <div class="flex items-center px-4">
      <h2 class="font-bold text-[#021D11] text-3xl">Plantarium</h2>
    </div>

    <nav class="mt-5 flex-1 flex flex-col divide-y divide-[#2D9263] overflow-y-auto" aria-label="Sidebar">
      <div class="px-2 space-y-1">
        <a *ngFor="let item of sideMenu"
           [routerLink]="item.url"
           routerLinkActive="bg-[#2D9263]"
           [routerLinkActiveOptions]="{exact:true}"
           [innerHTML]="getSVGImage(item.icon)"
           class="text-[#021D11] hover:text-white hover:bg-[#2D9263] group flex items-center px-2 py-2 text-lg font-medium rounded-md"
           [attr.title]="item.title">
        </a>
      </div>

      <!-- Configuração ou Logout/Login Desktop -->
      <div class="mt-6 pt-6 px-2 space-y-1">
        <a *ngIf="isLoggedIn" (click)="logout()" class="cursor-pointer flex items-center px-2 py-2 text-sm font-medium text-[#021D11] hover:text-white hover:bg-[#2D9263] rounded-md">
          <svg class="mr-4 h-6 w-6 text-[#021D11]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </a>
        <a *ngIf="!isLoggedIn" routerLink="/login" class="flex items-center px-2 py-2 text-sm font-medium text-[#021D11] hover:text-white hover:bg-[#2D9263] rounded-md">
          <svg class="mr-4 h-6 w-6 text-[#021D11]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Entrar
        </a>
      </div>
    </nav>
  </div>
</div>
````````````````````````````````````````

menu.component.spec.ts

``````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`````````````````````````````````````````

menu.component.ts

```````````````````````typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MenuItem } from 'src/app/model/menu.interface';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  @Output() offsetMenuEvent: EventEmitter<boolean> = new EventEmitter();
  @Input() offsetMenu = false;

  isLoggedIn = false;

  constructor(
    private _sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  onMenu(val: boolean): void {
    this.offsetMenuEvent.emit(val);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getSVGImage(image: string) {
    return this._sanitizer.bypassSecurityTrustHtml(`${image}`);
  }

  sideMenu: MenuItem[] = [
    {
      label: 'Home',
      url: '',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>`,
      title: 'Página inicial'
    },
    {
      label: 'Lista de plantas',
      url: '/list-of-plants',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      title: 'Check all listed plants'
    },
    {
      label: 'Cadastro de plantas',
      url: '/list-of-plants',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      title: 'Check all listed plants'
    },

    {
      label: 'Meus Favoritos',
      url: '/favorites',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
      </svg>`,
      title: 'Plantas que você favoritou'
    }
  ];
}
`````````````````````````````````````````````

### Pasta model

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/model

menu.interface.ts

`````````````````````typescript
export interface MenuItem {
  label: string,
  url: string,
  icon: string,
  title?: string
}
``````````````````````````````````

### Pasta pages

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages

### Pasta cadastro

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages/cadastro

cadastro.component.css

```````````````````````css
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}
```````````````````````````````

cadastro.component.html

``````````````````````html
<div class="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4" style="background-image: url('assets/plantaverde.jpg');">
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
    <h1 class="text-3xl font-bold text-center mb-6">Cadastro</h1>

    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="nome" class="block text-gray-700 mb-1">Nome</label>
        <input
          id="nome"
          type="text"
          [(ngModel)]="nome"
          name="nome"
          required
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label for="email" class="block text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          [(ngModel)]="email"
          name="email"
          required
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label for="senha" class="block text-gray-700 mb-1">Senha</label>
        <input
          id="senha"
          type="password"
          [(ngModel)]="senha"
          name="senha"
          required
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition" style="background-color: #2D9263;"
      >
        Cadastrar
      </button>
    </form>

    <p class="mt-4 text-center text-gray-600" > 
      Já tem conta?
      <a routerLink="/login" class="text-green-600 hover:underline" style="color: #2D9263;" >Entrar</a>
    </p>
  </div>
</div>
`````````````````````````````````````

cadastro.component.spec.ts

``````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroComponent } from './cadastro.component';

describe('CadastroComponent', () => {
  let component: CadastroComponent;
  let fixture: ComponentFixture<CadastroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
``````````````````````````````

cadastro.component.ts

```````````````````typescript
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.nome, this.email, this.senha).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso!');
      },
      error: (err) => {
        alert('Erro no cadastro: ' + err.error.message);
      }
    });
  }
}
``````````````````````````````````

cadastro.module.ts

```````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CadastroComponent } from './cadastro.component';

const routes: Routes = [
  { path: '', component: CadastroComponent }
];

@NgModule({
  declarations: [CadastroComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CadastroModule { }
``````````````````````````````````````

### Pasta home

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages/home

```````````````````html
<section class="px-2 py-1 mb-12 bg-white md:px-0">
  <div class="container items-center max-w-6xl px-8 mx-auto">
    <div class="flex flex-wrap items-center sm:-mx-8">
      <div class="w-full md:w-1/2 md:pr-8">
        <div class="w-full pb-6 space-y-4 sm:max-w-md lg:max-w-lg md:space-y-2 lg:space-y-4 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
          <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
            <span class="block xl:inline">Por que você deveria ter uma </span>
            <span class="block text-indigo-600 xl:inline" style="color: #2D9263;">Planta?</span>
          </h1>
          <p class="mx-auto text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl">Ter plantas por perto pode desencadear a liberação de substâncias químicas calmantes no corpo, ajudando a reduzir os níveis de estresse e ansiedade. Simplesmente ver vegetação ou cuidar de uma planta viva pode reduzir o cortisol, aliviar a tensão e criar uma sutil sensação de conforto e conexão com a natureza.</p>

          <div class="relative flex flex-col sm:flex-row sm:space-x-4">
            <a [routerLink]="['/list-of-plants']" class="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-indigo-600 rounded-md sm:mb-0 hover:bg-indigo-700 sm:w-auto" style="background-color: #2D9263;" data-rounded="rounded-md">
              Lista de plantas

              <svg class="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="w-full md:w-1/2">
        <div class="w-full h-auto overflow-hidden rounded-md shadow-xl sm:rounded-xl" data-rounded="rounded-xl" data-rounded-max="rounded-full">
            <img src="../../../assets/planta1.jpg" loading="lazy">
          </div>
      </div>
    </div>
  </div>
</section>
````````````````````````````````

home.component.spec.ts

````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`````````````````````````````
home.component.ts

`````````````````````typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})

export class HomeComponent {
  searchValue: String = '';
  suggestedCats: any = [];
  hidden: boolean = true;

  constructor(
    private router: Router
  ) { }

  mostSearched() {
    this.router.navigate(['/most-searched']);
  }
}
```````````````````````````````

home.module.ts

`````````````````typescript
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HomePageRoutingModule } from './home.routing.module';

import { HomeComponent } from './home.component';

import { LoaderModule } from 'src/app/components/loader/loader.module';
@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    LoaderModule
  ],
  exports: [
    HomeComponent
  ]
})

export class HomePageModule {}
``````````````````````````````

home.routing.module.ts

````````````````typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
})

export class HomePageRoutingModule {}
`````````````````````````

### Pasta list-of-plants

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages/list-of-plants

list-of-plants.component.html

``````````````````````html
<h1 class="text-4xl mb-2 font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
  <span class="block xl:inline"> Lista de</span>
  <span class="block text-indigo-600 xl:inline" style="color: #2D9263;"> Plantas</span>
</h1>

<p class="text-base text-gray-500 sm:max-w-md lg:text-xl md:max-w-3xl">Verifique todas as nossas plantas disponíveis</p>


<section class="py-12 mt-12 bg-gray-100 rounded-2xl shadow-lg">
  <div class="max-w-6xl px-10 mx-auto xl:max-w-7xl">
    <app-latest-plants [limit]="30"></app-latest-plants>
  </div>
</section>
``````````````````````````````

list-of-plants.component.spec.ts

```````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantListComponent } from './list-of-plants.component';

describe('PlantListComponent', () => {
  let component: PlantListComponent;
  let fixture: ComponentFixture<PlantListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```````````````````````````````

list-of-plants.component.ts

```````````````typescript
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plant-list',
  templateUrl: './list-of-plants.component.html'
})

export class PlantListComponent {
@Input() limit!: number;
}
```````````````````````````

list-of-plants.module.ts

`````````````````````typescript
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
```````````````````````````````````````

list-of-plants.routing.module.ts

``````````````````````````````typescript
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
`````````````````````````````````````````

### Pasta login

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages/login

login.component.css

`````````````````css
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}
```````````````````````````````````

login.component.html

```````````````````html
<div class="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4" style="background-image: url('assets/plantaverde.jpg');">
  <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
    <h1 class="text-3xl font-bold text-center mb-6">Entrar</h1>

    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="email" class="block text-gray-700 mb-1">Email</label>
        <input
          id="email"
          type="email"
          [(ngModel)]="email"
          name="email"
          required
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <div>
        <label for="senha" class="block text-gray-700 mb-1">Senha</label>
        <input
          id="senha"
          type="password"
          [(ngModel)]="senha"
          name="senha"
          required
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition" style="background-color: #2D9263;"
      >
        Entrar
      </button>
    </form>

    <p class="mt-4 text-center text-gray-600">
      Não tem conta?
      <a routerLink="/cadastro" class="text-green-900 hover:underline">Cadastre-se</a>
    </p>
  </div>
</div>
````````````````````````````````````

login.component.spec.ts

``````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

```````````````````````````````

login.component.ts

``````````````````typescript
import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  senha = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.email, this.senha).subscribe({
      next: () => {
        // Redirecionamento já é feito pelo serviço
      },
      error: (err) => {
        alert('Erro no login: ' + err.error.message);
      }
    });
  }
}
``````````````````````````````````

login.module.ts

```````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LoginModule { }
`````````````````````````````````

### Pasta plants

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/pages/plants

plant-detail.component.html

`````````````````html
<div class="overflow-hidden" *ngIf="!showLoader">
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">
        <span class="block text-green-600">{{plant?.common_name || 'Plant'}}</span>
      </h1>
      
      <div class="flex space-x-4">
        <button (click)="sharePlant()" class="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
          </svg>
          Compartilhar
        </button>
        
        <button (click)="toggleFavorite()" class="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" [class.text-white]="!isFavorite" [class.text-red-300]="isFavorite">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
          </svg>
          {{isFavorite ? 'Amei!' : 'Amei?'}}
        </button>
      </div>
    </div>

    <div class="lg:grid lg:grid-cols-2 lg:gap-8">
      <div class="relative lg:row-start-1 lg:col-start-1">
        <div class="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden">
          <img *ngIf="plant?.image_url" class="object-cover" [src]="plant.image_url" [alt]="plant.common_name">
          <div *ngIf="!plant?.image_url" class="bg-gray-200 h-full flex items-center justify-center">
            <span class="text-gray-500">Sem imagem disponível</span>
          </div>
        </div>
      </div>

      <div class="mt-8 lg:mt-0 lg:col-start-2">
        <div class="prose prose-lg text-gray-500">
          <h3 class="text-gray-900">Informações</h3>
          
          <p><strong>Nome científico:</strong> {{plant?.scientific_name}}</p>
          <p><strong>Família:</strong> {{ plant?.main_species?.family || 'Não disponível' }}</p>
          <p><strong>Gênero:</strong> {{plant?.genus?.name || plant?.genus}}</p>
          <p><strong>Observações:</strong> {{plant?.observations || 'Nenhuma descrição disponível.'}}</p>
          
          <p><strong>Sinônimos:</strong></p>
          <div *ngIf="synonyms.length > 0; else noSynonyms">
            <ul class="list-disc pl-5">
              <li *ngFor="let synonym of synonyms">{{ synonym }}</li>
            </ul>
          </div>
          <ng-template #noSynonyms>
            <p class="text-gray-400">Nenhum sinônimo registrado.</p>
          </ng-template>
        </div>
      </div>
    </div>
  </div>
</div>

<app-loader *ngIf="showLoader"></app-loader>
``````````````````````````

plant-detail.component.scss

```````````````````````scss
.plant-detail-container {
  @apply p-6 max-w-6xl mx-auto;

  .plant-header {
    @apply flex justify-between items-center mb-8;

    h1 {
      @apply text-3xl font-bold text-green-700;
    }

    .plant-actions {
      @apply flex gap-4;

      button {
        @apply px-4 py-2 rounded-lg transition-all;

        &.favorite-btn {
          @apply bg-red-100 text-red-600 hover:bg-red-200;
        }

        &.share-btn {
          @apply bg-blue-100 text-blue-600 hover:bg-blue-200;
        }
      }
    }
  }

  .plant-content {
    @apply grid md:grid-cols-2 gap-8;

    .plant-image {
      img {
        @apply rounded-lg shadow-lg w-full h-auto;
      }
    }

    .plant-info {
      @apply space-y-4;

      h2 {
        @apply text-2xl font-semibold text-gray-800;
      }

      p {
        @apply text-gray-600;

        strong {
          @apply text-gray-800;
        }
      }
    }
  }
}
```````````````````````````````````````

plant-detail.component.ts

`````````````typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantService } from 'src/app/services/plant/plant.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Synonym {
  value?: string;
  name?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-plant-detail',
  templateUrl: './plant-detail.component.html',
  styleUrls: ['./plant-detail.component.scss']
})

export class PlantDetailComponent implements OnInit {
  plant: any;
  isFavorite = false;
  showLoader = true;

  constructor(
    private route: ActivatedRoute,
    private plantService: PlantService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe(params => {
      console.log('ID da planta:', params['id']);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadPlant(id);
  }

  loadPlant(id: string): void {
    this.showLoader = true;
    this.plantService.getPlant(id).subscribe({
      next: (data) => {
        this.plant = data?.data ?? data;
        this.showLoader = false;
      },
      error: (err) => {
        console.error('Error loading plant:', err);
        this.showLoader = false;
      }
    });
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.plantService.toggleFavorite(this.plant.id).subscribe({
      error: (err) => {
        console.error('Error toggling favorite:', err);
        this.isFavorite = !this.isFavorite;
      }
    });
  }

sharePlant(): void {
  const currentId = this.route.snapshot.params['id']; // Pega o ID da rota atual
  const url = `${window.location.origin}/plants/${currentId}`;
  this.clipboard.copy(url);
  this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', {
    duration: 2000,
  });
}
get synonyms(): string[] {
  if (!this.plant?.main_species?.synonyms) return [];
  
  const allSynonyms = Object.values(this.plant.main_species.synonyms).map(synonym => {
    const syn = synonym as { value?: string; name?: string };
    return typeof syn === 'string' ? syn : syn.value || syn.name || JSON.stringify(syn);
  });

  // Retorna apenas os primeiros 5 sinônimos
  return allSynonyms.slice(0, 5);
}
}
`````````````````````````````````````````````````````

plants.component.spec.ts

```````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlantDetailComponent } from './plant-detail.component';

describe('PlantDetailComponent', () => {
  let component: PlantDetailComponent;
  let fixture: ComponentFixture<PlantDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlantDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
``````````````````````````````````

plants.module.ts

`````````````````````typescript
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
`````````````````````````````````

plants.routing.module.ts

`````````````````typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantDetailComponent } from './plant-detail.component';

const routes: Routes = [
  {
    path: ':id',
    component: PlantDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlantsRoutingModule {}
``````````````````````````````
### Pasta favorites

favorites.component.css

`````````````````css
/* Estilos base */
.favorites-container {
  @apply min-h-screen p-6 bg-gray-50;
}

.favorites-grid {
  @apply grid gap-6;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.favorite-card {
  @apply relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg;
}

.favorite-image {
  @apply w-full h-48 object-cover transition-opacity duration-300;
}

.favorite-info {
  @apply p-4;
}

.favorite-name {
  @apply text-lg font-semibold text-gray-800 truncate;
}

.favorite-scientific-name {
  @apply text-sm italic text-gray-500;
}

.favorite-remove-btn {
  @apply absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-sm text-red-500 hover:text-red-700 transition-colors duration-300;
}

.empty-state {
  @apply text-center py-12 max-w-md mx-auto;
}

.empty-state-icon {
  @apply mx-auto h-12 w-12 text-gray-400;
}

.empty-state-title {
  @apply mt-2 text-lg font-medium text-gray-900;
}

.empty-state-description {
  @apply mt-1 text-sm text-gray-500;
}

.explore-btn {
  @apply inline-flex items-center px-4 py-2 mt-6 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-300;
}
``````````````````````````````````

favorites.component.html

````````````````````html
<div class="min-h-full p-6">
  <div class="max-w-7xl mx-auto">
    <!-- Cabeçalho -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-gray-900">
        <span class="block text-green-600">Minhas Plantas Favoritas</span>
      </h1>
    </div>

    <!-- Lista de Favoritos -->
    <div *ngIf="favorites.length > 0; else noFavorites">
      <div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div *ngFor="let favorite of favorites" class="relative">
          <a [routerLink]="['/plants', favorite.plant.id]" class="group">
            <div class="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden">
              <img 
                [src]="favorite.plant.image_url || 'assets/placeholder-plant.jpg'" 
                [alt]="favorite.plant.common_name"
                class="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300">
            </div>
            <div class="mt-4 flex justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{favorite.plant.common_name || 'Nome não disponível'}}
                </h3>
                <p class="mt-1 text-sm text-gray-500 italic">
                  {{favorite.plant.scientific_name}}
                </p>
              </div>
              <button 
                (click)="toggleFavorite(favorite.plant.id); $event.preventDefault()"
                class="text-red-500 hover:text-red-700 focus:outline-none">
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
              </button>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Mensagem quando não há favoritos -->
    <ng-template #noFavorites>
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Nenhuma planta favoritada</h3>
        <p class="mt-1 text-sm text-gray-500">Comece adicionando plantas aos seus favoritos clicando no coração.</p>
        <div class="mt-6">
          <a 
            [routerLink]="['/list-of-plants']" 
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Explorar Plantas
          </a>
        </div>
      </div>
    </ng-template>
  </div>
</div>
```````````````````````````````````````

favorites.component.spec.ts

````````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesComponent } from './favorites.component';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavoritesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
`````````````````````````````````````````````

favorites.component.ts

```````````````````````typescript
import { Component, OnInit } from '@angular/core';
import { PlantService } from '../../services/plant/plant.service'; // ajuste o path conforme sua estrutura

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];

  constructor(private plantService: PlantService) {}

  ngOnInit(): void {
    this.plantService.getFavorites().subscribe({
      next: (data) => this.favorites = data,
      error: (err) => console.error(err)
    });
  }

  toggleFavorite(plantId: string): void {
    this.plantService.toggleFavorite(plantId).subscribe({
      next: () => {
        // Remove o favorito da lista local sem recarregar a página
        this.favorites = this.favorites.filter(fav => fav.plant.id !== plantId);
      },
      error: (err) => {
        console.error('Error toggling favorite:', err);
      }
    });
  }
}
``````````````````````````````````````````

favorites.module.ts

```````````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FavoritesComponent } from './favorites.component';
import { LoaderModule } from '../../components/loader/loader.module';

// Rotas do módulo
const routes: Routes = [
  {
    path: '',
    component: FavoritesComponent
  }
];

@NgModule({
  declarations: [
    FavoritesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LoaderModule
  ],
  exports: [
    FavoritesComponent
  ]
})
export class FavoritesModule { }
`````````````````````````````````````````````

### Pasta add-plant

add-plant.component.css

```````````````````css
/* Estilos base */
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  margin-bottom: 1rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #4b5563;
  text-align: center;
  margin-bottom: 2rem;
}

/* Estilos dos campos */
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  border-color: #10b981;
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-textarea {
  min-height: 80px;
}

/* Estilos de validação */
.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Estilos da pré-visualização da imagem */
.image-preview {
  max-height: 128px;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

/* Estilos dos botões */
.btn-primary {
  background-color: #059669;
  color: white;
}

.btn-primary:hover {
  background-color: #047857;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

/* Estilos para sinônimos */
.synonym-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.add-synonym-btn {
  background-color: #d1fae5;
  color: #065f46;
}

.add-synonym-btn:hover {
  background-color: #a7f3d0;
}

.remove-synonym-btn {
  background-color: #fee2e2;
  color: #b91c1c;
}

.remove-synonym-btn:hover {
  background-color: #fecaca;
}
``````````````````````````````````````

add-plant.component.html

`````````````````````html
<div class="min-h-full py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white p-8 rounded-xl shadow-lg">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Cadastrar Nova Planta</h1>
        <p class="mt-2 text-sm text-gray-600">Preencha os detalhes da planta abaixo</p>
      </div>

      <form [formGroup]="plantForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Nome Comum -->
        <div>
          <label for="common_name" class="block text-sm font-medium text-gray-700">Nome Comum *</label>
          <input
            id="common_name"
            type="text"
            formControlName="common_name"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Ex: Rosa, Suculenta, Samambaia">
          <div *ngIf="plantForm.get('common_name')?.invalid && plantForm.get('common_name')?.touched" 
               class="mt-1 text-sm text-red-600">
            Nome comum é obrigatório
          </div>
        </div>

        <!-- Nome Científico -->
        <div>
          <label for="scientific_name" class="block text-sm font-medium text-gray-700">Nome Científico *</label>
          <input
            id="scientific_name"
            type="text"
            formControlName="scientific_name"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Ex: Rosa spp., Echeveria elegans">
          <div *ngIf="plantForm.get('scientific_name')?.invalid && plantForm.get('scientific_name')?.touched" 
               class="mt-1 text-sm text-red-600">
            Nome científico é obrigatório
          </div>
        </div>

        <!-- Família -->
        <div>
          <label for="family" class="block text-sm font-medium text-gray-700">Família *</label>
          <input
            id="family"
            type="text"
            formControlName="family"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Ex: Rosaceae, Crassulaceae">
        </div>

        <!-- Gênero -->
        <div>
          <label for="genus" class="block text-sm font-medium text-gray-700">Gênero *</label>
          <input
            id="genus"
            type="text"
            formControlName="genus"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Ex: Rosa, Echeveria">
        </div>

        <!-- Observações -->
        <div>
          <label for="observations" class="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            id="observations"
            formControlName="observations"
            rows="3"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Onde a planta pode ser encontrada, características especiais..."></textarea>
        </div>

        <!-- Imagem -->
        <div>
          <label for="image" class="block text-sm font-medium text-gray-700">Imagem *</label>
          <div class="mt-1 flex items-center">
            <input
              id="image"
              type="file"
              (change)="onFileChange($event)"
              accept="image/*"
              class="focus:outline-none">
          </div>
          <div *ngIf="previewImage" class="mt-2">
            <img [src]="previewImage" alt="Preview" class="h-32 rounded-md">
          </div>
          <div *ngIf="plantForm.get('image')?.invalid && plantForm.get('image')?.touched" 
               class="mt-1 text-sm text-red-600">
            Imagem é obrigatória
          </div>
        </div>

        <!-- Sinônimos -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Sinônimos</label>
          <div formArrayName="synonyms">
            <div *ngFor="let synonym of synonyms.controls; let i = index" class="mt-2 flex">
              <input
                [formControlName]="i"
                class="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Nome alternativo">
              <button
                type="button"
                (click)="removeSynonym(i)"
                class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                Remover
              </button>
            </div>
          </div>
          <button
            type="button"
            (click)="addSynonym()"
            class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Adicionar Sinônimo
          </button>
        </div>

        <!-- Botões -->
        <div class="pt-6 flex justify-end space-x-3">
          <button
            type="button"
            [routerLink]="['/list-of-plants']"
            class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="plantForm.invalid"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
            Cadastrar Planta
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
`````````````````````````````````

add-plant.component.spec.ts

`````````````````````typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlantComponent } from './add-plant.component';

describe('AddPlantComponent', () => {
  let component: AddPlantComponent;
  let fixture: ComponentFixture<AddPlantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPlantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPlantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
``````````````````````````````````````

add-plant.component.ts

``````````````````````typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PlantService } from 'src/app/services/plant/plant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-plant',
  templateUrl: './add-plant.component.html',
  styleUrls: ['./add-plant.component.css']
})
export class AddPlantComponent {
  plantForm: FormGroup;
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private router: Router
  ) {
    this.plantForm = this.fb.group({
      common_name: ['', Validators.required],
      scientific_name: ['', Validators.required],
      family: ['', Validators.required],
      genus: ['', Validators.required],
      observations: [''],
      image: [null, Validators.required],
      synonyms: this.fb.array([])
    });
  }

  get synonyms() {
    return this.plantForm.get('synonyms') as FormArray;
  }

  addSynonym() {
    this.synonyms.push(this.fb.control(''));
  }

  removeSynonym(index: number) {
    this.synonyms.removeAt(index);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.plantForm.patchValue({ image: file });
      
      // Pré-visualização da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.plantForm.valid) {
      const formData = new FormData();
      Object.keys(this.plantForm.value).forEach(key => {
        if (key === 'synonyms') {
          formData.append(key, JSON.stringify(this.plantForm.get(key)?.value));
        } else if (key === 'image') {
          formData.append('image', this.plantForm.get('image')?.value);
        } else {
          formData.append(key, this.plantForm.get(key)?.value);
        }
      });

      this.plantService.addPlant(formData).subscribe({
        next: () => {
          this.router.navigate(['/list-of-plants']);
        },
        error: (err) => {
          console.error('Erro ao cadastrar planta:', err);
        }
      });
    }
  }
}
```````````````````````````````````````

add-plant.module.ts

````````````````````typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AddPlantComponent } from './add-plant.component';
import { LoaderModule } from '../../components/loader/loader.module';

const routes: Routes = [
  {
    path: '',
    component: AddPlantComponent
  }
];

@NgModule({
  declarations: [AddPlantComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    LoaderModule
  ]
})
export class AddPlantModule { }
`````````````````````````````````````

### Pasta services

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/services

### Pasta auth

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/services/auth

auth.service.spec.ts

````````````````typescript
import { TestBed } from '@angular/core/testing';

import { Auth } from './auth.service';

describe('Auth', () => {
  let service: Auth;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Auth);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
````````````````````````````

auth.service.ts

````````````````typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private router: Router) {}

  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      name,
      email,
      password
    }).pipe(
      tap(() => this.router.navigate(['/login']))
    );
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap((res: any) => {
        localStorage.setItem('auth', JSON.stringify(res));
        this.router.navigate(['/']);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth');
  }

  logout() {
    localStorage.removeItem('auth');
    this.router.navigate(['/login']);
  }
}
```````````````````````````

### Pasta plant

path: /home/thalissa/lista-plantas/lista-plantas/frontend/src/app/services/plant

plant.service.spec.ts

``````````````````````typescript
import { TestBed } from '@angular/core/testing';

import { PlantService } from './plant.service';

describe('PlantService', () => {
  let service: PlantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
`````````````````````````````````

plant.service.ts

`````````````````````typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

const url = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
  };

  getPlants(limit: number): Observable<any> {
    return this.http.get<any>(`${url}/plants?limit=${limit}`);
  }

  getPlant(id: string): Observable<any> {
    return this.http.get<any>(`${url}/plants/${id}`);
  }

  searchPlants(name: string): Observable<any> {
    return this.http.get<any>(`${url}/plants/search/${name}`);
  }

  toggleFavorite(plantId: string): Observable<any> {
    // Implementar chamada para o backend Laravel para salvar favoritos
    return this.http.post<any>(`${url}/favorites`, { plantId });
  }

checkFavorite(plantId: string): Observable<boolean> {
  return this.http.get<boolean>(`${url}/plants/${plantId}/favorite`);
}

addPlant(plantData: FormData): Observable<any> {
  return this.http.post(`${url}/plants`, plantData);
}
getFavorites(): Observable<any> {
  return this.http.get(`${url}/favorites`);
}
}
````````````````````````````````

