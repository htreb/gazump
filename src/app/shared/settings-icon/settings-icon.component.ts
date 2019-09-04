import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
})
export class SettingsIconComponent implements OnInit {

  public nextThemeIcon: string;

  constructor(
    private themeService: ThemeService,
  ) { }

  ngOnInit() {
    this.setThemeIcon();
  }

  setThemeIcon() {
    this.themeService.getNextTheme().then(t => this.nextThemeIcon = t.icon );
  }

  switchTheme(): void {
    this.themeService.toggleThemes().then( _ => this.setThemeIcon() );
  }


}
