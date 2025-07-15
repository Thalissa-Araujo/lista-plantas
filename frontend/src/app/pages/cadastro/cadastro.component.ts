import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.register(this.nome, this.email, this.senha).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso!');
      },
      error: (err) => {
        alert('Erro no cadastro: ' + err.error.message);
      }
    });
  }
}