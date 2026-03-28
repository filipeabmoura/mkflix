import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MkAlertComponent } from "./components/mk-alert/mk-alert.component";
import { MkButtonComponent } from "./components/mk-button/mk-button.component";
import { MkPageTitleComponent } from "./components/mk-page-title/mk-page-title.component";

@NgModule({
  declarations: [MkAlertComponent, MkPageTitleComponent, MkButtonComponent],
  imports: [CommonModule],
  exports: [MkAlertComponent, MkPageTitleComponent, MkButtonComponent, CommonModule]
})
export class SharedModule {}
