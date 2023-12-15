import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { User } from '../models/user.model';
@Injectable({
  providedIn: 'root'
})
export class LoginserviceService {
  
  constructor(
  ) { 
  }

}
