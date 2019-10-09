import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { from, Observable, of, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private showPageLoadingSpinner = false;
  authSub: Subscription;
  currentUser = new BehaviorSubject(null);
  loggedOutSubject: Subject<any> = new Subject();

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
    this.authSub = this.getCurrentUser().subscribe();
  }

  get loading() {
    return this.showPageLoadingSpinner;
  }

  set loading(loading: boolean) {
    this.showPageLoadingSpinner = loading;
  }
  /**
   * subscribe to current logged in user, find them in the users table and return
   * an observable containing the id in the database.
   */
  getCurrentUser() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .doc(`users/${user.uid}`)
            .snapshotChanges()
            .pipe(
              map(doc => {
                const data = { id: doc.payload.id, ...doc.payload.data() };
                this.currentUser.next(data);
                return data;
              }));
        } else {
          console.log('Got no user in the auth service emitting loggedOutSubject...', user);
          this.loggedOutSubject.next();
          this.currentUser.next(null);
          // this.loggedOutSubject.complete(); // TODO! ticket #23
          return of(null);
        }
    }));
  }

  cleanUpSubscriptions() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
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
   * @param email string
   * @param password string
   */
  signUp(email: string, password: string): Observable<any> {
    email = email.toLowerCase();
    return from(
      this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(data => {
        if (!data || !data.user) {
          console.log(
            'Something has gone wrong signing up the new user, we shouldn\'t get here'
          );
          return of(null);
        }
        return from(
          this.db.doc(`users/${data.user.uid}`).set({
            email,
            role: 'USER', // TODO some way of giving users another role
            permissions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userName: 'colin' // TODO some way of letting users change their userName
          })
        ).pipe( // TODO does the set above this not return this info?
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
    this.router.navigateByUrl('/login'); // TODO make this a 'root' direction?
  }

  /**
   * Checks if a user matches the given permissions.
   * @param permissions array of required permissions
   */
  hasPermissions(permissions: string[]): boolean {
    if (!this.currentUser || !this.currentUser.value.permissions) {
      return false;
    }
    // filters the permissions to an array of all that the user does not have.
    // If that array is not 0 long then deny permission.
    return permissions.filter(p => this.currentUser.value.permissions.indexOf(p) === -1).length === 0;
  }

  /**
   * checks firebase for a match on a given userName
   * @param name requested name
   */
  isUserNameAvailable(name: string) {
    return this.db.collection('users', ref => ref.where('userName', '==', name).limit(1)).valueChanges().pipe(
      take(1),
      map(user => {
        return user;
      })
    );
  }

  /**
   * changes the currently logged in users userName
   * @param userName new userName
   */
  updateUserName(userName: string) {
    return this.db.doc(`users/${this.currentUser.value.id}`).update({
      userName
    });
  }
}
