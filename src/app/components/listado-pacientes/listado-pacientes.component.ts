import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-listado-pacientes',
  templateUrl: './listado-pacientes.component.html',
  styleUrls: ['./listado-pacientes.component.css']
})
export class ListadoPacientesComponent implements OnInit{
  @Input() pacientes: any;
  @Output() pacienteSeleccionado = new EventEmitter<string>();

  constructor(private firestore: FirestoreService){}

  async ngOnInit(): Promise<void> 
  {
    
  }

  seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado.emit(paciente);
  }
}
