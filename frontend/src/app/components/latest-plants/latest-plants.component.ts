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
      next: (plants) => {
        console.log('Plants loaded:', plants); // Para debug
        this.plants = plants;
        this.showLoader = false;
      },
      error: (err) => {
        console.error('Error loading plants:', err);
        this.plants = [];
        this.showLoader = false;
      }
    });
  }
getImageUrl(plant: any): string {
  if (plant.image_url && plant.image_url.startsWith('/storage')) {
    const parts = plant.image_url.split('/');
    const filename = parts[parts.length - 1];
    return `http://localhost:8000/images/plants/${filename}`;
  }
  if (plant.default_image?.regular_url) {
    return plant.default_image.regular_url;
  }
  return 'assets/fallback.jpg';
}
}
