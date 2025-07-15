import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  emitMenu = false;

  constructor(public router: Router) {
    this.router.events.subscribe((val) => {
    console.log('Current URL:', this.router.url);
    console.log('isAuthPage:', this.isAuthPage());
  });
  }

  isAuthPage(): boolean {
    return this.router.url.includes('/login') || 
          this.router.url.includes('/cadastro');
  }

  getEmit(value: boolean) {
    this.emitMenu = value;
  }
}
