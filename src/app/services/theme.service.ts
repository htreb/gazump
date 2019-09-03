import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Color from 'color';
import { Storage } from '@ionic/storage';

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
    name: 'default',
    icon: defaults.icon,
    // colors auto filled inside CSSTextGenerator
  },
  {
    name: 'autumn',
    icon: 'partly-sunny',
    primary: '#F78154',
    secondary: '#4D9078',
    tertiary: '#B4436C',
    light: '#FDE8DF',
    medium: '#FCD0A2',
    dark: '#B89876'
  },
  {
    name: 'night',
    icon: 'moon',
    primary: '#8CBA80',
    secondary: '#FCFF6C',
    tertiary: '#FE5F55',
    medium: '#BCC2C7',
    dark: '#F7F7FF',
    light: '#495867'
  },
  {
    name: 'neon',
    icon: 'flash',
    primary: '#39BFBD',
    secondary: '#4CE0B3',
    tertiary: '#FF5E79',
    light: '#F4EDF2',
    medium: '#B682A5',
    dark: '#34162A'
  }
];

function CSSTextGenerator(colors) {
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

  // TODO add the rgb values as well
  return `
    --ion-color-base: ${light};
    --ion-color-contrast: ${dark};
    --ion-background-color: ${light};
    --ion-text-color: ${dark};
    --ion-toolbar-background-color: ${contrast(light, 0.1)};
    --ion-toolbar-text-color: ${contrast(dark, 0.1)};
    --ion-item-background-color: ${contrast(light, 0.3)};
    --ion-item-text-color: ${contrast(dark, 0.3)};
    --ion-color-primary: ${primary};
    --ion-color-primary-rgb: ${Color(primary).rgb().array()};
    --ion-color-primary-contrast: ${contrast(primary)};
    --ion-color-primary-contrast-rgb: ${contrast(primary).rgb().array()};
    --ion-color-primary-shade:  ${Color(primary).darken(shadeRatio)};
    --ion-color-primary-tint:  ${Color(primary).lighten(tintRatio)};
    --ion-color-secondary: ${secondary};
    --ion-color-secondary-rgb: ${Color(secondary).rgb().array()};
    --ion-color-secondary-contrast: ${contrast(secondary)};
    --ion-color-secondary-contrast-rgb: ${contrast(secondary).rgb().array()};
    --ion-color-secondary-shade:  ${Color(secondary).darken(shadeRatio)};
    --ion-color-secondary-tint: ${Color(secondary).lighten(tintRatio)};
    --ion-color-tertiary:  ${tertiary};
    --ion-color-tertiary-rgb: ${Color(tertiary).rgb().array()};
    --ion-color-tertiary-contrast: ${contrast(tertiary)};
    --ion-color-tertiary-contrast-rgb: ${contrast(tertiary).rgb().array()};
    --ion-color-tertiary-shade: ${Color(tertiary).darken(shadeRatio)};
    --ion-color-tertiary-tint:  ${Color(tertiary).lighten(tintRatio)};
    --ion-color-success: ${success};
    --ion-color-success-rgb: ${Color(success).rgb().array()};
    --ion-color-success-contrast: ${contrast(success)};
    --ion-color-success-contrast-rgb: ${contrast(success).rgb().array()};
    --ion-color-success-shade: ${Color(success).darken(shadeRatio)};
    --ion-color-success-tint: ${Color(success).lighten(tintRatio)};
    --ion-color-warning: ${warning};
    --ion-color-warning-rgb: ${Color(warning).rgb().array()};
    --ion-color-warning-contrast: ${contrast(warning)};
    --ion-color-warning-contrast-rgb: ${contrast(warning).rgb().array()};
    --ion-color-warning-shade: ${Color(warning).darken(shadeRatio)};
    --ion-color-warning-tint: ${Color(warning).lighten(tintRatio)};
    --ion-color-danger: ${danger};
    --ion-color-danger-rgb: ${Color(danger).rgb().array()};
    --ion-color-danger-contrast: ${contrast(danger)};
    --ion-color-danger-contrast-rgb: ${contrast(danger).rgb().array()};
    --ion-color-danger-shade: ${Color(danger).darken(shadeRatio)};
    --ion-color-danger-tint: ${Color(danger).lighten(tintRatio)};
    --ion-color-dark: ${dark};
    --ion-color-dark-rgb: ${Color(dark).rgb().array()};
    --ion-color-dark-contrast: ${contrast(dark)};
    --ion-color-dark-contrast-rgb: ${contrast(dark).rgb().array()};
    --ion-color-dark-shade: ${Color(dark).darken(shadeRatio)};
    --ion-color-dark-tint: ${Color(dark).lighten(tintRatio)};
    --ion-color-medium: ${medium};
    --ion-color-medium-rgb: ${Color(medium).rgb().array()};
    --ion-color-medium-contrast: ${contrast(medium)};
    --ion-color-medium-contrast-rgb: ${contrast(medium).rgb().array()};
    --ion-color-medium-shade: ${Color(medium).darken(shadeRatio)};
    --ion-color-medium-tint: ${Color(medium).lighten(tintRatio)};
    --ion-color-light: ${light};
    --ion-color-light-rgb: ${Color(light).rgb().array()};
    --ion-color-light-contrast: ${contrast(light)};
    --ion-color-light-contrast-rgb: ${contrast(light).rgb().array()};
    --ion-color-light-shade: ${Color(light).darken(shadeRatio)};
    --ion-color-light-tint: ${Color(light).lighten(tintRatio)};`;
}

function contrast(color, ratio = 0.8) {
  color = Color(color);
  return color.isDark() ? color.lighten(ratio) : color.darken(ratio);
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  currentTheme; // needed? use case?

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storage: Storage
  ) {
    this.storedTheme.then(theme => {
      this.setTheme(theme, true);
    });
  }

  // Override all global variables with a new theme
  setTheme(theme, fromStorage = false) {
    const cssText = CSSTextGenerator(theme);
    this.setGlobalCSS(cssText);
    if (!fromStorage) {
      return this.storage.set('theme', theme);
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

  getNextTheme() {
    return this.storedTheme.then(currentTheme => {
      let currentIndex = -1;
      if (currentTheme && currentTheme.name) {
        currentIndex = themes.findIndex(t => t.name === currentTheme.name);
      }
      const nextIndex = currentIndex + 1 >= themes.length ? 0 : currentIndex + 1 ;
      return themes[nextIndex];
    });
  }

  setNextTheme() {
    return this.getNextTheme().then(t => this.setTheme(t));
  }
}
