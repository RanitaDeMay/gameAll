import { CUSTOM_ELEMENTS_SCHEMA,NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireDatabaseModule } from "@angular/fire/compat/database";
import { JuegoResenaPageRoutingModule } from './juego-resena/juego-resena-routing.module';
import { initializeApp } from "firebase/app";
import { FormsModule } from '@angular/forms';
//firebase auth
import { getAuth } from "firebase/auth";
import { StorageServiceService } from './services/storage-service.service';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDC_epti8GMrciLbag36k5D-v2AAKGrNOw",
  authDomain: "gameall-proyecto-final.firebaseapp.com",
  projectId: "gameall-proyecto-final",
  storageBucket: "gameall-proyecto-final.appspot.com",
  messagingSenderId: "593819294288",
  appId: "1:593819294288:web:43d65f834d73ef8ec80f55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,       
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule, JuegoResenaPageRoutingModule, FormsModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    StorageServiceService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  
})
export class AppModule {}
