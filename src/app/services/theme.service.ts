import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Color from 'color';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public nextThemeIcon$ = new BehaviorSubject<any>('');
  public currentTheme = 'Default';

  private transition = 'background-color 0ms';

  // primary => bright contrasts everything 'brand' color header, highlighted tab, primary button, secondary button,
  //             headers, toolbars, tab bar at bottom, used on spinner dots

  // secondary => "input color" for text input
  // tertiary => used on spinner dots, "my messages" in chat

  // light => app background
  // medium => layer on top of background, columns on board, tab bar, footer on chat
  // dark => top most layer => tickets on top of columns

  public defaults = {
    name: 'Default',
    icon: 'partly-sunny',
    primary: '#3880ff',
    secondary: '#EEEEEE',
    tertiary: '#AAAAAA',
    light: '#D1D1D1',
    medium: '#DBDBDB',
    dark: '#EFEFEF',
    success: '#10dc60',
    warning: '#FFD632',
    danger: '#b00020',
  };

  public themes = [
    {
      name: 'Autumn',
      icon: 'leaf',
      primary: '#4C3819',
      secondary: '#EFCB92',
      tertiary: '#E0B776',
      light: '#FFD89B',
      medium: '#FFDEAA',
      dark: '#FFE4BA',
    },
    {
      name: 'Dark',
      icon: 'moon',
      primary: '#F78154',
      secondary: '#1C2030',
      tertiary: '#1E2544',
      light: '#151a30',
      medium: '#222b45',
      dark: '#192038',
    },
    {
      name: 'Black & White',
      icon: 'contrast',
      primary: '#111',
      secondary: '#eee',
      tertiary: '#AAAAAA',
      light: '#ddd',
      medium: '#ccc',
      dark: '#ddd',
    },
    {
      name: 'Cosmic',
      icon: 'planet',
      primary: '#a16eff',
      secondary: '#262654',
      tertiary: '#2B2B84',
      light: '#1B1B53',
      medium: '#2F2F62',
      dark: '#444472',
    },
    {
      name: 'Default',
      icon: this.defaults.icon,
      // colors auto filled inside CSSTextGenerator
    },
  ];


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storage: Storage
  ) {}

  async setInitialTheme() {
    const savedThemeName = await this.storage.get('theme');
    this.setTheme(savedThemeName, true);
  }

  // Override all global variables with a new theme
  async setTheme(themeName, fromStorage = false) {
    const cssText = this.CSSTextGenerator(themeName, fromStorage);
    this.document.documentElement.style.cssText = cssText;
    this.currentTheme = themeName;
    if (!fromStorage) {
      // if not setting from storage (on app start)
      // then save it for next time
      await this.storage.set('theme', themeName);
    }

    const nextTheme = this.getNextTheme();
    this.nextThemeIcon$.next(nextTheme.icon);
  }

  getNextTheme() {
    const currentIndex = this.themes.findIndex(t => t.name === this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    return this.themes[nextIndex];
  }

  async toggleThemes() {
    const nextTheme = await this.getNextTheme();
    this.setTheme(nextTheme.name);
  }

  CSSTextGenerator(themeName, fromStorage = false) {
    const matchingTheme = this.themes.find(t => t.name === themeName);
    const  colors = { ...this.defaults, ...matchingTheme };

    const {
      primary,
      secondary,
      tertiary,
      success,
      warning,
      danger,
      dark,
      medium,
      light
    } = colors;

    const shadeRatio = 0.1;
    const tintRatio = 0.1;

    function contrast(color, ratio = 10) {
      color = Color(color);
      return color.isDark() ? color.lighten(ratio) : color.darken(ratio);
    }

    // --ion-color-step-550 = popover checkbox borders
    // --ion-color-step-850 = popover checkbox labels
    return `
      --theme-switch-transition: ${fromStorage ? '' : this.transition};

      --ion-color-step-550: ${contrast(light).hex()};
      --ion-color-step-850: ${contrast(light).hex()};
      --ion-color-base: ${light};
      --ion-color-contrast: ${contrast(light).hex()};
      --ion-text-color: ${contrast(light).hex()};
      --ion-text-color-rgb: ${contrast(light).rgb().array()};
      --ion-background-color: ${light};
      --ion-overlay-background-color: ${Color(light).darken(shadeRatio).hex()};

      --ion-color-primary: ${primary};
      --ion-color-primary-rgb: ${Color(primary).rgb().array()};
      --ion-color-primary-contrast: ${contrast(primary).hex()};
      --ion-color-primary-contrast-rgb: ${contrast(primary).rgb().array()};
      --ion-color-primary-shade:  ${Color(primary).darken(shadeRatio).hex()};
      --ion-color-primary-tint:  ${Color(primary).lighten(tintRatio).hex()};
      --ion-color-secondary: ${secondary};
      --ion-color-secondary-rgb: ${Color(secondary).rgb().array()};
      --ion-color-secondary-contrast: ${contrast(secondary).hex()};
      --ion-color-secondary-contrast-rgb: ${contrast(secondary).rgb().array()};
      --ion-color-secondary-shade:  ${Color(secondary).darken(shadeRatio).hex()};
      --ion-color-secondary-tint: ${Color(secondary).lighten(tintRatio).hex()};
      --ion-color-tertiary:  ${tertiary};
      --ion-color-tertiary-rgb: ${Color(tertiary).rgb().array()};
      --ion-color-tertiary-contrast: ${contrast(tertiary).hex()};
      --ion-color-tertiary-contrast-rgb: ${contrast(tertiary).rgb().array()};
      --ion-color-tertiary-shade: ${Color(tertiary).darken(shadeRatio).hex()};
      --ion-color-tertiary-tint:  ${Color(tertiary).lighten(tintRatio).hex()};
      --ion-color-success: ${success};
      --ion-color-success-rgb: ${Color(success).rgb().array()};
      --ion-color-success-contrast: ${contrast(success).hex()};
      --ion-color-success-contrast-rgb: ${contrast(success).rgb().array()};
      --ion-color-success-shade: ${Color(success).darken(shadeRatio).hex()};
      --ion-color-success-tint: ${Color(success).lighten(tintRatio).hex()};
      --ion-color-warning: ${warning};
      --ion-color-warning-rgb: ${Color(warning).rgb().array()};
      --ion-color-warning-contrast: ${contrast(warning).hex()};
      --ion-color-warning-contrast-rgb: ${contrast(warning).rgb().array()};
      --ion-color-warning-shade: ${Color(warning).darken(shadeRatio).hex()};
      --ion-color-warning-tint: ${Color(warning).lighten(tintRatio).hex()};
      --ion-color-danger: ${danger};
      --ion-color-danger-rgb: ${Color(danger).rgb().array()};
      --ion-color-danger-contrast: ${contrast(danger).hex()};
      --ion-color-danger-contrast-rgb: ${contrast(danger).rgb().array()};
      --ion-color-danger-shade: ${Color(danger).darken(shadeRatio).hex()};
      --ion-color-danger-tint: ${Color(danger).lighten(tintRatio).hex()};
      --ion-color-dark: ${dark};
      --ion-color-dark-rgb: ${Color(dark).rgb().array()};
      --ion-color-dark-contrast: ${contrast(dark).hex()};
      --ion-color-dark-contrast-rgb: ${contrast(dark).rgb().array()};
      --ion-color-dark-shade: ${Color(dark).darken(shadeRatio).hex()};
      --ion-color-dark-tint: ${Color(dark).lighten(tintRatio).hex()};
      --ion-color-medium: ${medium};
      --ion-color-medium-rgb: ${Color(medium).rgb().array()};
      --ion-color-medium-contrast: ${contrast(medium).hex()};
      --ion-color-medium-contrast-rgb: ${contrast(medium).rgb().array()};
      --ion-color-medium-shade: ${Color(medium).darken(shadeRatio).hex()};
      --ion-color-medium-tint: ${Color(medium).lighten(tintRatio).hex()};
      --ion-color-light: ${light};
      --ion-color-light-rgb: ${Color(light).rgb().array()};
      --ion-color-light-contrast: ${contrast(light).hex()};
      --ion-color-light-contrast-rgb: ${contrast(light).rgb().array()};
      --ion-color-light-shade: ${Color(light).darken(shadeRatio).hex()};
      --ion-color-light-tint: ${Color(light).lighten(tintRatio).hex()};`;
  }
}
