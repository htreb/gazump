import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private db: AngularFirestore) {}

  getProfileFromEmail(email: string): Observable<any> {
    return this.db
      .collection('profiles', ref => ref.where('email', '==', email).limit(1))
      .valueChanges({ idField: 'id' })
      .pipe(take(1));
  }
}
