import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-especialidades',
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent implements OnInit{
  especialidades: any;
  nuevaEspecialidad: string = '';

  @Output() especialidadSeleccionada = new EventEmitter<string>();
  
  constructor(private firestore:FirestoreService){}

  async ngOnInit()
  {
    this.especialidades = await this.firestore.getEspecialidades();
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
