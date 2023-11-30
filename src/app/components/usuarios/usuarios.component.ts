import { Component, OnInit } from '@angular/core';
import { fadeInOut } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
  animations: [fadeInOut]
})
export class UsuariosComponent implements OnInit{


  historias: any;

  constructor(private auth: AuthService,
              private firestore: FirestoreService){}

  ngOnInit() {
    this.firestore.getHistoriasClinicas().subscribe({
      next: async historias => {
        // Aquí obtienes los turnos actualizados
        this.historias = historias;
  
        // Mover el código aquí para asegurar que se ejecuta después de obtener los turnos
        for (const historia of this.historias) {
          historia.paciente = await this.firestore.getPacientePorID(historia.pacienteID);
        }
      },
      error: error => {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    });
  }


}
