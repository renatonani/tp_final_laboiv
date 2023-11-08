import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'clinica';

  constructor(public auth: AuthService,
              private router : Router){}

  cerrarSesion()
  {    
    this.auth.logOut();
    this.router.navigateByUrl("/bienvenida");
  }
}
