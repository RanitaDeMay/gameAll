import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JuegoResenaPage } from './juego-resena.page';
const routes: Routes = [
  {
    path: 'juego-resena/:nombreJuego', component: JuegoResenaPage
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JuegoResenaPageRoutingModule {}
