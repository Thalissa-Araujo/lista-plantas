import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-plant-list',
  templateUrl: './list-of-plants.component.html'
})

export class PlantListComponent {
@Input() limit!: number;
}
