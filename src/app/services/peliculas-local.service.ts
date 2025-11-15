import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeliculasService {

  private localUrl = '/assets/data/peliculas.json';

  constructor(private http: HttpClient) {}

  getPeliculasLocales(): Observable<any[]> {
    return this.http.get<any[]>(this.localUrl);
  }
}
