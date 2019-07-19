import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  loading;
  constructor(private db: AngularFirestore, private auth: AuthService) {}

  createOrUpdate(id: string = null, info): Promise<any> {
    if (id) {
      // TODO
    } else {
      info.creator = this.auth.currentUser.value.id;
      info.created_at = firebase.firestore.FieldValue.serverTimestamp();
      return this.db.collection('tickets').add(info);
    }
  }

  getUserTickets() {
    const creatorId = this.auth.currentUser.value.id;
    return this.db
      .collection('/tickets', ref => ref.where('creator', '==', creatorId))
      .snapshotChanges()
      .pipe(
        // The below map block attaches the the id of the ticket location in the database
        // to the return object so it can be used when updating / deleting the ticket.
        map(actions =>
          actions.map(ticketData => {
            const data = ticketData.payload.doc.data();
            const ticketId = ticketData.payload.doc.id;
            return { id: ticketId, ...data };
          })
        )
      );
  }
}
