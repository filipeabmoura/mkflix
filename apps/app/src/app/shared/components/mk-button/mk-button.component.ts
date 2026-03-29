import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-mk-button",
  templateUrl: "./mk-button.component.html",
  styleUrls: ["./mk-button.component.css"]
})
export class MkButtonComponent {
  @Input() label = "";

  @Input() loading = false;

  @Input() disabled = false;

  @Input() variante: "primaria" | "secundaria" | "fantasma" = "primaria";

  @Input() tipoHtml: "button" | "submit" = "button";

  @Input() larguraTotal = false;

  @Output() readonly clique = new EventEmitter<MouseEvent>();

  aoClicar(evento: MouseEvent): void {
    if (this.disabled || this.loading) {
      evento.preventDefault();
      evento.stopPropagation();
      return;
    }
    this.clique.emit(evento);
  }

  classesBotao(): string {
    const base = "mk-button";
    const v =
      this.variante === "primaria"
        ? "mk-button--primaria"
        : this.variante === "secundaria"
          ? "mk-button--secundaria"
          : "mk-button--fantasma";
    const w = this.larguraTotal ? " mk-button--full" : "";
    return `${base} ${v}${w}`;
  }
}
