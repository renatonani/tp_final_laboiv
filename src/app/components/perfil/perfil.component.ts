import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import jsPDF from 'jspdf';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  animations: [fadeInOut]
})
export class PerfilComponent implements OnInit{

  usuario: any;
  historias: any;

  constructor(private auth: AuthService,
              private firestore: FirestoreService,
              private sanitizer: DomSanitizer){}

  ngOnInit(){
    this.usuario = this.auth.usuario;
    if(this.usuario.rol=="paciente")
    {
      this.firestore.getHistoriasClinicasPorPaciente(this.auth.usuario.id).subscribe((historias) => {
        this.historias = historias;
        console.log(this.historias);
      });
    }
   
  }

  async cambiarTurno() {
    const nuevoTurno = this.usuario.turno === 'mañana' ? 'tarde' : 'mañana';
  
    try {
      await this.firestore.cambiarTurnoEspecialista(this.usuario.id, nuevoTurno);
      this.usuario.turno = nuevoTurno;
      Swal.fire({
        icon: 'success',
        title: 'Horario cambiado con éxito',
        text: "",
        timer: 0,
      });
    } catch (error) {
      console.error('Error al cambiar el turno', error);
    }
  }

  async descargarHistoriasComoPDF(historias: any[]) {
    const doc = new jsPDF();
  
    // Configuración inicial
    doc.setFontSize(18);
    doc.text('Historia Clínica', doc.internal.pageSize.width / 2, 10, { align: 'center' });
  
    // Agregar la fecha actual
    const fechaActualStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Fecha de Emisión: ${fechaActualStr}`, 10, 20);
  
    // Cargar la imagen desde "assets"
    const imgPath = '../../../assets/especialidad.png'; // Reemplaza con la ruta correcta de tu imagen
    const imgBase64 = await this.getImageBase64(imgPath);
  
    // Agregar la imagen en la esquina superior derecha
    doc.addImage(imgBase64, 'JPEG', doc.internal.pageSize.width - 60, 5, 50, 50);
  
    // Establecer la posición inicial del texto
    let y = 40;
  
    // Iterar sobre las historias y agregar la información al PDF
    historias.forEach((historia, index) => {
      // Verificar si hay espacio suficiente en la página actual
      if (y + 80 + historia.datosDinamicos.length * 10 > doc.internal.pageSize.height - 10) {
        // Si no hay espacio, agregar una nueva página
        doc.addPage();
        y = 10; // Reiniciar la posición vertical
      }
  
      y += 10; // Ajustar el espaciado entre historias
  
      doc.text(`Fecha: ${historia.fecha}`, 10, y);
      doc.text(`Especialista: ${historia.especialista}`, 10, y + 10);
      doc.text(`Altura: ${historia.altura}`, 10, y + 20);
      doc.text(`Peso: ${historia.peso}`, 10, y + 30);
      doc.text(`Temperatura: ${historia.temperatura}`, 10, y + 40);
      doc.text(`Presión: ${historia.presion}`, 10, y + 50);
  
      // Agregar datos dinámicos al PDF
      historia.datosDinamicos.forEach((dato: { clave: string; valor: string; }, i: number) => {
        if (dato.clave !== '' && dato.valor !== '') {
          doc.text(`${dato.clave}: ${dato.valor}`, 10, y + 60 + i * 10);
        }
      });
  
      // Ajustar la posición para la siguiente historia
      y += 80 + historia.datosDinamicos.length * 10;
    });
  
    // Guardar el PDF como un archivo
    doc.save(`${this.auth.usuario.nombre}${this.auth.usuario.apellido}_historia_clinica.pdf`);
  }
  

  private async getImageBase64(imgPath: string): Promise<string> {
    const response = await fetch(imgPath);
    const blob = await response.blob();
    const base64 = await this.blobToBase64(blob);
    return base64;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
