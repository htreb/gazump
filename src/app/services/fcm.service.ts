import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ToastController } from '@ionic/angular';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token;

  constructor(
    private afMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    private toastCtrl: ToastController,
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
    return this.afMessaging.requestToken.pipe(
      tap(token => this.token = token));
  }

  showMessages() {
    return this.afMessaging.messages.pipe(
      tap(msg => {
        const body: any = (msg as any).notification.body;
        this.makeToast(body);
      })
    );
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
