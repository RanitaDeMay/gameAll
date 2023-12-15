import { Component, OnInit, ViewChild} from '@angular/core';
import { Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { LoginserviceService } from '../services/loginservice.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { signOut } from 'firebase/auth';
import { ToastController } from '@ionic/angular';

  @Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss', '../../global2.scss'],
  })
  
  export class LoginPage {
    inicioSesionForm: FormGroup;
  
    @ViewChild('email') emailInput: any;
    @ViewChild('contrasena') passwordInput: any;
  
    constructor(
      private renderer: Renderer2, 
      private router: Router,
      private loginService: LoginserviceService,
      private fb: FormBuilder,
      private toast: ToastController
      ) {
        this.inicioSesionForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          contrasena: ['', [Validators.required, Validators.minLength(6)]],
        });
       }
  
      iniciarSesion() {
        if (this.inicioSesionForm.invalid) {
          return;
        }
      
        const email = this.inicioSesionForm.get('email')?.value;
        const password = this.inicioSesionForm.get('contrasena')?.value;
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            this.presentToast('Hola de nuevo, '+user.email).then(() => this.navigateTo('/home'))
          })
          .catch((error) => {
            // Manejar el error de inicio de sesión, puedes mostrar un mensaje al usuario o realizar otras acciones
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Código de error:', errorCode);
            console.error('Mensaje de error:', errorMessage);
          });
      }
    

    changeColorOnMouseOver(event: any) {
      this.renderer.addClass(event.target, 'transition-color');
      this.renderer.setStyle(event.target, 'color', 'green');
    }
    restoreColorOnMouseOut(event: any) {
      this.renderer.removeClass(event.target, 'transition-color');
      this.renderer.removeStyle(event.target, 'color');
    }
    navigateTo(route: string) {
      this.router.navigate([route]);
    }
    swiperSlideChanged(e: any) {
      console.log('changed: ', e);
    }

    async presentToast(mensaje: string) {
      const toast = await this.toast.create({
        message: mensaje,
        duration: 3000,
        position: 'top',
      });
  
      await toast.present();
    }

  }