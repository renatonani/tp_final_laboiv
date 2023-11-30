import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeInOut } from 'src/app/app.animations';
import { Admin } from 'src/app/clases/admin';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { first, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-seccion-usuarios',
  templateUrl: './seccion-usuarios.component.html',
  styleUrls: ['./seccion-usuarios.component.css'],
  animations: [fadeInOut]
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
        const userAdmin = await this.auth.getCurrentUser();
        const userCredential = await this.auth.register(this.admin.mail, this.admin.password);
        console.log(await this.firestore.saveAdmin(this.admin, userCredential.user?.uid || ""));
        this.auth.updateCurrentUser(userAdmin);
        this.admins = await this.firestore.getAdmins();
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
    async onAccessClick(especialista:any, access : boolean)
    {
      await this.firestore.darAccesoEspecialista(especialista, access);
      if(access)
      {
        Swal.fire({
          icon: 'success',
          title: `¡${especialista.nombre} ha sido aceptado con éxito!`,
          text: "",
          timer: 2000,
        });
      }
      else{
        Swal.fire({
          icon: 'warning',
          title: `¡${especialista.nombre} ya no tendrá acceso!`,
          text: "",
          timer: 2000,
        });
      }
      
      this.especialistas = await this.firestore.getEspecialistas();  
    }

    async generarYDescargarExcel(paciente: any) {
      try {
        // Obtener los turnos y esperar a que la operación se complete
        const turnos = await firstValueFrom(this.firestore.getTurnosPorPaciente(paciente.id));
    
        // Transformar los datos para incluir solo la información deseada
        const datosParaExcel = [];
    
        for (const turno of turnos) {
          turno.especialista = await this.firestore.getEspecialistaPorID(turno.especialistaID);
          await this.cargarHistoriaClinica(turno);
    
          // Crear un nuevo objeto con la información deseada
          const nuevoTurno: NuevoTurno = {
            Fecha: turno.dia,
            Horario: turno.horario,
            Especialista: `${turno.especialista.nombre} ${turno.especialista.apellido}`,
            Especialidad: turno.especialidad,
            Peso: turno.historiaClinicaData?.peso || '',
            Altura: turno.historiaClinicaData?.altura || '',
            Presion: turno.historiaClinicaData?.presion || '',
            Temperatura: turno.historiaClinicaData?.temperatura || '',
            Estado: turno.estado,
            DatosDinamicos: [],
          };
    
          // Verificar y procesar datos dinámicos
          if (Array.isArray(turno.historiaClinicaData?.datosDinamicos)) {
            turno.historiaClinicaData?.datosDinamicos.forEach((entrada: any, index: any) => {
              if (entrada && typeof entrada === 'object') {
                const datosDinamicos: { [clave: string]: any } = {};
                Object.entries(entrada).forEach(([key, value]: [string, any]) => {
                  // Solo agregar si el valor no está vacío
                  if (value !== '' && value !== null && value !== undefined) {
                    datosDinamicos[`DatoDinamico${index}_${key}`] = value;
                  }
                });

                // Extender nuevoTurno con datosDinamicos si hay datos
                if (Object.keys(datosDinamicos).length > 0) {
                  Object.assign(nuevoTurno, datosDinamicos);
                }
              } else {
                console.error(`Datos dinámicos no son un objeto en el turno ${turno.id}:`, entrada);
              }
            });
          } else {
            console.error(`Datos dinámicos no son un array en el turno ${turno.id}:`, turno.historiaClinicaData?.datosDinamicos);
          }
          // Console.log para depurar
          console.log('Nuevo turno:', nuevoTurno);
    
          // Al final del bucle for:
          datosParaExcel.push(nuevoTurno);
        }
    
        // Console.log para depurar (fuera del bucle)
        console.log('Datos para Excel:', datosParaExcel);
    
        // Crear una hoja de trabajo y asignarle los datos transformados
        const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    
        const excelBuffer = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
    
        saveAs(
          new Blob([excelBuffer]),
          `${paciente.nombre}${paciente.apellido}_historias_clinicas.xlsx`
        );
      } catch (error) {
        // Manejo de errores
        console.error('Error al obtener los turnos:', error);
      }
    }
    
    

    async cargarHistoriaClinica(turno: any): Promise<void> {
      if (turno.historiaClinica !== false) {
        turno.historiaClinicaData = await this.firestore.getHistoriaClinicaPorId(turno.historiaClinica);
      }
    }
    
}

interface NuevoTurno {
  Fecha: any;
  Horario: any;
  Especialista: string;
  Especialidad: any;
  Peso: any;
  Altura: any;
  Presion: any;
  Temperatura: any;
  Estado: any;
  DatosDinamicos?: Array<{ [clave: string]: any }>;
}