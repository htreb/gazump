import { Pipe, PipeTransform } from '@angular/core';
import { ContactService } from 'src/app/services/contact.service';

@Pipe({
  name: 'membersDetail'
})
export class MembersDetailPipe implements PipeTransform {
  constructor(private contactService: ContactService) {}

  transform(memberIds: any, allNames = false): any {
    const memberNames = memberIds.map(
      id => this.contactService.getDetailsFromId(id).userName
    );
    memberNames.sort((a, b) => {
      if (a === 'Unknown') {
        return 1;
      }
      if (b === 'Unknown') {
        return -1;
      }
      return a < b ? -1 : 1;
    });
    if (memberNames.length < 4 || allNames) {
      return `${memberNames.slice(0, memberNames.length - 1).join(', ')} and ${
        memberNames[memberNames.length - 1]
      }.`;
    }
    return `${memberNames.slice(0, 2).join(', ')} and ${memberNames.length -
      2} others.`;
  }
}
