import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AddPlantComponent } from './add-plant.component';

const routes: Routes = [
  { path: '', component: AddPlantComponent, children: [] }
];

@NgModule({
  declarations: [AddPlantComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class AddPlantModule { }