import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkmodeService {

  private isDark = true;

  toggleMode() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('light-mode');
  }

  getMode() {
    return this.isDark;
  }
}
