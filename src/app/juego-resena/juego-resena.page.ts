import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JuegosService } from '../services/juegos.service';
import { Juegos } from '../models/juegos.model';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Resena } from '../models/resena.model';
import { ToastController } from '@ionic/angular';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ResenaService } from '../services/resena.service';
@Component({
  selector: 'app-juego-resena',
  templateUrl: './juego-resena.page.html',
  styleUrls: ['./juego-resena.page.scss', '../../global2.scss', './juego-resena.page2.scss'],
})
export class JuegoResenaPage implements OnInit {
  //PARA LA SESIÓN
  mostrarDiv: boolean = false;
  //PARA MOSTRAR O NO EL FORMULARIO DE LAS RESENAS, INICIALMENTE NO DEBE MOSTRARSE
  mostrarFormularioResenas: boolean = false;
  //CON ESTO SE DETERMINA SI ESTÁ LOGEADO O NO:
  sesionEncendida = false;
  admin = false;
  //PARA CONSULTAR
  /////LAS RESENAS
  resenas$?: Observable<Resena[]>;
  nombreJuego: string = '';
  /////EL JUEGO
  juego$: Observable<Juegos | undefined>;

  //PARA AGREGAR
  tituloResena: string = '';
  contenidoResena: string = '';

  //USUARIO
  email: string = '';
  nickname: string = '';
  //Variables para formulario de reseña
  public resenaForm: FormGroup;
  public rating: number = 0;

  constructor(
    private formBuilder: FormBuilder, 
    private renderer: Renderer2,
    private router: Router,
    private juegosServicios: JuegosService,
    private route: ActivatedRoute,
    private activateRoute: ActivatedRoute,
    private toastController: ToastController,
    private location: Location, 
    private firestore: AngularFirestore,
    private resenaService: ResenaService
  ) { 
    this.renderer = renderer;
    //LÍNEA PARA OBTENER TODAS LAS RESEÑAS QUE TENGAN EL CAMPO NOMBRE COINCIDENTE CON nombreJuego
    this.juego$ = this.juegosServicios.getJuegoPorNombre(this.nombreJuego);
    
    //Formulario de agregar Reseña
    this.resenaForm = this.formBuilder.group({
      tituloResena: ['', Validators.required],
      autor: this.nickname,
      calificacion: [this.rating],
      contenido: ['', Validators.required],
      nombreJuego: [''],
      votos: [0],
    });
  }
  getNombreJuego(): string {
    return this.nombreJuego;
  }
  //Guardar reseña
  async saveResena() {
    if (this.resenaForm.valid) {
      const resena: Resena = {
        tituloResena: this.resenaForm.get('tituloResena')?.value,
        autor: this.nickname,
        calificacion: this.rating,
        contenido: this.resenaForm.get('contenido')?.value,
        fecha: new Date(),
        nombreJuego: this.nombreJuego,
        votos: this.resenaForm.get('votos')?.value,
      };
      this.juegosServicios.addResena(resena)
      .then(async (resena) => {
        if (resena === 'success') {
          const toast = await this.toastController.create({
            message: 'Reseña guardada',
            duration: 3000, // Duración de 2 segundos
            position: 'middle' // Posición inferior 
          });
          toast.present();
          this.location.back();
        }else{
          console.log('Error');
        }
      })
      .catch((error) => {
        console.log('Error:', error);
      });
    } else {
      console.log(this.resenaForm.value);
    }
    // Redirigir a la propia pestaña
    this.limpiarCampos();
  }

  loadResena(){
    this.resenas$ = this.juegosServicios.getResenasByJuego(this.nombreJuego);
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

  limpiarCampos(): void {
    this.rating = 0;
    this.resenaForm = this.formBuilder.group({
      tituloResena: ['', Validators.required],
      calificacion: [this.rating],
      contenido: ['', Validators.required],
      nombreJuego: [''],
      votos: [0],
    });
  }

  aumentarVotos(id: string | undefined): void {
    console.log(id);
    this.resenaService.aumentarVotos(id);
  }
  
  borrarResena(id: string | undefined): void {
    this.resenaService.borrarResena(id)
    .then(() => {
      console.log("Reseña borrada correctamente");
      this.loadResena();
    }).catch(error => {
      console.log("Error al intentar borrar reseña");
    });
  }

    /*************************************/
  //BLOQUE QUE NO PERTENECE A LO SERVICIOS
  /*************************************/
  ngOnInit() {
    //PARA LA SESIÓN
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

    })

    this.route.params.pipe(
      switchMap(params => {
        const nombreJuego = params['nombreJuego'];
        this.nombreJuego = nombreJuego; // Asigna el nombre del juego
        this.resenas$ = this.juegosServicios.getResenasFiltradas(this.nombreJuego);
        return this.juegosServicios.getJuegoPorNombre(nombreJuego);
      }),
      switchMap(juego => {
        // Si el juego existe, obtén la URL de la imagen y actualiza el juego
        if (juego) {
          return this.juegosServicios.obtenerURLImagen(juego.imagen).pipe(
            map(url => ({ ...juego, imagen: url }))
          );
        } else {
          return [undefined];
        }
      })
    ).subscribe(juego => {
      // Juego actualizado con la URL de la imagen
      this.juego$ = of(juego);
    });

    //CON ESTE CÓDIGO SE OBTIENE EL PARÁMETRO A ENVÍAR PARA FILTRAR RESEÑAS
    this.route.params.subscribe(params => {
      this.nombreJuego = params['nombreJuego'];
    });
  }

  setRating(rating: number) {
    this.rating = rating;
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

  navigateToGame(route: string, params?: any) {
    this.router.navigate([route], { state: params });
  }
  
  ocultarMostrar() {
    this.mostrarDiv = !this.mostrarDiv;
  }

  ocultarFormularioResenas() {
    this.mostrarFormularioResenas = !this.mostrarFormularioResenas;
  }

}
