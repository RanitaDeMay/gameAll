import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExplorarPageRoutingModule } from './explorar-routing.module';
import { ExplorarPage } from './explorar.page';
//import { HeaderComponent } from '../components/header/header.component';
// Import SharedModule
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExplorarPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ExplorarPage]
})
export class ExplorarPageModule {}