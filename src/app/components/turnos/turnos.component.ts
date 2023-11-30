import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css'],
  animations: [fadeInOut]
})
export class TurnosComponent {
  turnos: any;
  nombresEspecialistas: string[] = [];
  especialidadSeleccionada: string = "";
  especialistaSeleccionado: string = "";
  especialistas: any;
  filtroSeleccionado: string = "";
  especialidades: any;

  constructor(private auth: AuthService, 
              private firestore: FirestoreService,
              ){}

  async ngOnInit() {
    this.firestore.getTurnos().subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);      
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
  

  async manejarEspecialidadSeleccionada(especialidad: string) {
    this.filtroSeleccionado = especialidad;        
    this.firestore.getTurnosPorEspecialidad(especialidad).subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });
  }

  async manejarEspecialistaSeleccionado(especialista: any) {
    this.filtroSeleccionado = `${especialista.nombre} ${especialista.apellido}`;    
    this.firestore.getTurnosPorEspecialista(especialista.id).subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });   
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

  calificarAtencion(turno: any)
  {
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

  async limpiarFiltro(){
    this.filtroSeleccionado = "Nada";
    this.firestore.getTurnos().subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });
  }
}
