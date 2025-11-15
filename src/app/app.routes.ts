import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactosComponent } from './components/contactos/contactos.component';
import { DetalleComponent } from './pages/detalle/detalle.component'; 


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contactos', component: ContactosComponent },
  { path: 'detalle/:tipo/:id', component: DetalleComponent },
  { path: '**', redirectTo: '' }
];


