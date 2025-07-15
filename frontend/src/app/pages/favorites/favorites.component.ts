import { Component, OnInit } from '@angular/core';
import { PlantService } from '../../services/plant/plant.service';

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
      next: (data) => {
        console.log('Favoritos recebidos:', data);
        this.favorites = data;
      },
      error: (err) => console.error(err)
    });
  }

  toggleFavorite(plantId: string, sourceType: string): void {
    this.plantService.toggleFavorite(plantId, sourceType).subscribe({
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
