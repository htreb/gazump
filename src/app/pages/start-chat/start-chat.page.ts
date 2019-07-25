import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TicketService } from 'src/app/services/ticket.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-start-chat',
  templateUrl: './start-chat.page.html',
  styleUrls: ['./start-chat.page.scss'],
})
export class StartChatPage implements OnInit {

  public title = '';
  public participant = '';
  private users = [];

  constructor(
    private chatService: ChatService,
    private router: Router,
    private ticketService: TicketService,
    ) { }

  ngOnInit() {
  }


  addUser() {
    this.chatService.findUserByEmailOrNickName(this.participant).subscribe(res => {
      console.log('looks like you want to add', res);
      for (const data of res) {
        if (data.length) {
          this.users.push(data[0]);
        }
      }
    });
  }

  startGroup() {
    console.log('start a group ey?');
  }
}
