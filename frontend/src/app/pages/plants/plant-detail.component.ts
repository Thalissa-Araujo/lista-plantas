import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantService } from 'src/app/services/plant/plant.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';


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
  const url = `${window.location.origin}/plants/${this.plant.id}`;
  this.clipboard.copy(url);
  this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', {
    duration: 2000,
  });
}
}