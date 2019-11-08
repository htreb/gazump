import {
  Component,
  ViewChildren,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-sliding-list',
  templateUrl: './sliding-list.component.html',
  styleUrls: ['./sliding-list.component.scss'],
})
export class SlidingListComponent implements OnChanges, OnDestroy {

  @Input() items;
  @Output() listChanged = new EventEmitter<any>(true);
  @ViewChildren('slidingItem') slidingItems: any;
  private slidingItemsOpen = {};
  private openedAllSlidingItemsFromMenu = false;

  constructor() { }

  @Input() onClick = (item?) => {};
  @Input() onEdit = (item?) => {};
  @Input() onDelete = (item?) => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      this.listChanged.emit({
        items: this.items && this.items.length > 0,
        openAll: () => this.openAllSlidingOptions(),
        closeAll: () => this.closeAllSlidingItems(),
      });
    }
  }

  ngOnDestroy(): void {
    this.listChanged.emit({
      items: false,
      openAll: () => this.openAllSlidingOptions(),
      closeAll: () => this.closeAllSlidingItems(),
    });
  }

  closeAllSlidingItems() {
    this.slidingItems.forEach((item) => {
      item.close();
    });
    this.slidingItemsOpen = {};
    this.openedAllSlidingItemsFromMenu = false;
  }

  openAllSlidingOptions() {
    // if one is open for some reason this closes it.
    // make sure they are all closed before opening them all.
    this.closeAllSlidingItems();
    this.slidingItems.forEach((item) => {
      item.open();
    });
    this.openedAllSlidingItemsFromMenu = true;
  }

  slidingItemDragged(ratio, id) {
    this.slidingItemsOpen[id] = ratio === 1;
  }

  onItemClick(item) {
    if (Object.values(this.slidingItemsOpen).filter(v => v).length) {
      this.closeAllSlidingItems();
    } else {
      this.onClick(item);
    }
  }

  slidingItemClicked() {
    if (this.openedAllSlidingItemsFromMenu) {
      this.closeAllSlidingItems();
    }
  }
}
