import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantService } from 'src/app/services/plant/plant.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';

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
    this.checkInitialFavoriteStatus(id);
  }

  loadPlant(id: string): void {
    this.showLoader = true;
    this.plantService.getPlant(id).subscribe({
      next: (plantData) => {
        console.log('Dados recebidos:', plantData);
        if (plantData) {
          this.plant = plantData;
          this.checkInitialFavoriteStatus(this.plant.main_species?.id?.toString());
        } else {
          console.error('Dados da planta vazios');
        }
        this.showLoader = false;
      },
      error: (err) => {
        console.error('Erro ao carregar planta:', err);
        this.showLoader = false;
      }
    });
  }

  toggleFavorite(): void {
      if (!this.plant || !this.plant.main_species || !this.plant.main_species.id) {
          console.error('Erro: ID da planta (main_species.id) não disponível para favoritar.', this.plant);
          this.snackBar.open('Erro: Não foi possível obter o ID da planta para favoritar.', 'Fechar', {
              duration: 3000,
          });
          return;
      }

      const plantIdToSend = this.plant.main_species.id.toString();
      const sourceType = 'trefle';

      console.log('ID da planta para favoritar (main_species.id):', plantIdToSend, 'Tipo de origem:', sourceType);

      this.isFavorite = !this.isFavorite;

      this.plantService.toggleFavorite(plantIdToSend, sourceType).subscribe({
          next: () => {
              this.snackBar.open('Favorito atualizado!', 'Fechar', { duration: 2000 });
          },
          error: (err) => {
              console.error('Erro ao alternar favorito:', err);
              this.isFavorite = !this.isFavorite;
              this.snackBar.open('Erro ao atualizar favorito. Tente novamente.', 'Fechar', { duration: 3000 });
          }
      });
  }

  checkInitialFavoriteStatus(plantId: string): void {
    if (!plantId) {
      return;
    }
    const sourceType = 'trefle';
    this.plantService.checkFavorite(plantId, sourceType).subscribe({
      next: (isFav) => {
        this.isFavorite = isFav;
      },
      error: (err) => {
        console.error('Erro ao verificar status de favorito inicial:', err);
        this.isFavorite = false;
      }
    });
  }

  sharePlant(): void {
    const currentId = this.route.snapshot.params['id'];
    const url = `${window.location.origin}/plants/${currentId}`;
    this.clipboard.copy(url);
    this.snackBar.open('Link copiado para a área de transferência!', 'Fechar', {
      duration: 2000,
    });
  }

  get synonyms(): string[] {
    if (!this.plant) return [];
    
    if (Array.isArray(this.plant.synonyms)) {
      return this.plant.synonyms.slice(0, 5);
    }
    
    if (this.plant.main_species?.synonyms) {
      return Object.values(this.plant.main_species.synonyms)
        .map((s: any) => {
          if (typeof s === 'string') return s;
          return s?.name || s?.scientific_name || s?.value || JSON.stringify(s);
        })
        .filter(s => s)
        .slice(0, 5);
    }
    
    return [];
  }
}