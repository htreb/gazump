import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil, map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import isEqual from 'lodash.isequal';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private groupId: string;
  private groupSub: Subscription;
  private currentGroupSubject = new BehaviorSubject<any>({ loading: true });

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  /**
   * sets the currentGroupSubject to all the board documents the current user is a member of
   * which are under the given groupId
   * @param id the groupId
   */
  setGroup(groupId: string) {
    // TODO make sure this subscription is cleaning up after itself and unsubscribing when changing groups
    this.groupSub = this.db
      .collection('groups')
      .doc(groupId)
      .collection('boards', ref =>
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
    if (this.groupSub && this.groupSub.unsubscribe) {
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
      })
    );
  }

  /**
   * Updates the object saved on a board
   * if tickets, this is a new order of each ticket in each column.
   * @param boardId the board the tickets are on
   * @param data the updated tickets in the format {
   *      "tickets.stateId": [ ...],
   *      "tickets.otherStateId": [ ...]
   * }
   */
  updateBoard(boardId: string, data: any): Promise<any> {
    if (!Object.keys(data).length) {
      // no unnecessary db writes
      return Promise.resolve();
    }
    return this.db
      .collection('groups')
      .doc(this.groupId)
      .collection('boards')
      .doc(boardId)
      .update(data);
  }

  // TODO this isn't being used right now
  createTicketSnippet(ticketDetails) {
    return {
      title: ticketDetails.title,
      description: ticketDetails.description
    };
  }

  updateTicketSnippet(boardId: string, newStateId: string, snippet: any) {
    // Find matching board and copy all tickets in all states
    const matchingBoard = this.currentGroupSubject.value.filter(board => board.id === boardId)[0];
    const allTickets = Object.assign({}, matchingBoard.tickets);

    // loop all ticket states to find matching ticket id and save it's state and index
    let currentStateId;
    let currentIndex;
    Object.keys(allTickets).forEach(s => {
      const idx = allTickets[s].findIndex(t => t.id === snippet.id);
      if (idx > -1) {
        currentStateId = s;
        currentIndex = idx;
      }
    });

    if (currentStateId === undefined || currentIndex === -1) {
      console.log(`can't find the ticket with id ${snippet.id}`);
      return Promise.reject();
    }

    // new object to store required format for firebase {tickets.stateId: [ ...]...
    const updatedTickets = {};

    // if new state is same as current state then replace ticket with new snippet
    if (currentStateId === newStateId) {
      const oldSnippet = allTickets[currentStateId].splice(currentIndex, 1, snippet);
      if (isEqual(oldSnippet[0], snippet)) {
        return Promise.resolve(); // no change to make save a db write
      }
    } else { // otherwise remove ticket from it's current state and push it to the end of it's new state
      allTickets[currentStateId].splice(currentIndex, 1);
      allTickets[newStateId].push(snippet);
      updatedTickets[`tickets.${newStateId}`] = allTickets[currentStateId];
    }
    updatedTickets[`tickets.${currentStateId}`] = allTickets[currentStateId];

    return this.updateBoard(boardId, updatedTickets);
  }

  // TODO just use updateTicketSnippet and remove this?
  addTicketSnippet(boardId: string, stateId: string, snippet: any) {
    snippet = { id: this.getId(), ...snippet };
    return this.db
      .collection('groups')
      .doc(this.groupId)
      .collection('boards')
      .doc(boardId)
      .update({
        [`tickets.${stateId}`]: firebase.firestore.FieldValue.arrayUnion(snippet)
      });
  }

  getId() {
    return `${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
  }

  // TODO remove this!
  makeDummyTickets(boardId: string): Promise<any> {
    const lorem = `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
    ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
    ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
    velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
    cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
    laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
    aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
    nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
    officia deserunt mollit anim id est laborum.`;

    const newTickets = {};
    const matchingBoard = this.currentGroupSubject.value.filter(board => board.id === boardId)[0];
    matchingBoard.states.map(state => {
      for (let j = 0; j < 6; j++) {
        newTickets[`tickets.${state.id}`] = newTickets[`tickets.${state.id}`] || [];
        newTickets[`tickets.${state.id}`].push({
          title: `${j} ticket ${j}`,
          description: lorem.slice(0, Math.floor(Math.random() * 200) + 30),
          id: this.getId(),
          completedBy: '',
        });
      }
    });

    console.log('Dummy tickets are', newTickets);
    return this.updateBoard(boardId, newTickets);
  }
}
