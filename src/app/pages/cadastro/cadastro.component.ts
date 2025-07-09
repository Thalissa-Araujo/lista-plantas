import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
})
export class CadastroComponent {
  nome = '';
  email = '';
  senha = '';

  constructor(private router: Router) {}

  onSubmit() {
    const user = {
      nome: this.nome,
      email: this.email,
      senha: this.senha
    };
    localStorage.setItem('userData', JSON.stringify(user));
    alert('Cadastro realizado com sucesso!');
    this.router.navigate(['/login']); 
  }
}
