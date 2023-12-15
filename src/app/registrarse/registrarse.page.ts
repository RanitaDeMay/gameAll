import { Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginserviceService } from '../services/loginservice.service';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { AngularFirestore } from '@angular/fire/compat/firestore';



@Component({
  selector: 'app-registrarse',
  templateUrl: './registrarse.page.html',
  styleUrls: ['./registrarse.page.scss', '../../global2.scss'],
})

export class RegistrarsePage {
  registroForm: FormGroup;

  @ViewChild('email') emailInput: any; // Cambia 'emailInput' por el nombre de tu input de correo
  @ViewChild('contrasena') passwordInput: any; // Cambia 'passwordInput' por el nombre de tu input de contraseña
  @ViewChild('contrasenaConfirm') confirmPasswordInput: any; // Cambia 'confirmPasswordInput' por el nombre de tu input de confirmación de contraseña
  @ViewChild('nickname') nicknameInput: any;

  constructor(
    private renderer: Renderer2, 
    private router: Router,
    private loginService: LoginserviceService,
    private fb: FormBuilder,
    private toast: ToastController,
    private angularFireStore: AngularFirestore
    ) {
      this.registroForm = this.fb.group({ // Inicializa el formulario aquí
        email: ['', [Validators.required, Validators.email]],
        contrasena: ['', [Validators.required, Validators.minLength(6)]],
        contrasenaConfirm: ['', Validators.required],
        nickname: ['', Validators.required]
      });
     }

  registrarUsuario() {
    if (this.registroForm.invalid) {
      return;
    }
  
    const email = this.registroForm.get('email')?.value;
    const nickname = this.registroForm.get('nickname')?.value;
    const password = this.registroForm.get('contrasena')?.value;
    const confirmPassword = this.registroForm.get('contrasenaConfirm')?.value;
  
    if (password !== confirmPassword) {
      console.error("Las contraseñas no coinciden");
      return;
    }
    const usuariosAlmacenados = this.angularFireStore.collection('usuarios').doc(email);
    usuariosAlmacenados.get().subscribe((doc) => {
      if(doc.exists) {
        console.error("El correo ya se encuentra registrado");
      } else {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Manejar el registro exitoso
        const user = userCredential.user;
        this.angularFireStore.collection('usuarios').doc(email).set({
          email: user.email,
          nickname: nickname,
          admin: false,
        })
        this.presentToast('¡Cuenta creada con éxito!').then(() => this.navigateTo('/login'))
      })
      .catch((error) => {
        // Manejar el error
        const errorCode = error.code;
        const errorMessage = error.message;
      });
      }
    })
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