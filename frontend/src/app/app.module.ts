import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HttpClientXsrfModule  } from '@angular/common/http';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ComponentsModule } from './components/components.module';
import { AppComponent } from './app.component';
import { LoaderModule } from './components/loader/loader.module';
// Renomeie este módulo para LatestPlantsModule quando fizer a mudança
//import { LatestPlantsModule } from './components/latest-plants/latest-plants.module';

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
    HttpClientXsrfModule.withOptions({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN'
    }),
    FormsModule,
    BrowserAnimationsModule,
    LoaderModule,
    // Angular Material Modules
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    ClipboardModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }