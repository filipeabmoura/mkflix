import { Component, Input } from "@angular/core";

@Component({
  selector: "app-mk-page-title",
  templateUrl: "./mk-page-title.component.html",
  styleUrls: ["./mk-page-title.component.css"]
})
export class MkPageTitleComponent {
  @Input({ required: true }) titulo!: string;

  @Input() subtitulo: string | null = null;
}
