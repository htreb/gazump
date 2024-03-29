import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(
    textToTruncate: string = '',
    maxLength: number = 30,
    trail: string = '...'
  ): string {
    return textToTruncate.length > maxLength
      ? textToTruncate.substring(0, maxLength).trim() + trail
      : textToTruncate;
  }
}
