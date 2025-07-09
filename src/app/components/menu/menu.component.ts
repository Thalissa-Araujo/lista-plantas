import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuItem } from 'src/app/model/menu.interface';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent {
  constructor(private _sanitizer: DomSanitizer) {}

  @Output() offsetMenuEvent: EventEmitter<boolean> = new EventEmitter();
  @Input() offsetMenu = false;

  onMenu(val: boolean): void {
    this.offsetMenuEvent.emit(val);
  }

  sideMenu: MenuItem[] = [
    {
      label: 'Home',
      url: '',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>`,
      title: 'Página inicial'
    },
    {
      label: 'Lista de plantas',
      url: '/list-of-plants',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      title: 'Check all listed plants'
    },

     {
      label: 'Cadastro de plantas',
      url: '/list-of-plants',
      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      title: 'Check all listed plants'
    },

//    {
//      label: 'Minhas Favoritas',
//      url: '/favorites',
//      icon: `<svg class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//      </svg>`,
//      title: 'Plantas que você amou'
//    }
  ];

  getSVGImage(image: string) {
    return this._sanitizer.bypassSecurityTrustHtml(`${image}`);
  }
}