import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Juegos } from '../models/juegos.model';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument  } from "@angular/fire/compat/firestore";
import { Resena } from '../models/resena.model';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private juegos: Observable<Juegos[]>;
  private juegosCollection: AngularFirestoreCollection<Juegos>;
  private resenas: Observable<Resena[]>;
  private resenasCollection: AngularFirestoreCollection<Resena>;


  constructor(private firestore: AngularFirestore) {
    this.juegosCollection = this.firestore.collection<Juegos>('juegos');
    this.juegos = this.juegosCollection.valueChanges();
    this.resenasCollection = this.firestore.collection<Resena>('resenas');
    this.resenas = this.resenasCollection.valueChanges();
  }

  getJuegos(): Observable<Juegos[]> {
    return this.juegos;
  }

  aumentarVotos(id: string | undefined): void {
    if (id) {
      const resenaDoc: AngularFirestoreDocument<Resena> = this.resenasCollection.doc(id);
      resenaDoc.ref.get().then(doc => {
        if (doc.exists) {
          const resena = doc.data() as Resena;
          const nuevosVotos = resena.votos + 1;
          resenaDoc.update({ votos: nuevosVotos }).then(() => {
            console.log('Votos actualizados correctamente.');
          }).catch(error => {
            console.error('Error al actualizar votos:', error);
          });
        } else {
          console.error('Documento no encontrado.');
        }
      }).catch(error => {
        console.error('Error al obtener el documento:', error);
      });
    } else {
      console.error('ID no válido.');
    }
  }
  borrarResena(id: string|undefined): Promise<void> {
    if(id){
      const resenaDoc:AngularFirestoreDocument<Resena>=this.resenasCollection.doc(id);
      return resenaDoc.delete();
    }else{
      console.error('ID no válido');
      return Promise.reject('ID no válido');
    }
  }

  // getTopResenas(): Observable<Resena | undefined> {
  //   return this.resenas.pipe(
  //     map(resenas => {
  //       if (resenas.length === 0) {
  //         return undefined;
  //       }
  //       return resenas.reduce((maxResena, resena) => (resena.calificacion > maxResena.calificacion ? resena : maxResena));
  //     })
  //   );
  // }

  // guardarResena(resena: Resena): Promise<string> {
  //   // this.products.push(product);
  //   // return of(product);
  //   return this.resenaCollection.add(resena).then((doc) => {
  //     console.log("Reseña añadida con id " +doc.id);
  //     return "success";
  //   })
  //   .catch((error) => {
  //     console.log("Error al anadir la reseña: " + error);
  //     return "error";
  //   });
  // }
}