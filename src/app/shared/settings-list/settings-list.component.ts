import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
})
export class SettingsListComponent implements OnInit {

  public nextTheme: any;
  @Input() closePopover: () => {};

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
  ) { }

  ngOnInit(): void {
    this.getNextTheme();
  }

  getNextTheme(): void {
    this.themeService.getNextTheme().then(t => this.nextTheme = t);
  }

  switchTheme(): void {
    this.themeService.toggleThemes().then( _ => this.getNextTheme() );
  }

  logOut(): void {
    this.closePopover();
    this.auth.logOut();
  }
}
