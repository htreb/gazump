import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { IonicStorageModule } from '@ionic/storage';
import { SharedModule } from './shared/shared.module';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { FirebaseX } from '@ionic-native/firebase-x';
import { ServiceWorkerModule } from '@angular/service-worker';
// import { Camera } from '@ionic-native/camera/ngx';

@NgModule({
	declarations: [AppComponent],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		AngularFireModule.initializeApp(environment.firebase),
		AngularFirestoreModule,
		AngularFireAuthModule,
		AngularFireStorageModule,
		AngularFireMessagingModule,
		AngularFireFunctionsModule,
		BrowserAnimationsModule,
		IonicStorageModule.forRoot(),
		SharedModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
		}),
	],
	providers: [
		StatusBar,
		SplashScreen,
		FirebaseX,
		// Camera,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
