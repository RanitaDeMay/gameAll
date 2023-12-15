import { Component, OnInit } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { map, forkJoin, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { JuegosService } from '../services/juegos.service';
import { Juegos } from '../models/juegos.model';
import { Solicitud } from '../models/solicitud.model';
import { Observable } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-explorar',
  templateUrl: './explorar.page.html',
  styleUrls: ['./explorar.page.scss', '../../global2.scss', './explorar.page2.scss'],
})
export class ExplorarPage implements OnInit {
  admin = false;
  //VARIABLES PARA LA SESIÓN
  user: any;
  email: string = '';
  nickname: string = '';
  mostrarFormulario: boolean = false;
  sesionEncendida = false;
  mostrarDiv: boolean = false;
  //-------------
  loading = false;
  juegosFiltrados$?: Observable<any[]>;
  filtro: string = '';
  //BLOQUE NECESARIO PARA LOS JUEGOS
  juegos$: Observable<Juegos[]>;

  //Para solicitud de juego
  public solicitudForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder, 
    private renderer: Renderer2,
    private router: Router,
    private juegosServicios: JuegosService,
    private toastController: ToastController, 
    private firestore: AngularFirestore
    ) {
    this.renderer = renderer;
    this.juegos$ = this.juegosServicios.getJuegos();
    this.juegos$.subscribe(data => console.log(data));
    this.solicitudForm = this.formBuilder.group({
      desarrollador: ['',Validators.required],
      juego: ['',Validators.required],
      email: [this.email],
    });
  }

  //Guardar solicitud
  async saveSolicitud() {
    if (this.solicitudForm.valid) {
      console.log(this.email);
      const solicitud: Solicitud = {
        desarrollador: this.solicitudForm.get('desarrollador')?.value,
        juego: this.solicitudForm.get('juego')?.value,
        email: this.email,
      };
      this.juegosServicios.addSolicitud(solicitud)
      .then(async (solicitud) => {
        if (solicitud === 'success') {
          console.log('Solicitud guardada exitosamente');
          const toast = await this.toastController.create({
            message: 'Solicitud guardada correctamente',
            duration: 2000, // Duración de 2 segundos
            position: 'bottom' // Posición inferior 
          });
          toast.present();
        }else{
          console.log('Error');
        }
      })
      .catch((error) => {
        console.log('Error:', error);
      });
    } else {
      console.log(this.solicitudForm.value);
    }
    // Redirigir a la propia pestaña
    //this.limpiarCampos();
    this.ocultarMostrar();
    this.router.navigate([this.router.url]);
  }
  

  formatearLanzamiento(lanzamiento: any): string {
    if (!lanzamiento) {
      return 'N/A'; // O algún valor predeterminado
    }

    // Convertir a objeto Date
    const fecha = lanzamiento.toDate();

    // Extraer el año como cadena
    return fecha.getFullYear().toString();
  }

   /*************************************/
  //BLOQUE QUE NO PERTENECE A LO SERVICIOS
  /*************************************/
  ngOnInit() {
    //BLOQUE PARA SABER SI EL USUARIO YA INICIÓ SESIÓN O NO:
    const auth = getAuth();
    onAuthStateChanged(auth, user => {
      this.sesionEncendida = !!user;
      this.email = user?.email || '';

      this.firestore.collection('usuarios').doc(this.email).valueChanges().subscribe((usuario: any) => {
        if (usuario) {
          this.nickname = usuario.nickname || '';
          this.admin = usuario.admin || false;
        } else {
          console.error('El documento de usuario no existe en la colección "usuarios".');
        }
      });
    });
    
    this.juegos$ = this.juegosServicios.getJuegos().pipe(
      switchMap(juegos =>
        forkJoin(
          juegos.map(juego =>
            this.juegosServicios.obtenerURLImagen(juego.imagen).pipe(
              map(url => {
                return { ...juego, imagen: url };
              })
            )
          )
        )
      )
    );

    // Filtra los juegos inicialmente sin afectar el observable original
    this.juegosFiltrados$ = this.juegos$.pipe(
      map(juegos => juegos.filter(juego => juego.nombreJuego.toLowerCase().includes(this.filtro.toLowerCase())))
    );

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

  filtrarJuegos() {
    // Actualiza el observable de juegos filtrados al cambiar el filtro
    this.juegosFiltrados$ = this.juegos$.pipe(
      map(juegos => juegos.filter(juego => juego.nombreJuego.toLowerCase().includes(this.filtro.toLowerCase())))
    );
  }
  
  changeColorOnMouseOver(event: any) {
    this.renderer.setStyle(event.target, 'color', 'green');
  }
  

  restoreColorOnMouseOut(event: any) {
    this.renderer.removeStyle(event.target, 'color');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  ocultarMostrar() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  ocultarMostrarSesion() {
    this.mostrarDiv = !this.mostrarDiv;
  }

  //NAVEGAR A LA OTRA PÁGINA Y ENVIAR EL NOMBRE DEL JUEGO PARA OBTENER TODA SU INFORMACIÓN
  navigateToGame(route: string, nombre: string) {
    console.log('enviado: ' + nombre);
    this.router.navigate([route, nombre]);
  }
}
