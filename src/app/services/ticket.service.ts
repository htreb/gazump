import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  loading;
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
  ) {}

  createOrUpdate(id: string = null, info): Promise<any> {
    if (id) {
      // TODO
    } else {
      info.creator = this.auth.currentUser.value.id;
      info.created_at = firebase.firestore.FieldValue.serverTimestamp();
      console.log(`the ticket information on saving is`, info);
      return this.db
        .collection('tickets')
        .add(info);
    }
  }
}
