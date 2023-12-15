import { Component, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Resena } from '../models/resena.model';
import { JuegosService } from '../services/juegos.service';
import { ResenaService } from '../services/resena.service';
import { ToastController } from '@ionic/angular';
import { getAuth, onAuthStateChanged,signOut } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss', '../../global2.scss', 'home.page2.scss', 'home.page3.scss'],
})
export class HomePage {
  mostrarDiv: boolean = false;
  sesionEncendida = false;
  admin = false;
  email: string = '';
  nickname: string = '';
  //--------------
  loading = true;
  imagenesJuegosRecientes$: Observable<{ imagen: string, nombre: string }[]>;
  topResena$: Observable<Resena | undefined>;
  
  constructor(
      private renderer: Renderer2, 
      private router: Router,
      private juegosService: JuegosService,
      private juegosStorage: JuegosService,
      private toastController: ToastController,
      private firestore: AngularFirestore,
      private resenaService: ResenaService
    ) {
    this.imagenesJuegosRecientes$ = this.juegosService.getImagenesJuegosRecientes();
    this.topResena$ = this.juegosService.getTopResena();
  }

  ngOnInit() {
    //BLOQUE PARA SABER SI EL USUARIO YA INICIÓ SESIÓN O NO:
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      this.sesionEncendida = !!user;
      this.email = user?.email || '';
      
      if (user) {
        // Usuario autenticado, obtén el nickname desde la colección "usuarios"
        this.firestore.collection('usuarios').doc(this.email).get().subscribe(snapshot => {
          if (snapshot.exists) {
            // El documento existe, actualiza el nickname
            this.nickname = (snapshot.data() as HomePage | undefined)?.nickname || '';
            this.admin = (snapshot.data() as HomePage | undefined)?.admin || false;
            console.log(this.admin);
          } else {
            // El documento no existe, podrías manejar esto de acuerdo a tus necesidades
            console.error('El documento de usuario no existe en la colección "usuarios".');
          }
        });
      }

    })//epa

    this.imagenesJuegosRecientes$ = this.juegosService.getImagenesJuegosRecientes();
    this.imagenesJuegosRecientes$.subscribe(() => {
      this.loading = false; // Cuando las imágenes se cargan, establecer loading a false
    });
  }

  aumentarVotos(id: string | undefined): void {
    console.log(id);
    this.resenaService.aumentarVotos(id);
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
    //console.log('changed: ', e);
  }

  ocultarMostrar() {
    this.mostrarDiv = !this.mostrarDiv;
  }

  cerrarSesion() {
    const auth = getAuth();
    signOut(auth).then(async () => {
      console.log('Sesión cerrada');
      window.location.reload(); // Recarga la página
      const toast = await this.toastController.create({
        message: 'Hasta pronto! ',
        duration: 2000, // Duración de 2 segundos
        position: 'top' // Posición inferior 
      });
      toast.present();
    }).catch((error) => {
      console.log('Error:', error);
    });
    this.ocultarMostrarSesion();
    //this.router.onSameUrlNavigation = 'reload';
  }

  ocultarMostrarSesion() {
    this.mostrarDiv = !this.mostrarDiv;
  }

  navigateToGame(route: string, nombre: string) {
    console.log('enviado: ' + nombre);
    this.router.navigate([route, nombre]);
  }
}

