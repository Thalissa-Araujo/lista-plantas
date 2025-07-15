# Plantarium

### Projeto desenvolvido por:

Ana Caroline

Beatris Cicotosto

Thalissa Araujo

---------------------------------------------------------------------------

# Vídeo do nosso projeto funcionando:

[![Assista ao Video](./lista-plantas/video/thumbnail.png)](./lista-plantas/video/video_apresentação.mp4)


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
cd lista-plantas/frontend
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
