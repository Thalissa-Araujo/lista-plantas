import { Component, OnInit, Input } from '@angular/core';
import { PlantService } from 'src/app/services/plant/plant.service';

@Component({
  selector: 'app-latest-plants',
  templateUrl: './latest-plants.component.html'
})

export class LatestPlantsComponent implements OnInit {
  plants: any;
  name: string = '';
  showLoader: boolean = true;

  @Input() limit = 1

  constructor(private plantService:PlantService) { }

  ngOnInit(): void {
    this.showLoader = true;

    this.plantService.getPlants(this.limit).subscribe(data=>{
        this.plants = data;
        this.showLoader = false;
    })
  }
}
