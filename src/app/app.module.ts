import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EspecialidadesComponent } from './components/especialidades/especialidades.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { SeccionUsuariosComponent } from './components/seccion-usuarios/seccion-usuarios.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { ListadoEspecialistasComponent } from './components/listado-especialistas/listado-especialistas.component';
import { ListadoPacientesComponent } from './components/listado-pacientes/listado-pacientes.component';
import { FiltroTurnosPipe, MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { FiltroTurnosPipe2, MisTurnosEspecialistaComponent } from './components/mis-turnos-especialista/mis-turnos-especialista.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { Directiva1Directive } from './directives/directiva1.directive';
import { Directiva2Directive } from './directives/directiva2.directive';
import { Directiva3Directive } from './directives/directiva3.directive';


@NgModule({
  declarations: [
    AppComponent,
    BienvenidaComponent,
    LoginComponent,
    RegistroComponent,
    EspecialidadesComponent,
    SeccionUsuariosComponent,
    SolicitarTurnoComponent,
    ListadoEspecialistasComponent,
    ListadoPacientesComponent,
    MisTurnosComponent,
    MisTurnosEspecialistaComponent,
    PerfilComponent,
    TurnosComponent,
    UsuariosComponent,
    FiltroTurnosPipe,
    FiltroTurnosPipe2,
    PacientesComponent,
    EstadisticasComponent,
    Directiva1Directive,
    Directiva2Directive,
    Directiva3Directive,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    RecaptchaModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
