import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  senha = '';

  constructor(private router: Router) {}

  onSubmit() {
    const savedUser = localStorage.getItem('userData');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (this.email === user.email && this.senha === user.senha) {
        localStorage.setItem('userLoggedIn', 'true');
        this.router.navigate(['/']);
      } else {
        alert('Email ou senha inválidos');
      }
    } else {
      alert('Nenhum usuário cadastrado. Faça o cadastro primeiro.');
      this.router.navigate(['/cadastro']);
    }
  }
}
