import { Directive, AfterViewInit, ContentChildren, QueryList } from '@angular/core';
import { Sortable, Plugins } from '@shopify/draggable';
import SwapAnimation from '@shopify/draggable/lib/plugins/swap-animation';

@Directive({
  selector: '[appSortable]'
})
export class SortableDirective implements AfterViewInit {

  private sortable: any;
  private containers: any;
  @ContentChildren('sortContainer') containersRef: QueryList<any>;

  constructor() { }

  ngAfterViewInit() {
    this.containers = this.containersRef.toArray().map(container =>  container.nativeElement);
    this.sortable = new Sortable(this.containers, {
      draggable: '.draggable',
      delay: 300,
      swapAnimation: {
        duration: 250,
        easingFunction: 'ease-in-out'
      },
      plugins: [Plugins.SwapAnimation],
      mirror: {
        constrainDimensions: true,
        appendTo: 'body',
      },
      scrollable: {
        scrollableElements:
        [
          ...this.containers
        ],
      },
    });
  }

}
