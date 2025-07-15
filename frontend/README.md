<<<<<<< HEAD
# Angular + Tailwind CSS Starter with Cat API (FrontEnd)
Dashboard using Angular 15 and Tailwind CSS. This project was created with [Angular CLI](https://github.com/angular/angular-cli) version 15.0.5.

The project is available via URL https://angular-tailwind-front.vercel.app at [Vercel](https://vercel.com/) .

### **IMPORTANT**: For localhost, you need to run BFF first for FrontEnd works properly.
---
## Specifications
Follow below, the specifications of the FrontEnd:

* Angular 15 (JS framework)
* Tailwind 3 (CSS Lib)
* Karma + Jasmine (Test)
* RXJS
* Swiper (Photo Carousel)

## Starting
With the repository on your computer and already in the frontend directory `$ angular-tailwind-starter/frontend` run the `npm install` command to install all Node modules.

## Development
Run `ng serve` or `npm start` to the project in development mode and browse through the URL `http://localhost:4200/`. The application will restart automatically when making any changes to the source files.

## Build
Run `ng build` or `npm run build` to generate a production package. Build artifacts for production, station stored in folder `dist/`.

## Run Build in localhost
For this, it is necessary to install the module globally `http-server` running the command `npm i http-server -g` and then in the frontend directory, run `npm run build` and then `npm run serve`, to shorten this process, just run `npm run local:prod` which will run both commands mentioned.

## Testes
Although there are currently no more elaborate tests, run `ng test` for unit tests via [Karma](https://karma-runner.github.io).

## Deploy
As it is connected to Vercel, a process which follows the agile CI/CD path, their application connects directly to the project repository, via authorization via a Github token, all you have to do is commit the changes, so that they are automatically updated.
=======
# 🌿 Plant API Backend (Laravel)

Este é o backend da aplicação Plant API, desenvolvido em Laravel, que se conecta à API externa do Trefle para buscar informações sobre plantas.

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [PHP >= 8.1](https://www.php.net/)
- [Composer](https://getcomposer.org/)
- [Laravel CLI (opcional)](https://laravel.com/docs/10.x/installation)
- [Extensões PHP necessárias (ex: curl, mbstring, xml, etc)](https://laravel.com/docs/10.x/deployment#server-requirements)
- Extensão PHP SQLite ativa

---

## 🚀 Rodando o Backend

### 1. Acesse a pasta do backend:

```bash
cd backend/plant-api-backend
``````````````

### 2. Instale as dependências PHP com o Composer:

```bash
composer install
`````````````

### 3. Rode o servidor de desenvolvimento:
```bash
php artisan serve
``````````````

Por padrão, o backend estará acessível em:

http://127.0.0.1:8000

#### 🔗 Endpoints Disponíveis

- http://127.0.0.1:8000/api/plants – Lista plantas

- http://127.0.0.1:8000/api/plants/search/{query} – Busca por nome

- http://127.0.0.1:8000/api/plants/{id} – Detalhes de uma planta


# Plant API Frontend (Angular)

## Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Angular CLI 15.x (instalado globalmente)

### 1. Configuração Inicial

```bash
cd angular-tailwind-starter-main/frontend
`````````````````
### 2. Instale as dependências:

```bash
npm install
`````````````

### Executando a Aplicação

```bash
ng serve
`````````````````

### Troubleshooting

Erro ao instalar dependências:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
`````````````````

Erros de compilação:

- Verifique a versão do Angular com ng version

- Confira se todas as dependências estão no package.json

### Dependências Principais

- Angular 15

- Tailwind CSS 3

- Angular Material (opcional)

- RxJS
>>>>>>> c195f637b269a80a2a64255cf75002232489181c
