import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Admin } from 'src/app/clases/admin';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seccion-usuarios',
  templateUrl: './seccion-usuarios.component.html',
  styleUrls: ['./seccion-usuarios.component.css']
})
export class SeccionUsuariosComponent implements OnInit{

  regForm : FormGroup;
  admin : Admin;
  admins : any;
  pacientes : any;
  especialistas : any;

  async ngOnInit() {
    this.admins = await this.firestore.getAdmins();
    this.pacientes = await this.firestore.getPacientes();
    this.especialistas = await this.firestore.getEspecialistas();   

  }
  constructor(private formBuilder : FormBuilder,
              private firestore : FirestoreService,
              private auth : AuthService){

      this.regForm = this.formBuilder.group({
        nombre: ['',[ Validators.required]],
        apellido: ['', [Validators.required]],
        edad: ['', [Validators.required, Validators.max(99)]],
        DNI: ['', [Validators.required, Validators.max(47000000)]],        
        mail: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        foto1: ['', []],        
      });

      this.admin = new Admin(
        "",
        "",
        "",
        "",
        "",
        "",
        "",           
      );
    }

    async onSubmit()
    {
      if(this.regForm.valid && this.admin.foto1 != "")
      {
        const userCredential = await this.auth.register(this.admin.mail, this.admin.password);
                  
        this.firestore.saveAdmin(this.admin, userCredential.user?.uid || "");
        Swal.fire({
          icon: 'success',
          title: '¡Admin registrado correctamente!',
          text: "",
          timer: 2000,
        });
      }
      else{
        Swal.fire({
          icon: 'error',
          title: '¡Faltan datos por completar!',
          text: "",
          timer: 2000,
        });
      }
    }

    onFileSelected3(event : any){
      const file = event.target.files[0];
      if (file) 
      {
        const reader = new FileReader();
  
        reader.onload = (e: any) => 
        {
          const base64String = e.target.result;
          this.admin.foto1 = base64String;        
        };
  
        reader.readAsDataURL(file);
      }
    }
    async onAccessClick(especialista:any)
    {
      await this.firestore.darAccesoEspecialista(especialista);
      Swal.fire({
        icon: 'success',
        title: `¡${especialista.nombre} ha sido aceptado con éxito!`,
        text: "",
        timer: 2000,
      });
      this.especialistas = await this.firestore.getEspecialistas();  
    }
}
