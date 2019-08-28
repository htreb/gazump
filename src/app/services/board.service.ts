import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  currentGroupSubject = new BehaviorSubject<any>({loading: true});
  currentGroup$ = this.currentGroupSubject.asObservable();

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  /**
   * sets the currentGroupSubject to all the board documents the current user is a member of,
   * which are under the given groupId
   * @param id the groupId
   */
  setGroup(id: string) {
    this.db.collection(`/groups/${id}/boards`, ref =>
        ref.orderBy(`members.${this.auth.currentUser.value.id}`)
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        takeUntil(this.auth.loggedOutSubject)
      ).subscribe(boardData => this.currentGroupSubject.next(boardData));
  }


  /**
   * Updates the tickets object saved on a board with the new order of each ticket in each column.
   * @param groupId the group the board belongs to
   * @param boardId the board the tickets are on
   * @param data the updated tickets in the form {tickets.0: [ ...], tickets.1: [ ...]}
   */
  updateBoardTickets(
    groupId: string,
    boardId: string,
    data: any
  ): Promise<any> {
    if (!data) {
      return;
    } // no unnecessary db writes
    return this.db.doc(`/groups/${groupId}/boards/${boardId}`).update(data);
  }
}
