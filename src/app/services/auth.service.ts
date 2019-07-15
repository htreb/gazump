import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  logIn(email: string, password: string): Promise<void | firebase.auth.UserCredential> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password).catch((e) => {
      console.error(`an error logging in the user ${email}`, e.message);
    });
  }

  signUp(email: string, password: string): Promise<void | firebase.auth.UserCredential> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).catch((e) => {
      console.error(`an error ocurred creating new the user ${email}`, e.message);
    });
  }

  sendResetEmail(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }
}
