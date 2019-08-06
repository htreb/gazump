import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './list-chats.page.html',
  styleUrls: ['./list-chats.page.scss'],
})
export class ListChatsPage implements OnInit {

  chats$;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chats$ = this.chatService.getChats();
  }

}
