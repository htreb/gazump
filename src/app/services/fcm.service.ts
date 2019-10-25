import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ToastController, Platform } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token;

  constructor(
    private afMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    private toastCtrl: ToastController,
    private platform: Platform,
    private firebaseNative: FirebaseX,
  ) { }

  async makeToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      position: 'top',
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'dismiss',
    });
    toast.present();
  }

  getPermission() {
    let token$;
    if (this.platform.is('cordova')) {
      token$ = from(this.getPermissionNative());
    } else {
      token$ = this.getPermissionWeb();
    }
    return token$.pipe(
      tap(token => {
        console.log('token is', token);
        this.token = token;
      })
    );
  }

  private getPermissionWeb() {
    return this.afMessaging.requestToken;
  }

  private async getPermissionNative() {
    let token;

    if (this.platform.is('ios')) {
      await this.firebaseNative.grantPermission();
    }

    token = await this.firebaseNative.getToken();

    return token;
  }

  listenToMessages() {
    let messages$;
    console.log('listen to messages');
    if (this.platform.is('cordova')) {
      console.log('listening to messages, platform is cordova');
      messages$ = this.firebaseNative.onMessageReceived();
    } else {
      messages$ = this.afMessaging.messages;
    }

    return messages$.pipe(tap(payload => this.showMessages(payload)));
  }


  showMessages(payload) {
    let body;
    console.log('show messages');
    if (this.platform.is('android')) {
      console.log('going to show a message platform is android', payload);
      body = payload.body;
    } else {
      body = payload.notification.body;
    }

    this.makeToast(body);
  }

  sub(topic) {
    this.fun
    .httpsCallable('subscribeToTopic')({ topic, token: this.token }).pipe(
      tap( _ => this.makeToast(`Subscribed to ${topic}`)))
      .subscribe();
  }

  unSub(topic) {
    this.fun
    .httpsCallable('unsubscribeFromTopic')({ topic, token: this.token}).pipe(
      tap( _ => this.makeToast(`Unsubscribed from ${topic}`)))
      .subscribe();
  }
}
