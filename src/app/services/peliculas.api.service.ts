import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeliculasApiService {
  private apiKey = '3f81034ada4a6c21fdce40d8d8907aaf'; // reemplaza con tu API Key real
  private baseUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getPeliculasPopulares(pagina: number = 1): Observable<any> {
  return this.http.get(`${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=en-US&page=${pagina}`)
  }

  getSeriesPopulares(page: number = 1): Observable<any> {
    return this.http.get(`${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=en-US&page=${page}`);
  }

  getSeriesPorGenero(generoId: string, tipo: 'tv' | 'anime' , page: number = 1): Observable<any> {
    let endpoint = '';
    if (tipo === 'tv') {
      endpoint = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&with_genres=${generoId}&language=en-US&page=${page}`;
    } else if (tipo === 'anime') {
      endpoint = `${this.baseUrl}/discover/tv?api_key=${this.apiKey}&with_genres=16,${generoId}&language=en-US&page=${page}`;
    }
    return this.http.get(endpoint);
  }

getPeliculaDetalle(id: number, tipo: 'movie' | 'tv' = 'movie'): Observable<any> {
  const endpoint = `${this.baseUrl}/${tipo}/${id}?api_key=${this.apiKey}&language=en-US`;
  return this.http.get(endpoint);
}

getDetalleCompleto(id: number, tipo: 'movie' | 'tv') {
  const endpoint = `${this.baseUrl}/${tipo}/${id}?api_key=${this.apiKey}&language=en-US&append_to_response=credits,videos,images`;
  return this.http.get(endpoint);
}

buscarSeries(query: string, tipo: 'tv' | 'anime') {
  const endpoint = tipo === 'anime' || 'tv';  // o tu lógica
  return this.http.get(`https://api.themoviedb.org/3/search/${endpoint}?api_key=${this.apiKey}&query=${query}`);
}
filtrarPorGenero(genero: string, tipo: 'tv' | 'anime') {
  const endpoint = tipo === 'anime' || 'tv' ;  // o tu lógica
  return this.http.get(`https://api.themoviedb.org/3/discover/${endpoint}?api_key=${this.apiKey}&with_genres=${genero}`);
}




}
