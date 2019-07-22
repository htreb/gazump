import { Directive, TemplateRef, ViewContainerRef, OnInit, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {

  @Input('appHasPermission') permissions: string[];
  constructor(private auth: AuthService,
              private templateRef: TemplateRef<any>,
              private viewCont: ViewContainerRef) { }

    /**
     * This directive will add / remove elements as required based on matching user permissions with
     * inputted string array uses it by placing the directive on elements:
     *
     *          *appHasPermission = "['delete-ticket', 'add-ticket']"
     */
    ngOnInit() {
      if (this.auth.hasPermissions(this.permissions)) {
        this.viewCont.createEmbeddedView(this.templateRef);
      } else {
        this.viewCont.clear();
      }

      // use it
    }
}
