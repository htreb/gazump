import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Color from 'color';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';

const transition = 'background-color 0ms';

const defaults = {
    icon: 'cloudy',
    primary: '#3880ff',
    secondary: '#0cd1e8',
    tertiary: '#7044ff',
    success: '#10dc60',
    warning: '#ffce00',
    danger: '#f04141',
    dark: '#222428',
    medium: '#989aa2',
    light: '#f4f5f8'
  };

const themes = [
  {
    name: 'Default',
    icon: defaults.icon,
    // colors auto filled inside CSSTextGenerator
  },
      {
        name: 'Dark',
        icon: 'basket',
        primary: '#F39C6B',
        // secondary: '4D9078',
        // tertiary: 'BFFFF1',
        light: '#5D5877',
        medium: '#312F3D',
        dark: '#46425B'
      },
      {
        name: 'Sea',
        icon: 'basketball',
        primary: '#349681',
        // secondary: '#4D9078',
        // tertiary: 'BFFFF1',
        light: '#7CFFE2',
        medium: '#74F2D6',
        dark: '#003327'
      },
  {
    name: 'Autumn',
    icon: 'partly-sunny',
    primary: '#F39C6B',
    secondary: '#4D9078',
    tertiary: '#B4436C',
    light: '#FDE8DF',
    medium: '#FCD0A2',
    dark: '#B89876'
  },
  {
    name: 'Night',
    icon: 'moon',
    primary: '#8CBA80',
    secondary: '#FCFF6C',
    tertiary: '#FE5F55',
    medium: '#596774',
    dark: '#7A8590',
    light: '#495867'
  },
  {
    name: 'Neon',
    icon: 'flash',
    primary: '#39BFBD',
    secondary: '#4CE0B3',
    tertiary: '#FF5E79',
    light: '#F4EDF2',
    medium: '#B682A5',
    dark: '#34162A'
  }
];

function CSSTextGenerator(colors, fromStorage = false) {
  colors = { ...defaults, ...colors };

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

  // --ion-color-step-550 = popover checkbox borders
  // --ion-color-step-850 = popover checkbox labels
  return `
    --theme-switch-transition: ${fromStorage ? '' : transition};

    --ion-color-step-550: ${contrast(light).hex()};
    --ion-color-step-850: ${contrast(light).hex()};
    --ion-color-base: ${light};
    --ion-color-contrast: ${contrast(light).hex()};
    --ion-text-color: ${contrast(light).hex()};
    --ion-text-color-rgb: ${contrast(light).rgb().array()};
    --ion-background-color: ${light};
    --ion-overlay-background-color: ${light};
    --ion-tab-bar-background: ${light};
    --ion-tab-bar-color: ${dark};
    --ion-item-color: ${contrast(light).hex()};
    --ion-item-background: ${light};
    --ion-item-background-hover: ${primary};
    --ion-item-background-focused: ${primary};
    --ion-item-background-activated: ${primary};

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

function contrast(color, ratio = 3) {
  color = Color(color);
  return color.isDark() ? color.lighten(ratio) : color.darken(ratio);
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public nextTheme$ = new BehaviorSubject<any>({ loading: true });

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storage: Storage
  ) {
    this.storedTheme.then(theme => {
      this.setTheme(theme, true);
    });
    this.getNextTheme();
  }

  // Override all global variables with a new theme
  setTheme(theme, fromStorage = false) {
    const cssText = CSSTextGenerator(theme, fromStorage);
    this.setGlobalCSS(cssText);
    if (!fromStorage) {
      return this.storedTheme = theme;
    }
    return Promise.resolve();
  }

  // Define a single CSS variable
  setVariable(name, value) {
    this.document.documentElement.style.setProperty(name, value);
  }

  private setGlobalCSS(css: string) {
    this.document.documentElement.style.cssText = css;
  }

  get storedTheme() {
    return this.storage.get('theme');
  }

  set storedTheme(theme) {
    this.storage.set('theme', theme).then(() => this.getNextTheme);
  }

  getNextTheme() {
    return this.storedTheme.then(currentTheme => {
      let currentIndex = -1;
      if (currentTheme && currentTheme.name) {
        currentIndex = themes.findIndex(t => t.name === currentTheme.name);
      }
      const nextIndex = currentIndex + 1 >= themes.length ? 0 : currentIndex + 1 ;
      this.nextTheme$.next(themes[nextIndex]);
      return themes[nextIndex];
    });
  }

  toggleThemes() {
    return this.getNextTheme().then(t => this.setTheme(t));
  }
}
