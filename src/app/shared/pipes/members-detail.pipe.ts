import { Pipe, PipeTransform } from '@angular/core';
import { ContactService } from 'src/app/services/contact.service';

@Pipe({
  name: 'membersDetail'
})
export class MembersDetailPipe implements PipeTransform {
  constructor(private contactService: ContactService) {}

  /**
   *
   * @param memberIds array of ids to show
   * @param allNames whether to print out all names or truncate after first two with ...and X more
   */
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
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });
    if (memberNames.length < 4 || allNames) {
      if (memberNames.length === 1 && memberNames[0] === 'You') {
        return 'Only You';
      }
      return `${memberNames.slice(0, memberNames.length - 1).join(', ')} and ${
        memberNames[memberNames.length - 1]
      }.`;
    }
    return `${memberNames.slice(0, 2).join(', ')} and ${memberNames.length -
      2} others.`;
  }
}
