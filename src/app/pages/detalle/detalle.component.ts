import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PeliculasService } from '../../services/peliculas-local.service';
import { PeliculasApiService } from '../../services/peliculas.api.service';
import { DarkmodeService } from '../../services/darkmode'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.scss']
})
export class DetalleComponent implements OnInit, AfterViewInit {

  detalle: any;
  tipo: 'local' | 'api' = 'local';
  cargando: boolean = true;
  error: string = '';
  esSerieAnimada: boolean = false;
  trailerUrl?: SafeResourceUrl;
  fondoUrl?: string;
  comentarios: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private peliculasService: PeliculasService,
    private apiService: PeliculasApiService,
    private sanitizer: DomSanitizer,
    public darkmodeService: DarkmodeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const tipoParam = this.route.snapshot.paramMap.get('tipo'); // 'local' | 'api'
    const modo = this.route.snapshot.queryParamMap.get('modo'); // 'tv' | 'anime'

    this.tipo = tipoParam === 'api' ? 'api' : 'local';
    this.esSerieAnimada = modo === 'anime';

    this.cargarDetalle(id);
  }

  ngAfterViewInit(): void {
    const formComentario = document.getElementById("formComentario") as HTMLFormElement;
    const lista = document.getElementById("listaComentarios") as HTMLDivElement;

    formComentario?.addEventListener("submit", (e) => {
      e.preventDefault();
      const nombreInput = document.getElementById("nombre") as HTMLInputElement;
      const comentarioInput = document.getElementById("comentario") as HTMLTextAreaElement;

      const nombre = nombreInput.value.trim();
      const comentario = comentarioInput.value.trim();

      if (nombre && comentario) {
        const fecha = new Date().toLocaleString("es-CO");
        const nuevo = document.createElement("div");
        nuevo.innerHTML = `
          <strong>${nombre}</strong>
          <small class="text-muted ms-2">${fecha}</small>
          <p>${comentario}</p>
          <hr class="bg-secondary">
        `;
        lista?.prepend(nuevo);

        // Guardar localmente
        this.comentarios.unshift({ nombre, comentario, fecha });

        formComentario.reset();
      }
    });
  }

 cargarDetalle(id: string | null) {
  if (!id) {
    this.error = 'ID no proporcionado.';
    this.cargando = false;
    return;
  }

  if (this.tipo === 'local') {
    // 1. Primero busco la película local para obtener su TMDB ID
    this.peliculasService.getPeliculasLocales().subscribe({
      next: (res: any) => {
        const peliculaLocal = res.find((p: any) => p.id == id);
        if (!peliculaLocal) {
          this.error = 'Película local no encontrada.';
          this.cargando = false;
          return;
        }

        // 2. Llamo al API usando el id de TMDB que está en el JSON local
        this.apiService.getDetalleCompleto(+peliculaLocal.id, 'movie').subscribe({
          next: (resApi: any) => {
            // Fusionar con datos locales si quieres (opcional)
            this.detalle = {
              id: resApi.id,
              titulo: resApi.title,
              imagen: resApi.poster_path
                ? `https://image.tmdb.org/t/p/w500${resApi.poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sin+imagen',
              backdrop: resApi.backdrop_path
                ? `https://image.tmdb.org/t/p/original${resApi.backdrop_path}`
                : '',
              anio: resApi.release_date?.split('-')[0] || 'N/A',
              genero: resApi.genres?.map((g: any) => g.name).join(', ') || 'Sin especificar',
              descripcion: resApi.overview,
              puntuacion: resApi.vote_average?.toFixed(1) || 'N/A',
              duracion: resApi.runtime || null,
              trailer: resApi.videos?.results?.find(
                (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
              ),
              reparto: resApi.credits?.cast?.slice(0, 8) || [],
              esAnime: false
            };

            // Fondo y trailer
            this.fondoUrl = this.detalle.backdrop;
            if (this.detalle.trailer) {
              this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                `https://www.youtube.com/embed/${this.detalle.trailer.key}`
              );
            }

            this.cargando = false;
          },
          error: () => {
            this.error = 'Error cargando detalles desde API.';
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.error = 'Error cargando película local.';
        this.cargando = false;
      }
    });

  } else {
    // Serie o serie animada desde API
    this.apiService.getDetalleCompleto(+id, 'tv').subscribe({
      next: (res: any) => {
        this.detalle = {
          id: res.id,
          titulo: res.title || res.name,
          imagen: res.poster_path
            ? `https://image.tmdb.org/t/p/w500${res.poster_path}`
            : 'https://via.placeholder.com/500x750?text=Sin+imagen',
          backdrop: res.backdrop_path
            ? `https://image.tmdb.org/t/p/original${res.backdrop_path}`
            : '',
          anio: res.first_air_date?.split('-')[0] || 'N/A',
          genero: res.genres?.map((g: any) => g.name).join(', ') || 'Sin especificar',
          descripcion: res.overview,
          puntuacion: res.vote_average?.toFixed(1) || 'N/A',
          duracion: res.episode_run_time?.[0] || null,
          trailer: res.videos?.results?.find(
            (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          ),
          reparto: res.credits?.cast?.slice(0, 8) || [],
          esAnime: this.esSerieAnimada
        };

        this.fondoUrl = this.detalle.backdrop;
        if (this.detalle.trailer) {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${this.detalle.trailer.key}`
          );
        }

        this.cargando = false;
      },
      error: () => {
        this.error = 'Error cargando serie desde la API.';
        this.cargando = false;
      }
    });
  }
}

 volver() {
  if (this.tipo === 'local') {
    // Películas locales
    this.router.navigate(['/peliculas'], { replaceUrl: true });
  } else if (this.tipo === 'api') {
    if (this.esSerieAnimada) {
      // Series animadas
      this.router.navigate(['/series'], { queryParams: { modo: 'anime' }, replaceUrl: true });
    } else {
      // Series normales
      this.router.navigate(['/series'], { replaceUrl: true });
    }
  }
}
}