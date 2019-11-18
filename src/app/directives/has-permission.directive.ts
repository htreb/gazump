import { Directive, TemplateRef, ViewContainerRef, OnInit, Input } from '@angular/core';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {

  @Input('appHasPermission') permissions: string[];
  constructor(private templateRef: TemplateRef<any>,
              private viewCont: ViewContainerRef) { }

    /**
     * This directive will add / remove elements as required based on matching user permissions with
     * inputted string array uses it by placing the directive on elements:
     *
     *          *appHasPermission = "['delete-ticket', 'add-ticket']"
     */
    ngOnInit() {
      if (false) {
        // should show
        this.viewCont.createEmbeddedView(this.templateRef);
      } else {
        // shouldn't show
        this.viewCont.clear();
      }
    }
}
