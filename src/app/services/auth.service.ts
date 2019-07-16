import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) { }

  logIn(email: string, password: string): Promise<void | firebase.auth.UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signUp(email: string, password: string): Promise<void | firebase.auth.UserCredential> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(data =>  {
      return this.db.doc(`users/${data.user.uid}`).set({
        email,
        role: 'USER',
        permissions: [],
        created: firebase.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  sendResetEmail(email: string) {
      return this.afAuth.auth.sendPasswordResetEmail(email);
    }
}
