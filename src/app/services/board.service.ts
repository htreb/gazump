import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private groupId: string;
  private groupSub: Subscription;

  currentGroupSubject = new BehaviorSubject<any>({ loading: true });
  currentBoardTitle = new BehaviorSubject<string>(
    'Default board title from service'
  );

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  setCurrentBoardTitle(title: string) {
    this.currentBoardTitle.next(title);
  }

  /**
   * sets the currentGroupSubject to all the board documents the current user is a member of
   * which are under the given groupId
   * @param id the groupId
   */
  setGroup(groupId: string) {
    // TODO make sure this subscription is cleaning up after itself and unsubscribing when changing groups
    this.groupSub = this.db
      .collection(`/groups/${groupId}/boards`, ref =>
        ref.orderBy(`members.${this.auth.currentUser.value.id}`)
      )
      .valueChanges({ idField: 'id' })
      .pipe(takeUntil(this.auth.loggedOutSubject))
      .subscribe((boards: any) => {
        this.groupId = groupId;
        this.currentGroupSubject.next(boards);
      });
  }

  unSubFromGroup() {
    if (this.groupSub && this.groupSub) {
      this.groupSub.unsubscribe();
    }
    this.currentGroupSubject.next({ loading: true });
    this.groupId = null;
  }

  boardsFromCurrentGroup(boardId = null) {
    return this.currentGroupSubject.pipe(
      map(allBoards => {
        if (!boardId || allBoards.loading) {
          return allBoards;
        }
        // if boardId entered then return just that match not an array
        return allBoards.filter(b => b.id === boardId)[0];
      }),
      tap(b => console.log(`boardsFromCurrentGroup ${boardId} is`, b))
    );
  }

  /**
   * Updates the object saved on a board
   * if tickets, this is a new order of each ticket in each column.
   * @param boardId the board the tickets are on
   * @param data the updated tickets in the form {tickets.0: [ ...], tickets.1: [ ...]}
   */
  updateBoard(boardId: string, data: any): Promise<any> {
    if (!Object.keys(data).length) {
      // no unnecessary db writes
      return Promise.resolve();
    }
    return this.db
      .doc(`/groups/${this.groupId}/boards/${boardId}`)
      .update(data);
  }

  // TODO remove this!
  makeDummyTickets(boardId: string): Promise<any> {
    const newTickets = {};
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 6; j++) {
        newTickets[`tickets.${i}`] = newTickets[`tickets.${i}`] || [];
        newTickets[`tickets.${i}`].push({
          title: `${i}${j} ticket about ${i}${j}`,
          description: `${i}${j}${i}${j}${i}${j}${i}${j}`,
          id: `id_${i}${j}${i}${j}${i}${j}${i}${j}`,
        });
      }
    }
    console.log('my new tickets are', newTickets);
    return this.updateBoard(boardId, newTickets);
  }
}
