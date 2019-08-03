import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

  chats$;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.chats$ = this.chatService.getChats();
  }

}
