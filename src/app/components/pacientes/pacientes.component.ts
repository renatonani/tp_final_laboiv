import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  ultimosTurnos: any[] = [];
  pacientes: any;
  constructor(private firestore:FirestoreService,
              private auth:AuthService) { }

  async ngOnInit() {
    this.pacientes = await this.firestore.getPacientesParaEspecialista(this.auth.usuario.id);
  }

  async obtenerUltimosTurnos(pacienteID: string) {
    const especialistaID = this.auth.usuario.id; // Ajusta según tus necesidades
  
    try {
      this.ultimosTurnos = await this.firestore.getUltimosTurnosPorEspecialista(especialistaID, pacienteID);
  
      for (const turno of this.ultimosTurnos) {
        turno.paciente = await this.firestore.getPacientePorID(turno.pacienteID);
        await this.cargarHistoriaClinica(turno);
      }
  
      console.log(this.ultimosTurnos);
    } catch (error) {
      console.error('Error al obtener los últimos turnos y pacientes:', error);
    }
  }

  async cargarHistoriaClinica(turno: any): Promise<void> {
    if (turno.historiaClinica !== false) {
      turno.historiaClinica = await this.firestore.getHistoriaClinicaPorId(turno.historiaClinica);
    }
  }
}
