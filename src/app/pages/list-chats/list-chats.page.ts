import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './list-chats.page.html',
  styleUrls: ['./list-chats.page.scss'],
})
export class ListChatsPage implements OnInit {

  chats$;

  constructor(
    private chatService: ChatService,
    private router: Router,
    ) { }

  ngOnInit() {
    this.chats$ = this.chatService.getChats();
  }

  goToChat(chatId: string) {
    this.router.navigate([this.router.url, chatId]); // TODO this doesn't seem like the best way to navigate
  }

}
