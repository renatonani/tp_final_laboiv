import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-especialidades',
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent implements OnInit{
  
  nuevaEspecialidad: string = '';

  @Output() especialidadSeleccionada = new EventEmitter<string>();
  @Input() mostrarBotonAgregar: boolean = true; // Variable de entrada para mostrar u ocultar el botón
  @Input() especialidades: any;
  
  constructor(private firestore:FirestoreService){}

  async ngOnInit()
  {
    
  }

  async agregarEspecialidad()
  {
    if(this.nuevaEspecialidad != "")
    {
      this.firestore.saveEspecialidad(this.nuevaEspecialidad);
      this.especialidades = await this.firestore.getEspecialidades();
    }    
  }

  seleccionarEspecialidad(nombre: string) {
    this.especialidadSeleccionada.emit(nombre);
  }
}
