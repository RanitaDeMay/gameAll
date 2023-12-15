import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JuegoResenaPageRoutingModule } from './juego-resena-routing.module';
import { JuegoResenaPage } from './juego-resena.page';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JuegoResenaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [JuegoResenaPage]
})
export class JuegoResenaPageModule {}
