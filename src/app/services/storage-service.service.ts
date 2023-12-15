import { Injectable } from '@angular/core';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageServiceService {
  referenciaJuegos = ref(getStorage(), 'juegos/');


  constructor() { }
}
