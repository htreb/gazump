import { Component, ViewChild } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  @ViewChild('usernameInput', { static: false }) usernameInput: any;
  public usernameTip = `This is the name other contacts will see next to your activity`;
  public updatingUserNameInProgress = false;

  constructor(
    public auth: AuthService,
    public themeService: ThemeService
    ) { }

  ionViewDidEnter() {
    if (this.usernameInput) {
      this.usernameInput.setFocus();
    }
  }

  setUserName(username) {
    this.updatingUserNameInProgress = true;
    const cb = (response) => { this.updatingUserNameInProgress = false; };
    this.auth.updateUserName(username, cb);
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
