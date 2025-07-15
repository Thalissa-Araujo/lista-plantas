import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PlantService } from 'src/app/services/plant/plant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-plant',
  templateUrl: './add-plant.component.html',
  styleUrls: ['./add-plant.component.css']
})
export class AddPlantComponent {
  plantForm: FormGroup;
  previewImage: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private router: Router
  ) {
    console.log('AddPlantComponent initialized');
    
    this.plantForm = this.fb.group({
      common_name: ['', Validators.required],
      scientific_name: ['', Validators.required],
      family: ['', Validators.required],
      genus: ['', Validators.required],
      observations: [''],
      image: [null, Validators.required],
      synonyms: this.fb.array([])
    });
  }

  get synonyms() {
    return this.plantForm.get('synonyms') as FormArray;
  }

  addSynonym() {
    this.synonyms.push(this.fb.control('', Validators.required));
  }

  removeSynonym(index: number) {
    this.synonyms.removeAt(index);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.plantForm.patchValue({ image: file });
      
      // Pré-visualização da imagem
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.plantForm.valid) {
      const formData = new FormData();
      const formValue = this.plantForm.value;

      // Adiciona campos simples
      formData.append('common_name', formValue.common_name);
      formData.append('scientific_name', formValue.scientific_name);
      formData.append('family', formValue.family);
      formData.append('genus', formValue.genus);
      formData.append('observations', formValue.observations);
      formData.append('image', formValue.image);

      // Adiciona sinônimos
      formValue.synonyms.forEach((synonym: string) => {
        if (synonym.trim() !== '') {
          formData.append('synonyms[]', synonym);
        }
      });

      this.plantService.addPlant(formData).subscribe({
        next: () => this.router.navigate(['/list-of-plants']),
        error: (err) => console.error('Erro detalhado:', err)
      });
    }
  }
}