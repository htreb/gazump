import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ToastController, Platform } from '@ionic/angular';
import { tap } from 'rxjs/operators';
import { from } from 'rxjs';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import * as firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';

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
    private db: AngularFirestore,
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

  getPermission(userId: string) {
    let token$;
    if (this.platform.is('cordova')) {
      token$ = from(this.getPermissionNative());
    } else {
      token$ = this.getPermissionWeb();
    }
    return token$.pipe(
      tap((token: string) => {
        this.token = token;
        this.saveToken(userId, token);
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
    if (this.platform.is('cordova')) {
      messages$ = this.firebaseNative.onMessageReceived();
    } else {
      messages$ = this.afMessaging.messages;
    }

    return messages$.pipe(tap(payload => this.showMessages(payload)));
  }

  saveToken(userId: string, token: string) {
    this.db
      .collection('users')
      .doc(userId)
      .update({
        fcmTokens: firebase.firestore.FieldValue.arrayUnion(token)
      });
  }

  removeCurrentTokenOnSignOut(userId) {
    if (!userId || userId.loading || !this.token) {
      console.log(`can't remove FCM token ${this.token}, from userId`, userId);
      return;
    }
    this.db
      .collection('users')
      .doc(userId)
      .update({
        fcmTokens: firebase.firestore.FieldValue.arrayRemove(this.token)
      });
  }

  showMessages(payload) {
    let body;
    if (this.platform.is('android')) {
      body = payload.body;
    } else {
      body = payload.notification.body;
    }

    if (payload.tap === 'background' || !body) {
      console.log('Notification tapped in background (or no body), no need to show toast', body);
    } else {
      this.makeToast(body);
    }
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

  notifyMembers(messageType: string, members: string[], title: string, body: string) {
    if ((members && members.length && title && body)) {
      this.fun.httpsCallable('notifyMembers')({ messageType, members, title, body });
    }
  }
}
