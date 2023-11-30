import { Component, OnInit } from '@angular/core';
import { fadeInOut, slideInUp } from 'src/app/app.animations';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.css'],
  animations: [slideInUp]
})
export class BienvenidaComponent implements OnInit{

  constructor(public auth : AuthService){   
  }

  async ngOnInit(): Promise<void> {
    console.log(this.auth.usuario)
  }
}
