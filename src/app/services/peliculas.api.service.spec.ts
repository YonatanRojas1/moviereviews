import { TestBed } from '@angular/core/testing';

import { PeliculasApiService } from './peliculas.api.service';

describe('PeliculasApiService', () => {
  let service: PeliculasApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PeliculasApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
