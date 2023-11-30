import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.css'],
  animations: [fadeInOut]
})
export class MisTurnosComponent implements OnInit {

  turnos: any;
  especialistas: any;
  especialidades: any;
  termineBusqueda: string = '';


  constructor(private auth: AuthService, private firestore: FirestoreService) {}

  async ngOnInit() {
    this.firestore.getTurnosPorPaciente(this.auth.usuario.id).subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          await this.cargarHistoriaClinica(turno);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });    

    // Mover el resto del código aquí o ajustarlo según sea necesario
    this.especialistas = await this.firestore.getEspecialistas();
    this.especialidades = await this.firestore.getEspecialidades();
  }

  formatJSON(json: any): string {
    if (!json) {
      return 'No cargada';
    }
  
    const formatKeyValue = (key: string, value: any): string => {
      // Excluye la clave "pacienteID"
      if (key === 'pacienteID') {
        return '';
      }
  
      if (Array.isArray(value)) {
        // Si el valor es una lista, formatea cada elemento de la lista
        const formattedList = value.map(item => this.formatJSON(item)).join(', ');
        return `${key}: [${formattedList}]`;
      } else if (typeof value === 'object') {
        // Si el valor es un objeto, formatea cada clave-valor del objeto
        const formattedObject = Object.keys(value).map(k => formatKeyValue(k, value[k])).join(', ');
        return `${key}: {${formattedObject}}`;
      } else {
        // Para otros tipos de valores, simplemente retorna la representación de cadena
        return `${key}: ${value}`;
      }
    };
  
    // Formatea cada clave-valor del objeto principal
    return `{${Object.keys(json).map(key => formatKeyValue(key, json[key])).filter(Boolean).join(', ')}}`;
  }
  


  async cancelarTurno(turno: any) {
    const { value: motivo } = await Swal.fire({
      title: 'Ingrese el motivo de la cancelación',
      input: 'text',
      inputLabel: 'Motivo',
      inputPlaceholder: 'Ingrese aquí...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No cancelar',
    });
  
    if (motivo) {
      await this.firestore.cancelarTurno(turno.id, 'cancelado', motivo);
      Swal.fire('Cancelado', 'El turno ha sido cancelado correctamente', 'success');
    }
  }

  verResenia(turno: any) {
    // Muestra la reseña utilizando SweetAlert2
    Swal.fire({
      title: 'Reseña del turno',
      html: `<p>${turno.resenia}</p>`,
      confirmButtonText: 'Cerrar',
      width: 600,
    });
  }

  completarEncuesta(turno: any) {
    // Define las preguntas de la encuesta
    const preguntas = [
      '¿Fue puntual el especialista en el inicio de la consulta?',
      '¿Se sintió cómodo durante la atención?',
      '¿Recibió la información que necesitaba durante el turno?',
      // Agrega más preguntas según tus necesidades
    ];
  
    // Crea un objeto para almacenar las respuestas del usuario
    const respuestas: any = {};
  
    // Función para mostrar la siguiente pregunta
    const mostrarSiguientePregunta = (index: number) => {
      Swal.fire({
        title: 'Encuesta de Experiencia',
        text: preguntas[index],
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      }).then((result) => {
        if (result.isConfirmed) {
          respuestas[preguntas[index]] = true;
        } else {
          respuestas[preguntas[index]] = false;
        }
  
        // Si hay más preguntas, muestra la siguiente
        if (index < preguntas.length - 1) {
          mostrarSiguientePregunta(index + 1);
        } else {
          // Cuando se responden todas las preguntas, muestra un resumen y permite enviar la encuesta
          Swal.fire({
            title: 'Encuesta terminada',            
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            cancelButtonText: 'Cancelar',
            icon: 'success',

            preConfirm: () => {
              return Promise.resolve();
            },
          }).then(async (enviado) => {
            if (enviado.isConfirmed) {
              await this.firestore.encuestaTurno(turno.id, respuestas);
            }
          });
        }
      });
    };
  
    // Comienza mostrando la primera pregunta
    mostrarSiguientePregunta(0);
  }

  calificarAtencion(turno: any) {
    Swal.fire({
      title: 'Calificar Atención',
      input: 'text',
      inputLabel: 'Breve texto de calificación',
      inputPlaceholder: 'Ingresa tu calificación...',
      showCancelButton: true,
      confirmButtonText: 'Calificar',
      cancelButtonText: 'Cancelar',
      preConfirm: (calificacion) => {
        // Puedes realizar acciones adicionales aquí, si es necesario
        return calificacion;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Aquí puedes hacer algo con la calificación ingresada por el usuario
        const calificacionIngresada = result.value;
        // Puedes enviar la calificación a tu servicio o realizar otras acciones
        await this.firestore.atencionTurno(turno.id,calificacionIngresada);
        Swal.fire('Atención registrada', 'El comentario respecto a la atención a sido registrado', 'success');
      }
    });
  }

  async limpiarFiltro() {
    this.termineBusqueda = '';
  }

  async cargarHistoriaClinica(turno: any): Promise<void> {
    if (turno.historiaClinica !== false) {
      turno.historiaClinicaData = await this.firestore.getHistoriaClinicaPorId(turno.historiaClinica);
    }
  }
}

@Pipe({
  name: 'filtroTurnos'
})
export class FiltroTurnosPipe implements PipeTransform {
  transform(turnos: any[], termineBusqueda: string): any[] {
    if (!termineBusqueda) {
      return turnos;
    }

    termineBusqueda = termineBusqueda.toLowerCase();

    return turnos.filter(turno => {
      // Personaliza las condiciones según tus necesidades
      return (
        turno.dia.toLowerCase().includes(termineBusqueda) ||
        turno.horario.toLowerCase().includes(termineBusqueda) ||
        (turno.especialista?.nombre.toLowerCase().includes(termineBusqueda) ||
          turno.especialista?.apellido.toLowerCase().includes(termineBusqueda)) ||
        turno.especialidad.toLowerCase().includes(termineBusqueda) ||
        // Agrega más condiciones según tus campos
        // ...
        // Incluye la búsqueda en la historia clínica
        (turno.historiaClinicaData &&
          JSON.stringify(turno.historiaClinicaData).toLowerCase().includes(termineBusqueda))
      );
    });
  }
}
