import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Especialista } from 'src/app/clases/especialista';
import { Paciente } from 'src/app/clases/paciente';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  regForm : FormGroup;
  regForm2 : FormGroup;
  tipoRegistro: 'paciente' | 'especialista' = 'paciente';
  paciente : Paciente;
  especialista: Especialista;
  especialidadSeleccionada: string = '';

  constructor(private formBuilder : FormBuilder,
              private firestore : FirestoreService,
              private auth : AuthService){

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

  manejarEspecialidadSeleccionada(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
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
      if(this.regForm.valid && this.paciente.foto1 != "" && this.paciente.foto2 != "")
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
      console.log(this.regForm2.controls)
      console.log(this.especialista.foto1)
      if(this.regForm2.valid && this.especialidadSeleccionada && this.especialista.foto1 != "")
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
}
