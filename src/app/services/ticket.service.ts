import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import * as firebase from 'firebase/app';
import { map, take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(private db: AngularFirestore, private auth: AuthService) {}

  createOrUpdate(info, id?): Promise<any> {
    if (id) {
      return this.db.doc(`tickets/${id}`).update(info);
    } else {
      info.creator = this.auth.currentUser.value.id;
      info.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      return this.db.collection('tickets').add(info);
    }
  }

  /**
   * Returns an observable of all the board documents the current user is a member of,
   * which are under the given groupId
   * @param id the id of the group
   */
  getBoardsForGroup(id: string): Observable<any> {
    return this.db
      .collection(`/groups/${id}/boards`, ref =>
        ref.where('members', 'array-contains', this.auth.currentUser.value.id)
      )
      .valueChanges({ idField: 'id' })
      .pipe(takeUntil(this.auth.loggedOutSubject));
  }

  getUserTickets(): Observable<any> {
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
        ),
        takeUntil(this.auth.loggedOutSubject)
      );
  }

  /**
   * gets one instance of a ticket
   * @param id ticketId
   */
  getTicket(id: string): Observable<any> {
    return this.db
      .doc(`tickets/${id}`)
      .valueChanges()
      .pipe(take(1));
  }

  /**
   * Deletes a ticket from the db by id
   * @param id ticketId
   */
  deleteTicket(id: string) {
    return this.db.doc(`tickets/${id}`).delete();
  }
}
