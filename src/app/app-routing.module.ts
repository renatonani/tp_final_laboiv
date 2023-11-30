import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { RegistroComponent } from './components/registro/registro.component';
import { EspecialidadesComponent } from './components/especialidades/especialidades.component';
import { LoginComponent } from './components/login/login.component';
import { SeccionUsuariosComponent } from './components/seccion-usuarios/seccion-usuarios.component';
import { SolicitarTurnoComponent } from './components/solicitar-turno/solicitar-turno.component';
import { MisTurnosComponent } from './components/mis-turnos/mis-turnos.component';
import { MisTurnosEspecialistaComponent } from './components/mis-turnos-especialista/mis-turnos-especialista.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { TurnosComponent } from './components/turnos/turnos.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';

const routes: Routes = [
  { path: '', component: BienvenidaComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'especialidades', component: EspecialidadesComponent },
  { path: 'seccion-usuarios', component: SeccionUsuariosComponent },
  { path: 'solicitar-turno', component: SolicitarTurnoComponent },
  { path: 'mis-turnos', component: MisTurnosComponent },
  { path: 'mis-turnos-especialista', component: MisTurnosEspecialistaComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'turnos', component: TurnosComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'estadisticas', component: EstadisticasComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
