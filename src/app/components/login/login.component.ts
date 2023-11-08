import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  usuario: any;
  contrasena: any;
  admins: any;
  especialistas: any;
  constructor(private auth : AuthService, private router : Router, 
              private firestore : FirestoreService){}


  async ngOnInit()
  {
    this.admins = await this.firestore.getAdmins();
    this.especialistas = await this.firestore.getEspecialistas();
  }
  
  autocompletarAdmin() {
    this.usuario = "renatonani1@gmail.com";
    this.contrasena = '123456';
  }

  autocompletarEmpleado() {
    this.usuario = 'renatonani2@gmail.com';
    this.contrasena = '123456';
  }

  async logIn()
  {
    if(this.usuario != null && this.contrasena != null)
    {
      try {
        const userCredential = await this.auth.logIn(
          this.usuario,
          this.contrasena
        );        
        if (userCredential.user) {
          // Autenticación exitosa, redirige al usuario a la página principal
          this.admins.forEach(async (admin: any) => {
            if(admin.id == userCredential.user?.uid)
            {
              this.auth.logeado = true;
              this.auth.admin = true;
              this.auth.usuario = await this.firestore.getUserById(admin.id, "admins");
              this.router.navigate(['/bienvenida']);              
            }
          });
          if(userCredential.user.emailVerified)
          {
            let banderaEspecialista = false;
            this.especialistas.forEach(async (especialista: any) => {
              if(especialista.id == userCredential.user?.uid)
              {
                if(especialista.acceso)
                {
                  this.auth.logeado = true;
                  this.auth.usuario = await this.firestore.getUserById(especialista.id, "especialistas");
                  this.router.navigate(['/bienvenida']);
                  console.log("hola")
                }
                else{
                  banderaEspecialista = true;
                  Swal.fire({
                    icon: 'warning',
                    title: 'Un administrador debe aprobar tu cuenta',
                    text: "Por favor espera a que un administrador revise y otorgue acceso a tu cuenta.",
                    timer: 0,
                  });
                }
              }
            });
            if(banderaEspecialista == false)
            {
              this.auth.logeado = true;
              this.auth.usuario = await this.firestore.getUserById(userCredential.user.uid, "pacientes");
              this.router.navigate(['/bienvenida']);
            }
          }
          else{
            if(!this.auth.admin)
            {
              Swal.fire({
                icon: 'warning',
                title: 'Debes verificar tu correo para poder ingresar',
                text: "Por favor revisa tu casilla de correo electrónico para verificar tu correo.",
                timer: 2000,
              });
            }
          }
        }     
        
      } catch (error:any) {
        // Autenticación fallida, muestra un mensaje de error al usuario
        Swal.fire({
          icon: 'error',
          title: '¡Datos inválidos!',
          text: "",
          timer: 2000,
        });
      }      
    }   
    else{
      Swal.fire({
        icon: 'error',
        title: '¡Complete los campos!',
        text: "",
        timer: 2000,
      });
    }   
  }
}
