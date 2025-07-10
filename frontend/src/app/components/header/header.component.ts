import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PlantService } from 'src/app/services/plant/plant.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  @Output() offsetMenuEvent: EventEmitter<boolean> = new EventEmitter();
  offsetMenu = false;

  enteredSearchValue: string = '';
  showSuggested: boolean = false;
  showResults: boolean = false;
  suggestedPlants: any = [];

  constructor(private plantService: PlantService) { }

  ngOnInit(): void {}

  onMenu(val: boolean): void {
    this.offsetMenuEvent.emit(val);
    this.offsetMenu = !this.offsetMenu;
  }

  closeSearch(): void {
    this.showResults = false;
    this.enteredSearchValue = '';
    this.suggestedPlants = [];
  }

  outSearch(): void {
    setTimeout(() => {
      this.closeSearch();
    }, 200);
  }

  onSearchChange(): void {
    if (this.enteredSearchValue !== '') {
      this.showResults = true;
      this.plantService.searchPlants(this.enteredSearchValue).subscribe({
        next: (data) => {
          this.suggestedPlants = data;
          this.showSuggested = this.suggestedPlants.length > 0;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.suggestedPlants = [];
          this.showSuggested = false;
        }
      });
    } else {
      this.showResults = false;
      this.suggestedPlants = [];
    }
  }
}