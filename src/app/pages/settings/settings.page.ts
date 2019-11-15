import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  public usernameTip = `This is the name other contacts will see next to your activity`;

  constructor(
    public auth: AuthService,
    public themeService: ThemeService
    ) { }

  setUserName(username) {
    this.auth.updateUserName(username);
  }

  themeSelected(theme) {
    this.themeService.setTheme(theme);
  }

  onNotificationsContact(checked) {
    this.auth.notifyContactRequest(checked);
  }

  onNotificationsMessages(checked) {
    this.auth.notifyChatMessage(checked);
  }

  onNotificationsBoard(checked) {
    this.auth.notifyBoardChanges(checked);
  }
}
