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

  /**
   * Returns an observable of all the board documents the current user is a member of,
   * which are under the given groupId
   * @param id the groupId
   */
  getBoardsForGroup(id: string): Observable<any> {
    return this.db
      .collection(`/groups/${id}/boards`, ref =>
        ref.orderBy(`members.${this.auth.currentUser.value.id}`)
      )
      .valueChanges({ idField: 'id' })
      .pipe(takeUntil(this.auth.loggedOutSubject));
  }

  /**
   * Updates the tickets object saved on a board with the new order of each ticket in each column.
   * @param groupId the group the board belongs to
   * @param boardId the board the tickets are on
   * @param data the updated tickets in the form {tickets.0: [ ...], tickets.1: [ ...]}
   */
  updateBoardTickets(groupId: string, boardId: string, data: any): Promise<any> {
    if (!data) { return; } // no unnecessary db writes
    return this.db.doc(`/groups/${groupId}/boards/${boardId}`).update(data);
  }


  // TODO remove this!
  makeDummyTickets(groupId: string, boardId: string): Promise<any> {
    const newTickets = {};
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 10; j++) {
        newTickets[`tickets.${i}`] = newTickets[`tickets.${i}`] || [];
        newTickets[`tickets.${i}`].push({
          title: `${i}${j} ticket about ${i}${j}`,
          description: `${i}${j}${i}${j}${i}${j}${i}${j}`
        });
      }
    }
    console.log('my new tickets are', newTickets);
    return this.updateBoardTickets(groupId, boardId, newTickets);
  }
}
