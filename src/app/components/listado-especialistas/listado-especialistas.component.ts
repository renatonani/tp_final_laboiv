import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-listado-especialistas',
  templateUrl: './listado-especialistas.component.html',
  styleUrls: ['./listado-especialistas.component.css']
})
export class ListadoEspecialistasComponent {

  @Input() especialistas: any;
  @Output() especialistaSeleccionado = new EventEmitter<string>();

  seleccionarEspecialidad(especialista: any) {
    this.especialistaSeleccionado.emit(especialista);
  }
}
