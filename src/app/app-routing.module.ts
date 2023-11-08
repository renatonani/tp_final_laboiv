import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { RegistroComponent } from './components/registro/registro.component';
import { EspecialidadesComponent } from './components/especialidades/especialidades.component';
import { LoginComponent } from './components/login/login.component';
import { SeccionUsuariosComponent } from './components/seccion-usuarios/seccion-usuarios.component';

const routes: Routes = [
  { path: '', component: BienvenidaComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'login', component: LoginComponent },
  { path: 'especialidades', component: EspecialidadesComponent },
  { path: 'seccion-usuarios', component: SeccionUsuariosComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
