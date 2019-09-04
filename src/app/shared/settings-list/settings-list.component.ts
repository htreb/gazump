import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.scss'],
})
export class SettingsListComponent implements OnInit {

  public nextThemeIcon: string;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
  ) { }

  ngOnInit(): void {
    this.setThemeIcon();
  }

  setThemeIcon(): void {
    this.themeService.getNextTheme().then(t => this.nextThemeIcon = t.icon );
  }

  switchTheme(): void {
    this.themeService.toggleThemes().then( _ => this.setThemeIcon() );
  }

  logOut(): void {
    this.auth.logOut();
  }
}
