import { Component, OnInit, HostListener } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-ticket-picker',
  templateUrl: './ticket-picker.component.html',
  styleUrls: ['./ticket-picker.component.scss']
})
export class TicketPickerComponent implements OnInit {
  tickets = [
    { title: 'Amsterdam', checked: false, hide: false },
    { title: 'Bogota', checked: false, hide: false },
    { title: 'Buenos Aires', checked: false, hide: false },
    { title: 'Cairo', checked: false, hide: false },
    { title: 'Dhaka', checked: false, hide: false },
    { title: 'Edinburgh', checked: false, hide: false },
    { title: 'Geneva', checked: false, hide: false },
    { title: 'Genoa', checked: false, hide: false },
    { title: 'Glasglow', checked: false, hide: false },
    { title: 'Hanoi', checked: false, hide: false },
    { title: 'Hong Kong', checked: false, hide: false },
    { title: 'Islamabad', checked: false, hide: false },
    { title: 'Istanbul', checked: false, hide: false },
    { title: 'Jakarta', checked: false, hide: false },
    { title: 'Kiel', checked: false, hide: false },
    { title: 'Kyoto', checked: false, hide: false },
    { title: 'Le Havre', checked: false, hide: false },
    { title: 'Lebanon', checked: false, hide: false },
    { title: 'Lhasa', checked: false, hide: false },
    { title: 'Lima', checked: false, hide: false },
    { title: 'London', checked: false, hide: false },
    { title: 'Los Angeles', checked: false, hide: false },
    { title: 'Madrid', checked: false, hide: false },
    { title: 'Manila', checked: false, hide: false },
    { title: 'New York', checked: false, hide: false },
    { title: 'Olympia', checked: false, hide: false },
    { title: 'Oslo', checked: false, hide: false },
    { title: 'Panama City', checked: false, hide: false },
    { title: 'Peking', checked: false, hide: false },
    { title: 'Philadelphia', checked: false, hide: false },
    { title: 'San Francisco', checked: false, hide: false },
    { title: 'Seoul', checked: false, hide: false },
    { title: 'Taipeh', checked: false, hide: false },
    { title: 'Tel Aviv', checked: false, hide: false },
    { title: 'Tokio', checked: false, hide: false },
    { title: 'Uelzen', checked: false, hide: false },
    { title: 'Washington', checked: false, hide: false }
  ];

  constructor(private popover: PopoverController) {}

  ngOnInit() {}

  @HostListener('window:resize', ['$event'])
  closeSettings(ev: any) {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  handleInput(event) {
    const query = event.target.value.toLowerCase();
    this.tickets.forEach(ticket => {
      ticket.hide = ticket.title.toLowerCase().indexOf(query) === -1;
    });
  }

  submit() {
    const selected = this.tickets.filter(t => t.checked);
    console.log('you have finished picking tickets and you chose', selected);
  }
}
