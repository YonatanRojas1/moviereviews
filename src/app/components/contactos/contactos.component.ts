import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contactos.html',
  styleUrls: ['./contactos.scss']
})
export class ContactosComponent {
  nombre: string = '';
  email: string = '';
  mensaje: string = '';
  mensajeEnviado = false;

  enviarFormulario() {
    if (this.nombre && this.email && this.mensaje) {
      // Aquí puedes integrar un servicio real para enviar el mensaje
      this.mensajeEnviado = true;

      // Limpiar formulario
      this.nombre = '';
      this.email = '';
      this.mensaje = '';
    }
    
    console.log('Formulario enviado:', {
      nombre: this.nombre,
      email: this.email,
      mensaje: this.mensaje
    });

    alert('¡Mensaje enviado con éxito!');
    this.nombre = '';
    this.email = '';
    this.mensaje = '';
  }



}
