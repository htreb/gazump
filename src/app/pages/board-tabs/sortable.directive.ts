import { Directive, AfterViewInit, ContentChildren, QueryList, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { Sortable, Plugins } from '@shopify/draggable';
import SwapAnimation from '@shopify/draggable/lib/plugins/swap-animation';

@Directive({
  selector: '[appSortable]'
})
export class SortableDirective implements AfterViewInit, OnDestroy {

  private sortable: any;
  private containers: any;
  @Output() stop = new EventEmitter();
  @Output() drag = new EventEmitter();
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

    this.sortable.on('sortable:stop', e => this.handleStop(e));
    this.sortable.on('drag:move', e => this.handleDrag(e));
  }

  ngOnDestroy() {
    this.sortable.destroy();
  }

  handleStop(event) {
    this.stop.emit(event);
  }

  handleDrag(event) {
    this.drag.emit(event);
  }
}
