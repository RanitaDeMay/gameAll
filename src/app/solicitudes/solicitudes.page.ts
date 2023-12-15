import { Component, Renderer2 } from '@angular/core';
import { Observable,of } from 'rxjs';
import { Router } from '@angular/router';
import { Juegos } from '../models/juegos.model';
import { Solicitud } from '../models/solicitud.model';
import { JuegosService } from '../services/juegos.service';
import { ToastController } from '@ionic/angular';
import { getAuth, onAuthStateChanged,signOut } from 'firebase/auth';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss', '../../global2.scss'],
})
export class SolicitudesPage {
  email: string = '';
  nickname: string = '';
  mostrarDiv: boolean = false;
  sesionEncendida = false;
  admin = false;

  solicitudes$: Observable<{ id: string, data: Solicitud }[]>;
  nombreJuegoSolicitado: string = '';
  desarrollador: string = '';
  emailDeSolicitante: string = '';

  juegoForm: FormGroup;
  constructor(
    private formBuilder:FormBuilder,
    private renderer: Renderer2, 
      private router: Router,
      private juegosService: JuegosService,
      private juegosStorage: JuegosService,
      private toastController: ToastController,
      private afStorage: AngularFireStorage,
      private location: Location,
      private firestore: AngularFirestore
  ) {
    this.renderer = renderer;
    this.solicitudes$ = this.juegosService.getSolicitudes();
    this.juegoForm = this.formBuilder.group({
      nombreJuego: ['', Validators.required],
      autor: ['',Validators.required],
      genero: ['',Validators.required],
      imagen: ['',Validators.required],
      lanzamiento: ['',Validators.required],
      sinopsis: ['',Validators.required],
    });
   }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      this.sesionEncendida = !!user;
      this.email = user?.email || '';
      
      if (user) {
        // Usuario autenticado, obtén el nickname desde la colección "usuarios"
        this.firestore.collection('usuarios').doc(this.email).get().subscribe(snapshot => {
          if (snapshot.exists) {
            // El documento existe, actualiza el nickname
            this.nickname = (snapshot.data() as SolicitudesPage | undefined)?.nickname || '';
            this.admin = (snapshot.data() as SolicitudesPage | undefined)?.admin || false;
            //console.log(this.admin);
          } else {
            // El documento no existe, podrías manejar esto de acuerdo a tus necesidades
            console.error('El documento de usuario no existe en la colección "usuarios".');
          }
        });
      }

    })//epa
  }
  fechaLanzamiento(lanzamiento: string): Date {
    let fecha = new Date(lanzamiento);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha;
  }
  formatoNombreImagen(imagen: string, imagenOriginal:string): string {
    let formato = imagenOriginal.split('.').pop();
    let minusculas = imagen.toLocaleLowerCase();
    let nombreImagen = minusculas.replace(/ /g, "_");
    return nombreImagen+'.'+formato;
  }
  seleccionarSolicitud(solicitud: Solicitud) {
    this.nombreJuegoSolicitado = solicitud.juego;
    this.desarrollador = solicitud.desarrollador;
    this.emailDeSolicitante = solicitud.email;

    this.juegoForm.controls['nombreJuego'].setValue(this.nombreJuegoSolicitado);
    this.juegoForm.controls['autor'].setValue(this.desarrollador);
  }

  async saveJuego() {
    try {
      if (!this.juegoForm.valid) {
        console.log(this.juegoForm.value);
        return;
      }
  
      const nombreJuego = this.juegoForm.get('nombreJuego')?.value;
      const imagenFile = this.getFile() as File;
      const imagenNombre = this.juegoForm.get('imagen')?.value;
      const nombreImagen = this.formatoNombreImagen(this.juegoForm.get('nombreJuego')?.value, this.juegoForm.get('imagen')?.value);
  
      const juego: Juegos = {
        nombreJuego,
        autor: this.juegoForm.get('autor')?.value,
        genero: this.juegoForm.get('genero')?.value,
        imagen: nombreImagen,
        lanzamiento: this.fechaLanzamiento(this.juegoForm.get('lanzamiento')?.value),
        sinopsis: this.juegoForm.get('sinopsis')?.value,
      };
  
      // Subir la imagen a Firebase Storage
      const storageRef = this.afStorage.ref(`juegos/${nombreImagen}`);
      const uploadTask = storageRef.put(imagenFile);
      const snapshot = await uploadTask;

      this.juegosService.addJuego(juego);
      const toast = await this.toastController.create({
        message: 'Juego guardado',
        duration: 3000,
        position: 'middle',
      });
      toast.present();
      
      this.navigateTo('/explorar');
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  aceptarSolicitud(email:string, id:string){
    console.log(id);
    console.log(email);
    //this.sendEmailService.enviarCorreo(solicitud?.email,"Solicitud aceptada","Tu solicitud ha sido aceptada");
    //this.juegosService.borrarSolicitud(solicitud?.id);
  }
  
  eliminarSolicitud(id : string | undefined){
    this.juegosService.borrarSolicitud(id);
  }
  getFile(): File | null {
    const fileInput = document.getElementById('imagenID') as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      return fileInput.files[0];
    }
    return null;
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

  formatearFecha(lanzamiento: any): string {
    if (!lanzamiento) {
      return 'N/A'; // O algún valor predeterminado
    }
  
    // Convertir a objeto Date
    const fecha = lanzamiento.toDate();
  
    // Obtener año, mes y día
    const año = fecha.getFullYear().toString();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Sumamos 1 porque los meses comienzan desde 0
    const dia = fecha.getDate().toString().padStart(2, '0');
  
    // Formatear la cadena con el formato deseado
    return `${año}-${mes}-${dia}`;
  }

}
