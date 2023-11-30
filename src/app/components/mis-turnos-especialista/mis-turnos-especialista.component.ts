import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-mis-turnos-especialista',
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrls: ['./mis-turnos-especialista.component.css'],
  animations: [fadeInOut]
})
export class MisTurnosEspecialistaComponent {
  turnos: any;
  nombresEspecialistas: string[] = [];
  especialidadSeleccionada: string = "";
  especialistaSeleccionado: string = "";
  pacientes: any;
  filtroSeleccionado: string = "";
  especialidades: any;
  termineBusqueda: string = '';

  constructor(private auth: AuthService, 
              private firestore: FirestoreService){}

  async ngOnInit() 
  {      
    this.firestore.getTurnosPorEspecialista(this.auth.usuario.id).subscribe({
      next: async turnos => {
        // Aquí obtienes los turnos actualizados
        this.turnos = turnos;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const turno of this.turnos) {
          turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);
          await this.cargarHistoriaClinica(turno);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });

    this.pacientes = await this.firestore.getPacientes();
    this.especialidades = await this.firestore.getEspecialidadesPorEspecialista(this.auth.usuario.id)
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
      title: 'Ingrese el motivo del rechazo del turno',
      input: 'text',
      inputLabel: 'Motivo',
      inputPlaceholder: 'Ingrese aquí...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'No rechazar',
    });
  
    if (motivo) {
      await this.firestore.cancelarTurno(turno.id, 'rechazado', motivo);
      Swal.fire('Cancelado', 'El turno ha sido rechazado correctamente', 'success');
    }
  }

  async aceptarTurno(turno: any)
  {
    await this.firestore.aceptarTurno(turno.id);
    Swal.fire('Aceptado', 'El turno ha sido aceptado correctamente', 'success');
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

  completarResenia(turno: any)
  {
    Swal.fire({
      title: 'Reseña del turno',
      input: 'text',
      inputLabel: 'Breve texto de reseña',
      inputPlaceholder: 'Ingresa tu reseña...',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
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
        await this.firestore.reseniaTurno(turno.id, calificacionIngresada);
        Swal.fire('Reseña registrada', 'La reseña ha sido registrada correctamente', 'success');
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

  ingresarHistoriaClinica(turno: any) {
    Swal.fire({
      title: 'Ingresar Historia Clínica',
      html:
        '<label for="altura">Altura:</label>' +
        '<input id="altura" class="swal2-input" placeholder="Altura"><br>' +
        '<label for="peso">Peso:</label>' +
        '<input id="peso" class="swal2-input" placeholder="Peso"><br>' +
        '<label for="temperatura">Temperatura:</label>' +
        '<input id="temperatura" class="swal2-input" placeholder="Temperatura"><br>' +
        '<label for="presion">Presión:</label>' +
        '<input id="presion" class="swal2-input" placeholder="Presión"><br>' +
        '<label for="clave1">Clave 1:</label>' +
        '<input id="clave1" class="swal2-input" placeholder="Clave 1"><br>' +
        '<label for="valor1">Valor 1:</label>' +
        '<input id="valor1" class="swal2-input" placeholder="Valor 1"><br>' +
        '<label for="clave2">Clave 2:</label>' +
        '<input id="clave2" class="swal2-input" placeholder="Clave 2"><br>' +
        '<label for="valor2">Valor 2:</label>' +
        '<input id="valor2" class="swal2-input" placeholder="Valor 2"><br>' +
        '<label for="clave3">Clave 3:</label>' +
        '<input id="clave3" class="swal2-input" placeholder="Clave 3"><br>' +
        '<label for="valor3">Valor 3:</label>' +
        '<input id="valor3" class="swal2-input" placeholder="Valor 3">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        // Obtén los valores ingresados por el usuario
        const altura = (document.getElementById('altura') as HTMLInputElement).value;
        const peso = (document.getElementById('peso') as HTMLInputElement).value;
        const temperatura = (document.getElementById('temperatura') as HTMLInputElement).value;
        const presion = (document.getElementById('presion') as HTMLInputElement).value;
        const clave1 = (document.getElementById('clave1') as HTMLInputElement).value;
        const valor1 = (document.getElementById('valor1') as HTMLInputElement).value;
        const clave2 = (document.getElementById('clave2') as HTMLInputElement).value;
        const valor2 = (document.getElementById('valor2') as HTMLInputElement).value;
        const clave3 = (document.getElementById('clave3') as HTMLInputElement).value;
        const valor3 = (document.getElementById('valor3') as HTMLInputElement).value;
  
        // Valida que se ingresen los datos obligatorios, ajusta según tus necesidades
        if (!altura || !peso || !temperatura || !presion) {
          Swal.showValidationMessage('Los primeros 4 campos son obligatorios');
        }
  
        // Devuelve un objeto con los datos ingresados
        return {
          altura,
          peso,
          temperatura,
          presion,
          datosDinamicos: [
            { clave: clave1, valor: valor1 },
            { clave: clave2, valor: valor2 },
            { clave: clave3, valor: valor3 },
          ],
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí puedes hacer algo con los datos ingresados por el usuario
        const historiaClinica = result.value;
        console.log('Historia Clínica ingresada:', historiaClinica);
        this.firestore.guardarHistoriaClinica(this.auth.usuario, turno, historiaClinica);
      }
    });
  }
}

@Pipe({
  name: 'filtroTurnos2'
})
export class FiltroTurnosPipe2 implements PipeTransform {
  transform(turnos: any[], termineBusqueda: string): any[] {
    if (!termineBusqueda) {
      return turnos;
    }

    termineBusqueda = termineBusqueda.toLowerCase();

    return turnos.filter(turno => {
      const pacienteNombreCompleto = `${turno.paciente.nombre} ${turno.paciente.apellido}`.toLowerCase();
      const estadoTurno = turno.estado.toLowerCase();
      const historiaClinicaData = turno.historiaClinicaData
        ? JSON.stringify(turno.historiaClinicaData).toLowerCase()
        : '';

      return (
        turno.dia.toLowerCase().includes(termineBusqueda) ||
        turno.horario.toLowerCase().includes(termineBusqueda) ||
        pacienteNombreCompleto.includes(termineBusqueda) ||
        turno.especialidad.toLowerCase().includes(termineBusqueda) ||
        estadoTurno.includes(termineBusqueda) ||
        historiaClinicaData.includes(termineBusqueda)
      );
    });
  }
}