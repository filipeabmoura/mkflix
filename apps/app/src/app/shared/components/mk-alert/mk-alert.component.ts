import { Component, Input } from "@angular/core";

export type TMkAlertTipo = "erro" | "sucesso" | "info";

@Component({
  selector: "app-mk-alert",
  templateUrl: "./mk-alert.component.html",
  styleUrls: ["./mk-alert.component.css"]
})
export class MkAlertComponent {
  @Input() tipo: TMkAlertTipo = "info";

  @Input() mensagem: string | null = null;
}
