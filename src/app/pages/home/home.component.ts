import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { PeliculasService } from '../../services/peliculas-local.service';
import { PeliculasApiService } from '../../services/peliculas.api.service';
import { DarkmodeService } from '../../services/darkmode';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {

  peliculas: any[] = [];
  peliculasApi: any[] = [];
  peliculasMostrar: any[] = [];
  busqueda: string = '';
  modoOscuro: boolean = false;
  modoActual: 'tv' | 'anime' | 'pelicula' = 'pelicula'; // para filtrar series/anime

  constructor(
    private peliculasService: PeliculasService,
    private apiService: PeliculasApiService,
    private router: Router,
    public darkmodeService: DarkmodeService
  ) {}

  ngOnInit(): void {
    this.cargarPeliculasLocales();
    this.cargarPeliculasApi();
  }

  // Carga películas locales
  cargarPeliculasLocales() {
    this.peliculasService.getPeliculasLocales().subscribe(data => {
      this.peliculas = data;
      this.actualizarMostrar();
    });
  }



peliculasPorPagina = 12;
paginaActual = 1;

paginaApiActual = 1;

getTotalPaginas(): number {
  return Math.ceil(this.peliculas.length / this.peliculasPorPagina);
}
irAPaginaLocal(pagina: number) {
  this.paginaActual = pagina;
}

getTotalPaginasApi(): number {
  return Math.ceil(this.peliculas.length / this.peliculasPorPagina);
}

totalPaginasApi: number = 0;


get paginasVisibles(): number[] {
  const total = Math.min(this.totalPaginasApi, 12); // máximo 12 botones
  const paginas: number[] = [];
  let start = Math.max(1, this.paginaApiActual - 5);
  let end = Math.min(start + 11, this.totalPaginasApi);
  start = Math.max(1, end - 11);

  for (let i = start; i <= end; i++) {
    paginas.push(i);
  }
  return paginas;
}

irAPaginaApi(pagina: number) {
  if (this.modoActual === 'tv') {
    this.cargarSeriesPorGenero('', 'tv', pagina);
  } else if (this.modoActual === 'anime') {
    this.cargarSeriesPorGenero('16', 'anime', pagina);
  }
}


cambiarModo(modo: 'peliculas' | 'series' | 'seriesAnimadas') {
  this.seccionActual = modo;
  this.resultados = [];
  this.paginaActual = 1;

  if (modo === 'peliculas') {
    this.modoActual = 'pelicula';
    this.cargarPeliculasLocales();
  } else if (modo === 'series') {
    this.modoActual = 'tv';
    this.cargarSeriesPorGenero('', 'tv');
  } else if (modo === 'seriesAnimadas') {
    this.modoActual = 'tv';
    this.cargarSeriesPorGenero('16', 'tv');
  }
}


getPeliculasPaginadas(): any[] {
  if (this.modoActual === 'pelicula'){
  const inicio = (this.paginaActual - 1) * this.peliculasPorPagina;
  const fin = inicio + this.peliculasPorPagina;
  return this.peliculas.slice(inicio, fin);
  } else {
    return this.peliculasApi; // todas las traídas de API
  }
}




  // Carga películas API (populares)
  cargarPeliculasApi() {
    this.apiService.getPeliculasPopulares().subscribe(res => {
    this.peliculasApi = res.results.map((p: any) => ({
    id: p.id,
    titulo: p.title,
    imagen: p.poster_path ? 'https://image.tmdb.org/t/p/w500' + p.poster_path : 'https://via.placeholder.com/500x750?text=Sin+imagen',
    anio: p.release_date?.split('-')[0] || 'N/A',
    genero: p.genre_ids ? p.genre_ids.map((id: number) => this.nombreGeneroPorId(id)).join(', ') : 'Sin especificar',
    esApi: true
  }));
  });
  }


  // Carga series o anime filtrando por género
  cargarSeriesPorGenero(generoId: string, tipo: 'tv' | 'anime', page: number = 1) {
  this.modoActual = tipo;
  this.paginaApiActual = page;

  this.apiService.getSeriesPorGenero(generoId, tipo, page).subscribe((res: any) => {
    this.peliculasApi = res.results.map((p: any) => ({
      id: p.id,
      titulo: p.title || p.name,
      imagen: p.poster_path
        ? 'https://image.tmdb.org/t/p/w500' + p.poster_path
        : 'https://via.placeholder.com/500x750?text=Sin+imagen',
      anio: p.release_date?.split('-')[0] || p.first_air_date?.split('-')[0] || 'N/A',
      genero: p.genre_ids ? p.genre_ids.map((id: number) => this.nombreGeneroPorId(id)).join(', ') : 'Sin especificar',
      esApi: true
    }));

    this.totalPaginasApi = res.total_pages;
    this.actualizarMostrar();
  });
}

  // Mapea los IDs de TMDB a nombres de género
  nombreGeneroPorId(id: number): string {
    const generos: any = {
      28: 'Action',
      35: 'Comedy',
      18: 'Drama',
      27: 'Horror',
      878: 'Science Fiction',
      10749: 'Romance',
      16: 'Animation'
    };
    return generos[id] || 'Otro';
  }

  // Combina locales y API
  actualizarMostrar() {
    this.peliculasMostrar = [...this.peliculas, ...this.peliculasApi];
  }


  seccionActual: 'peliculas' | 'series' | 'seriesAnimadas' = 'peliculas';
  resultados: any[] = []; // Para guardar los resultados de búsqueda o filtro

  // Buscador
buscar(query: string) {
  query = query.trim().toLowerCase();
  if (!query) return;

  switch (this.seccionActual) {

    case 'peliculas':
      this.peliculasService.getPeliculasLocales().subscribe((p: any[]) => {
        this.resultados = p.filter(
          x => x.titulo.toLowerCase().includes(query)
        );
      });
      break;

    case 'series':
      this.apiService.buscarSeries(query, 'tv').subscribe((res: any) => {
        this.resultados = res.results.map((p: any) => ({
          id: p.id,
          titulo: p.title || p.name,
          imagen: p.poster_path
            ? 'https://image.tmdb.org/t/p/w500' + p.poster_path
            : 'https://via.placeholder.com/500x750?text=Sin+imagen',
          anio: p.release_date?.split('-')[0] || p.first_air_date?.split('-')[0] || 'N/A',
          genero: p.genre_ids?.map((id: number) => this.nombreGeneroPorId(id)).join(', ') || 'Sin especificar',
          esApi: true,
          genre_ids: p.genre_ids // importante para filtrar series animadas
        }));
      });
      break;

    case 'seriesAnimadas':
      this.apiService.buscarSeries(query, 'tv').subscribe((res: any) => {
        this.resultados = res.results
          .filter((x: any) => x.genre_ids?.includes(16)) // solo animadas
          .map((p: any) => ({
            id: p.id,
            titulo: p.title || p.name,
            imagen: p.poster_path
              ? 'https://image.tmdb.org/t/p/w500' + p.poster_path
              : 'https://via.placeholder.com/500x750?text=Sin+imagen',
            anio: p.release_date?.split('-')[0] || p.first_air_date?.split('-')[0] || 'N/A',
            genero: p.genre_ids?.map((id: number) => this.nombreGeneroPorId(id)).join(', ') || 'Sin especificar',
            esApi: true,
            genre_ids: p.genre_ids
          }));
      });
      break;
  }
}

filtrarGenero(genero: string) {
  console.log("Filtrando por género:", genero);

  if (!genero) {
    this.resultados = [];
    return;
  }

  switch(this.seccionActual) {
    case 'peliculas':
      this.peliculasService.getPeliculasLocales().subscribe((p: any[]) => {
        this.resultados = p.filter(x => x.genero.toLowerCase().includes(genero.toLowerCase()));
      });
      break;

    case 'series':
       this.apiService.filtrarPorGenero(genero, 'tv').subscribe((res: any) => {
        this.resultados = res.results.map((p: any) => ({
          id: p.id,
          titulo: p.title || p.name,
          imagen: p.poster_path
            ? 'https://image.tmdb.org/t/p/w500' + p.poster_path
            : 'https://via.placeholder.com/500x750?text=Sin+imagen',
          anio: p.release_date?.split('-')[0] || p.first_air_date?.split('-')[0] || 'N/A',
          genero: p.genre_ids?.map((id: number) => this.nombreGeneroPorId(id)).join(', ') || 'Sin especificar',
          esApi: true,
          genre_ids: p.genre_ids // importante para filtrar series animadas
        }));
      });
      break;

    case 'seriesAnimadas':
  this.apiService.filtrarPorGenero(genero, 'tv').subscribe((res: any) => {
        this.resultados = res.results
          .filter((x: any) => x.genre_ids?.includes(16))
          .map((p: any) => ({
            id: p.id,
            titulo: p.title || p.name,
            imagen: p.poster_path
              ? 'https://image.tmdb.org/t/p/w500' + p.poster_path
              : 'https://via.placeholder.com/500x750?text=Sin+imagen',
            anio: p.release_date?.split('-')[0] || p.first_air_date?.split('-')[0] || 'N/A',
            genero: p.genre_ids?.map((id: number) => this.nombreGeneroPorId(id)).join(', ') || 'Sin especificar',
            esApi: true,
            genre_ids: p.genre_ids
          }));
      });
  break;
  }
}

verDetalle(id: number, tipo: 'local' | 'api' = 'local', tipoApi?: 'movie' | 'tv') {
  if (tipo === 'api') {
    this.router.navigate(['/detalle', tipo, id], { queryParams: { tipoApi: tipoApi || 'movie' } });
  } else {
    this.router.navigate(['/detalle', tipo, id]);
  }
}


toggleModo() {
  this.darkmodeService.toggleMode();
  }

volver() {
  this.router.navigate(['/peliculas'], { replaceUrl: true });
}

}



