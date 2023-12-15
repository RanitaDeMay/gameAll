import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, from, forkJoin  } from 'rxjs';
import { map, switchMap  } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, DocumentSnapshot  } from "@angular/fire/compat/firestore";
import { Juegos } from '../models/juegos.model';
import { Resena } from '../models/resena.model';
import { Solicitud } from '../models/solicitud.model';
import { ContenidoResenas } from '../models/juegos.model';
import { getStorage, ref, getDownloadURL, uploadBytesResumable, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class JuegosService {
  private juegosCollection: AngularFirestoreCollection<Juegos>;
  private juegos: Observable<Juegos[]>;
  private resenasCollection: AngularFirestoreCollection<Resena>;
  private resenas: Observable<Resena[]>;
  private solicitudesCollection: AngularFirestoreCollection<Solicitud>;
  private solicitudes : Observable<Solicitud[]>;

  private nombreJuego: string = '';
  
  constructor(
    private firestore: AngularFirestore,
  ) { 
    this.juegosCollection = this.firestore.collection<Juegos>('juegos');
    this.juegos = this.juegosCollection.valueChanges();
    this.resenasCollection = this.firestore.collection<Resena>('resenas');
    this.resenas = this.resenasCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Resena;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
    this.solicitudesCollection = this.firestore.collection<Solicitud>('solicitudes');
    this.solicitudes = this.solicitudesCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as Solicitud;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    )
  }
  getImagenesJuegosRecientes(): Observable<{ imagen: string, nombre: string }[]> {
    return this.firestore
      .collection<Juegos>('juegos', (ref) =>
        ref.orderBy('lanzamiento', 'desc').limit(5)
      )
      .valueChanges()
      .pipe(
        switchMap((juegos: Juegos[]) => {
          const urlObservables: Observable<string>[] = juegos.map((juego) =>
            this.obtenerURLImagen(juego.imagen)
          );
          return forkJoin(urlObservables).pipe(
            map((imagenes: string[]) => juegos.map((juego, index) => ({ imagen: imagenes[index], nombre: juego.nombreJuego })))
          );
        })
      );
  }

  getJuegos(): Observable<Juegos[]> {
    return this.juegos;
  }

  getSolicitudes(): Observable<{ id: string, data: Solicitud }[]> {
    return this.firestore.collection('solicitudes').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Solicitud;
        const id = a.payload.doc.id;
        return { id, data };
      }))
    );
  }

  obtenerURLImagen(nombreImagen: string): Observable<string> {
    const storage = getStorage();
    const referenciaImagen = ref(storage, 'juegos/' + nombreImagen);
    return from(getDownloadURL(referenciaImagen));
  }

  getTopResena(): Observable<Resena | undefined> {
    return this.resenas.pipe(
      map(resenas => {
        if (resenas.length === 0) {
          return undefined;
        }

        const maxVotosResena = resenas.reduce((maxResena, resena) =>
          resena.votos > maxResena.votos ? resena : maxResena
        );

        return maxVotosResena;
      })
    );
  }

  getResenasFiltradas(nombre: string): Observable<Resena[]> {
    return this.resenas.pipe(
      map(resenas => {
        const filtradas = resenas.filter(resena => resena.nombreJuego === nombre);
        return filtradas;
      })
    );
  }

  getGameByName(nombre: string){
    console.log(nombre)
    return this.juegos.pipe(
      map(juegos => juegos.find(
        juego => juego.nombreJuego === nombre
      ))
    );
  }
  
  getResenasByJuego(nombreJuego: string): Observable<Resena[]> {
    return this.firestore.collection<Resena>('resenas', ref => ref.where('nombreJuego', '==', nombreJuego)).valueChanges();
  }
  
  getJuegoPorNombre(nombreJuego: string): Observable<Juegos | undefined> {
    return this.juegosCollection.valueChanges().pipe(
      map(juegos => juegos.find(juego => juego.nombreJuego === nombreJuego))
    );
  }

  actualizarResenas(nombreJuego: string, nuevasResenas: ContenidoResenas[]): void {
    
    this.getGameByName(nombreJuego).subscribe(juego => {
      if (juego) {
        const juegoRef = this.firestore.collection<Juegos>('juegos').doc(juego.nombreJuego);
        juegoRef.get().toPromise().then(doc => {
          if (doc && doc.exists) {
            juegoRef.update({ resenas: nuevasResenas } as Partial<Juegos>)
              .then(() => console.log('Reseñas actualizadas correctamente.'))
              .catch(error => console.error('Error al actualizar reseñas:', error));
          } 
        }).catch(error => console.error('Error al obtener el documento:', error));
  
      } 
    });
  }
  addResena(resena: Resena): Promise<string> {
    return this.resenasCollection.add(resena).then((doc) => {
      console.log("Reseña añadido con id " +doc.id);
      return "success";
    })
    .catch((error) => {
      console.log("Error al anadir reseña: " + error);
      return "error";
    });
  }
  addSolicitud(solicitud: Solicitud): Promise<string> {
    return this.solicitudesCollection.add(solicitud).then((doc) => {
      return "success";
    })
    .catch((error) => {
      console.log("Error al anadir reseña: " + error);
      return "error";
    });
  }
  borrarSolicitud(id: string | undefined): Promise<void> {
    return this.solicitudesCollection.doc(id).delete();
  }
  addJuego(juego: Juegos): Promise<string> {
    return this.juegosCollection.add(juego).then((doc) => {
      return "success";
    })
    .catch((error) => {
      console.log("Error al anadir juego: " + error);
      return "error";
    });
  }
}  
