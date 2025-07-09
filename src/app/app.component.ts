import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  emitMenu = false;

  constructor(public router: Router) {}

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/cadastro';
  }

  getEmit(value: boolean) {
    this.emitMenu = value;
  }
}
