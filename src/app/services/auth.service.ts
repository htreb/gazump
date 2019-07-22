import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { from, Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<any>;
  currentUser = new BehaviorSubject(null);

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
    // subscribe to current logged in user, find them in the users table and and return
    // an observable containing the id in the database.
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .doc(`users/${user.uid}`)
            .valueChanges()
            .pipe(
              take(1),
              tap((data: any) => {
                data.id = user.uid;
                this.currentUser.next(data);
              })
            );
        } else {
          this.currentUser.next(null);
          return of(null);
        }
      })
    );
  }

  /**
   * logs in a current user with email and password and returns the corresponding user from the users database
   * @param email string
   * @param password string
   */
  logIn(email: string, password: string): Observable<any> {
    return from(
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(data => {
        if (data) {
          return this.db
            .doc(`users/${data.user.uid}`)
            .valueChanges()
            .pipe(take(1));
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Signs up a new user with email and password, and creates a new entry in the users database
   *
   * @param email string
   * @param password string
   */
  signUp(email: string, password: string): Observable<any> {
    return from(
      this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(data => {
        if (!data || !data.user) {
          console.log(
            'something has gone wrong signing up the new user, we shouldn\'t get here'
          );
          return of(null);
        }
        return from(
          this.db.doc(`users/${data.user.uid}`).set({
            email,
            role: 'USER', // TODO some way of giving users another role
            permissions: [],
            created: firebase.firestore.FieldValue.serverTimestamp()
          })
        ).pipe(
          switchMap(() => {
            return this.db
              .doc(`users/${data.user.uid}`)
              .valueChanges()
              .pipe(take(1));
          })
        );
      })
    );
  }

  /**
   * Sends a password reset email to the email address (if there is a user linked to it)
   * @param email string
   */
  sendResetEmail(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  /**
   * Signs out the currently logged in user
   */
  logOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigateByUrl('/login');
  }

  /**
   * Checks if a user matches the given permissions.
   * @param permissions array of required permissions
   */
  hasPermissions(permissions: string[]): boolean {
    if (!this.currentUser || !this.currentUser.value.permissions) {
      return false;
    }
    // filters the permissions to an array of all the user does not have. If that array is not 0 then deny permission.
    return permissions.filter(p => this.currentUser.value.permissions.indexOf(p) === -1).length === 0;
  }
}
