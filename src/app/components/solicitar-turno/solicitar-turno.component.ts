import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.css'],
  animations: [fadeInOut]
})
export class SolicitarTurnoComponent implements OnInit {
  
  especialidadSeleccionada: any;
  mostrarBoton = false;
  especialistas : any;
  fechasProximos15Dias: Date[] = [];
  horarios: any;
  diaSeleccionado: any;
  especialistaSeleccionado: any;
  horarioSeleccionado: any;
  usuario: any;
  admin: any;
  pacienteSeleccionado: any;
  turnos: any;
  mensajeSabados: string = "";
  pacientes: any;
  especialidades: any;

  constructor(private formBuilder : FormBuilder,
    private firestore : FirestoreService,
    private auth : AuthService,
    private router : Router)
  {
    this.generarFechasProximos15Dias();
    this.usuario = this.auth.usuario;
    this.admin = this.auth.admin;
    
  }

  async ngOnInit() {    
    this.firestore.getTurnos().subscribe((turnos) => {
      this.turnos = turnos;
      
    });
    this.especialidades = await this.firestore.getEspecialidades();
    if(this.auth.admin)
    {
      this.pacientes = await this.firestore.getPacientes();
    }
  }

  async manejarEspecialidadSeleccionada(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.diaSeleccionado = "";
    this.especialistaSeleccionado = "";
    this.especialistas = await this.firestore.getEspecialistasPorEspecialidad(this.especialidadSeleccionada);
  }

  async manejarEspecialistaSeleccionado(especialista: any) {
    this.especialistaSeleccionado = especialista;  
    this.diaSeleccionado = "";  
  }

  manejarPacienteSeleccionado(paciente: any){
    this.pacienteSeleccionado = paciente;
  }

  generarFechasProximos15Dias() {
    this.fechasProximos15Dias = [];  // Limpia el array antes de generar nuevas fechas
  
    for (let i = 1; this.fechasProximos15Dias.length < 15; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
  
      // Si es domingo, incrementa la fecha hasta llegar a un día no domingo
      while (fecha.getDay() === 0) {
        fecha.setDate(fecha.getDate() + 1);
      }
  
      // Verifica si la fecha ya está presente en el array
      if (!this.fechasProximos15Dias.some(fechaExistente => this.sonFechasIguales(fechaExistente, fecha))) {
        this.fechasProximos15Dias.push(new Date(fecha));
      }
    }
  }
  
  // Función para comparar dos fechas y verificar si son iguales (misma fecha)
  sonFechasIguales(fecha1: Date, fecha2: Date): boolean {
    return (
      fecha1.getDate() === fecha2.getDate() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getFullYear() === fecha2.getFullYear()
    );
  }
  
  generarHorarios(turno : string, esSabado: boolean): string[] {
    const horarios: string[] = [];    
    let horaInicio = turno == "tarde" ? 14 : 8;
    let horaFin = turno == "tarde" ? 19 : 12;
    this.mensajeSabados = "";
    this.horarioSeleccionado = "";    
    if(turno == "tarde" && esSabado)
    {
      this.mensajeSabados = "Este especialista no atiende los sábados."
    }
    else{
      for (let hora = horaInicio; hora < horaFin; hora++) {
        for (let minutos = 0; minutos < 60; minutos += 30) {
          let horaString = hora < 10 ? `0${hora}` : `${hora}`;
          let minutosString = minutos === 0 ? '00' : '30';
          let tiempo = `${horaString}:${minutosString}`;
    
          // Verificar si existe un turno para el día, especialista y horario actuales
          const turnoExistente = this.turnos.some((turno: { especialistaID: any; dia: any; horario: any; }) =>
            turno.especialistaID === this.especialistaSeleccionado.id &&
            turno.dia === this.diaSeleccionado &&
            turno.horario === tiempo
          );
    
          // Si no hay un turno existente, agregar el tiempo a la lista de horarios
          if (!turnoExistente) {
            horarios.push(tiempo);
          }
        }
      }
    }
  
    return horarios;
  } 

  generarHorarios2(fecha: Date)
  {    
    const dia = fecha.getDate().toString().padStart(2, '0'); // Obtiene el día y agrega un '0' si es necesario
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes y agrega un '0' si es necesario
    const anio = fecha.getFullYear();
    this.diaSeleccionado = `${dia}/${mes}/${anio}`;
    console.log(this.diaSeleccionado)
    let esSabado = fecha.getDay() === 6;
    console.log(esSabado)
    this.horarios = this.generarHorarios(this.especialistaSeleccionado.turno, esSabado);
  }

  seleccionarHorario(horarioSeleccionado: string) {
    this.horarioSeleccionado = horarioSeleccionado;
    console.log(this.horarioSeleccionado)
  }

  solicitarTurno(pacienteID = this.usuario.id)
  {
    let turno = {
      pacienteID: pacienteID,
      dia: this.diaSeleccionado,
      horario: this.horarioSeleccionado,
      especialistaID: this.especialistaSeleccionado.id,
      estado: "pendiente",
      especialidad: this.especialidadSeleccionada
    }
    console.log(turno)
    this.firestore.saveTurno(turno);
    Swal.fire({
      icon: 'success',
      title: 'Turno registrado con éxito',
      text: "",
      timer: 0,
    });
    this.router.navigateByUrl("/bienvenida")
  }

  formatoFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }
}
