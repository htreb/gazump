import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil, map, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import isEqual from 'lodash.isequal';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private boardsSub: Subscription;
  public allBoardsSubject = new BehaviorSubject<any>({ loading: true });

  constructor(
    private groupService: GroupService,
    private db: AngularFirestore,
    private auth: AuthService,
  ) {
    this.subToGroupBoards();
  }

  /**
   * subscribes to all the boards the user is member of under the current group
   */
  subToGroupBoards() {
    // TODO make sure this subscription is cleaning up after itself and unsubscribing when changing groups
    if (this.boardsSub) {
      return;
    }
    this.boardsSub = this.groupService.currentGroupSubject
      .pipe(
        takeUntil(this.auth.loggedOutSubject),
        switchMap(group => {
          if (group.loading) {
            return of(group);
          }
          if (!group.id) {
            return of([]);
          }
          this.allBoardsSubject.next({ loading: true });
          return this.db
            .collection('groups')
            .doc(group.id)
            .collection('boards', ref =>
              ref.where('members', 'array-contains', this.auth.currentUser.value.id)
              .orderBy('createdAt')
            )
            .valueChanges({ idField: 'id' });
        })
      )
      .subscribe((boards: any) => {
        this.allBoardsSubject.next(boards);
      });
  }

  unSubFromGroupBoards() {
    if (this.boardsSub && this.boardsSub.unsubscribe) {
      this.boardsSub.unsubscribe();
    }
    this.allBoardsSubject.next({ loading: true });
    this.boardsSub = null;
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
    if (!Object.keys(data).length || !boardId) {
      // no unnecessary db writes
      return Promise.resolve();
    }
    return this.db
      .collection('groups')
      .doc(this.groupService.currentGroupId)
      .collection('boards')
      .doc(boardId)
      .update(data);
  }

  createBoard(data: any) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.tickets = {};
    data.states.map(s => data.tickets[s.id] = []);
    return this.db
      .collection('groups')
      .doc(this.groupService.currentGroupId)
      .collection('boards')
      .add(data);
  }

  deleteBoard(boardId: string) {
    return this.db
      .collection('groups')
      .doc(this.groupService.currentGroupId)
      .collection('boards')
      .doc(boardId)
      .delete();
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
    const matchingBoard = this.allBoardsSubject.value.filter(
      board => board.id === boardId
    )[0];
    const allTickets = JSON.parse(JSON.stringify(matchingBoard.tickets));

    // loop all ticket states to find matching ticket id and save its state and index
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
      const oldSnippet = allTickets[currentStateId].splice(
        currentIndex,
        1,
        snippet
      );
      if (isEqual(oldSnippet[0], snippet)) {
        return Promise.resolve(); // no change to make save a db write
      }
    } else {
      // otherwise remove ticket from it's current state and push it to the end of it's new state
      allTickets[currentStateId].splice(currentIndex, 1);
      allTickets[newStateId].push(snippet);
      updatedTickets[`tickets.${newStateId}`] = allTickets[currentStateId];
    }
    updatedTickets[`tickets.${currentStateId}`] = allTickets[currentStateId];

    return this.updateBoard(boardId, updatedTickets);
  }

  // TODO just use updateTicketSnippet and remove this?
  addTicketSnippet(boardId: string, stateId: string, snippet: any) {
    snippet = {...snippet, id: this.getId()};
    return this.db
      .collection('groups')
      .doc(this.groupService.currentGroupId)
      .collection('boards')
      .doc(boardId)
      .update({
        [`tickets.${stateId}`]: firebase.firestore.FieldValue.arrayUnion(
          snippet
        )
      });
  }

  getId() {
    return `${(Math.random() + '').substr(2)}X${new Date().getTime()}`;
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
    const matchingBoard = this.allBoardsSubject.value.filter(
      board => board.id === boardId
    )[0];
    matchingBoard.states.map(state => {
      for (let j = 0; j < 6; j++) {
        newTickets[`tickets.${state.id}`] =
          newTickets[`tickets.${state.id}`] || [];
        newTickets[`tickets.${state.id}`].push({
          title: `${j} ticket ${j}` + lorem.slice(0, Math.floor(Math.random() * 20) + 50),
          description: lorem.slice(0, Math.floor(Math.random() * 200) + 30),
          id: this.getId(),
          completedBy: ''
        });
      }
    });

    console.log('Dummy tickets are', newTickets);
    return this.updateBoard(boardId, newTickets);
  }
}
