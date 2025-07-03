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