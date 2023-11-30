import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Especialista } from 'src/app/clases/especialista';
import { Paciente } from 'src/app/clases/paciente';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { fadeInOut, slideInUp } from 'src/app/app.animations';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
  animations: [slideInUp]
})
export class RegistroComponent implements OnInit{

  regForm : FormGroup;
  regForm2 : FormGroup;
  tipoRegistro: string = '';
  paciente : Paciente;
  especialista: Especialista;
  especialidadSeleccionada: string = '';
  especialidades: any;
  captcha: boolean = false;
  constructor(private formBuilder : FormBuilder,
              private firestore : FirestoreService,
              private auth : AuthService,
              private router : Router){

    this.regForm = this.formBuilder.group({
      nombre: ['',[ Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.max(99)]],
      DNI: ['', [Validators.required, Validators.max(47000000)]],
      obraSocial: ['', [Validators.required]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      foto1: ['', []],
      foto2: ['', []],
    });

    this.regForm2 = this.formBuilder.group({
      nombre: ['',[ Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required , Validators.max(99)]],
      DNI: ['', [Validators.required , Validators.max(47000000)]],
      especialidad: ['', []],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      foto1: ['', []],     
    });
    this.paciente = new Paciente(
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    );
    this.especialista = new Especialista(
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",      
    );
    
  }


  async ngOnInit(): Promise<void> {
    this.especialidades = await this.firestore.getEspecialidades();
  }
  manejarEspecialidadSeleccionada(especialidad: string) {
    if (this.especialidadSeleccionada === '') {
      this.especialidadSeleccionada = especialidad;
    } else {
      if (!this.especialidadSeleccionada.includes(especialidad)) {
        this.especialidadSeleccionada += ", " + especialidad;
      }
    }   
  }
  
  onFileSelected(event: any) 
  {
    const file = event.target.files[0];
    if (file) 
    {
      const reader = new FileReader();

      reader.onload = (e: any) => 
      {
        const base64String = e.target.result;
        this.paciente.foto1 = base64String;        
      };

      reader.readAsDataURL(file);
    }
  }
  onFileSelected2(event: any) 
  {
    const file = event.target.files[0];
    if (file) 
    {
      const reader = new FileReader();

      reader.onload = (e: any) => 
      {
        const base64String = e.target.result;
        this.paciente.foto2 = base64String;        
      };

      reader.readAsDataURL(file);
    }
  }
  onFileSelected3(event: any) 
  {
    const file = event.target.files[0];
    if (file) 
    {
      const reader = new FileReader();

      reader.onload = (e: any) => 
      {
        const base64String = e.target.result;
        this.especialista.foto1 = base64String;        
      };

      reader.readAsDataURL(file);
    }
  }

  setTipoRegistro(tipo: 'paciente' | 'especialista') {
    this.tipoRegistro = tipo;
  }

  async onSubmit() {
    if(this.tipoRegistro == "paciente")
    {
      if(this.regForm.valid && this.captcha && this.paciente.foto1 != "" && this.paciente.foto2 != "")
      {
        try{
          const userCredential = await this.auth.register(this.paciente.mail, this.paciente.password);
          
          this.auth.sendVerificationEmail();
          this.firestore.savePaciente(this.paciente, userCredential.user?.uid || "");
          Swal.fire({
            icon: 'success',
            title: '¡Paciente registrado correctamente!',
            text: "Hemos enviado un correo de verificación a tu dirección de correo electrónico.",
            timer: 0
          });
          this.router.navigateByUrl("/bienvenida")
        }      
        catch(e)
        {
          Swal.fire({
            icon: 'error',
            title: '¡El correo ya está en uso!',
            text: "",
            timer: 2000,
          });        
        }     
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
    else{     
      if(this.regForm2.valid && this.captcha && this.especialidadSeleccionada && this.especialista.foto1 != "")
      {
        const userCredential = await this.auth.register(this.especialista.mail, this.especialista.password);
        this.especialista.especialidad = this.especialidadSeleccionada;
        this.auth.sendVerificationEmail();
        this.firestore.saveEspecialista(this.especialista, userCredential.user?.uid || "");
        Swal.fire({
          icon: 'success',
          title: '¡Especialista registrado correctamente!',
          text: "",
          timer: 2000,
        });
        this.router.navigateByUrl("/bienvenida")
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
  }  
  resolved(event: any)
  {
    this.captcha = true;
  }
}
