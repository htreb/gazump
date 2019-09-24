import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'membersDetail'
})
export class MembersDetailPipe implements PipeTransform {
  transform(members: any): any {
    const memberNames = Object.values(members).map((member: any) => member.userName);
    if (memberNames.length < 4) {
      return `${memberNames.join(', ')}.`;
    }
    return `${memberNames.slice(0, 2).join(', ')} and ${memberNames.length - 2} others.`;
  }
}
