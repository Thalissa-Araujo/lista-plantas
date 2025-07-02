import { Component, OnInit } from '@angular/core';
import { PlantService } from 'src/app/services/plant/plant.service';

@Component({
  selector: 'app-most-searched',
  templateUrl: './most-searched.component.html'
})

export class MostSearchedComponent {
  plants: any;
  showLoader: boolean = true;

  constructor(private plantService: PlantService) { }

  ngOnInit(): void {
    this.showLoader = true;

    this.plantService.getPlants(10).subscribe(data => {
      this.plants = data;
      this.showLoader = false;
     })
  }
}
