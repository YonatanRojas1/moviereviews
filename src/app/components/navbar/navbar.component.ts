import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DarkmodeService } from '../../services/darkmode';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {

  constructor(
    public darkmodeService: DarkmodeService,
    private router: Router
  ) {}

  toggleModo() {
    this.darkmodeService.toggleMode();
  }

  irContactos() {
    this.router.navigate(['/contactos']);
  }

  volver() {
  this.router.navigate(['/peliculas'], { replaceUrl: true });
}
}
