import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { takeUntil, switchMap } from 'rxjs/operators';
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
    this.auth.userId$.subscribe(userId => {
      console.log(`boardService userId subscribe ${userId}`);
      if (userId.loading) {
        return;
      }
      return userId ? this.subToGroupBoards(userId) : this.unSubFromGroupBoards();
    });
  }

  /**
   * subscribes to all the boards the user is member of under the current group
   */
  subToGroupBoards(userId) {
    console.log(`subToGroupBoards, ${this.boardsSub}`);
    if (this.boardsSub) {
      return;
    }
    this.boardsSub = this.groupService.currentGroupSubject
      .pipe(
        switchMap(group => {
          if (group.loading) {
            return of({ loading: true });
          }
          if (!group.id) {
            return of([]);
          }
          this.allBoardsSubject.next({ loading: true });
          return this.db
            .collection('groups')
            .doc(group.id)
            .collection('boards', ref =>
              ref.where('members', 'array-contains', userId)
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
    console.log('logging out of users boards');
    if (this.boardsSub && this.boardsSub.unsubscribe) {
      this.boardsSub.unsubscribe();
    }
    this.allBoardsSubject.next({ loading: true });
    this.boardsSub = null;
  }

  getOneBoard(boardId: string) {
    if (!boardId || this.allBoardsSubject.value.loading) {
      return;
    }
    return this.allBoardsSubject.value.filter(board => board.id === boardId)[0];
  }

  getCompletedBy(boardId: string, asArray?: boolean): any {
    let completedByObj = {};
    const matchingBoard = this.getOneBoard(boardId);
    if (matchingBoard) {
      completedByObj = matchingBoard.completedBy;
    }
    if (!asArray) {
      return completedByObj;
    } else {
      // completedBy on the db is an object => completedBy: { id123: {name: '', color: ''}}
      // map it to an array of {id: 'id123', name: '', color: '' } so it can be looped in the template.
      // convert it back when leaving with parseCompletedByArrayToObj.
      if (!completedByObj || Object.keys(completedByObj).length === 0) {
        return [];
      }
      const arr = Object.keys(completedByObj).map(id => ({id, ...completedByObj[id]}));
      return arr.sort((a, b) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      });
    }
  }

parseCompletedByArrayToObj(completedByArr) {
    return completedByArr.reduce((completedByObj, cb) => {
      completedByObj[cb.id] = { name: cb.name, color: cb.color };
      return completedByObj;
    }, {});
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
    if (!boardId || !data || !Object.keys(data).length) {
      // no unnecessary db writes
      throw new Error('Cannot update board, missing data');
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

  /**
   * Returns the current board, state and index within the state of a given snippet.
   * @param snippet the ticket snippet to find
   */
  findTicketPositionDetails(snippetId) {
    let currentBoardId;
    let currentStateId;
    let currentIndex;
    let ticketSnippet;

    const allBoards = JSON.parse(JSON.stringify(this.allBoardsSubject.value));
    allBoards.map((board: any) => {
      Object.keys(board.tickets).forEach(state => {
        const idx = board.tickets[state].findIndex(ticket => ticket.id === snippetId);
        if (idx > -1) {
          currentBoardId = board.id;
          currentStateId = state;
          currentIndex = idx;
          ticketSnippet = board.tickets[state][idx];
        }
      });
    });

    return {
      currentBoardId,
      currentStateId,
      currentIndex,
      ticketSnippet,
    };
  }

  updateTicketSnippet(snippet: any, newStateId?: string) {
    const {
      currentBoardId,
      currentStateId,
      currentIndex,
    } = this.findTicketPositionDetails(snippet.id);

    if (currentStateId === undefined || currentIndex === -1) {
      console.log(`can't find the ticket with id ${snippet.id}`);
      return Promise.reject();
    }

    // Find matching board and copy all tickets in all states
    let allTickets;
    this.allBoardsSubject.value.map(board => {
      if (board.id === currentBoardId) {
        allTickets = JSON.parse(JSON.stringify(board.tickets));
      }
    });

    // new object to store required format for firebase {tickets.stateId: [ ...], ...
    const updatedTickets = {};

    // if new state is same as current state then replace ticket with new snippet
    if (!newStateId || newStateId === currentStateId) {
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

    return this.updateBoard(currentBoardId, updatedTickets);
  }

  addTicketSnippet(snippet: any, stateId: string, boardId: string ) {
    snippet = {...snippet, id: this.db.createId()};
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

  deleteTicketSnippet(snippetId) {
    const {
      currentBoardId,
      currentStateId,
      ticketSnippet
    } = this.findTicketPositionDetails(snippetId);

    return this.db
      .collection('groups')
      .doc(this.groupService.currentGroupId)
      .collection('boards')
      .doc(currentBoardId)
      .update({
        [`tickets.${currentStateId}`]: firebase.firestore.FieldValue.arrayRemove(ticketSnippet)
      });
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
      for (let j = 0; j < 16; j++) {
        newTickets[`tickets.${state.id}`] =
          newTickets[`tickets.${state.id}`] || [];
        newTickets[`tickets.${state.id}`].push({
          title: `${j} ticket ${j}` + lorem.slice(0, Math.floor(Math.random() * 20) + 50),
          description: lorem.slice(0, Math.floor(Math.random() * 200) + 30),
          id: this.db.createId(),
          completedBy: ''
        });
      }
    });

    console.log('Dummy tickets are', newTickets);
    return this.updateBoard(boardId, newTickets);
  }
}
