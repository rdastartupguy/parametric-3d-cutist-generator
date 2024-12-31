import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-stock-piece",
  templateUrl: "./stock-piece.component.html",
  styleUrls: ["./stock-piece.component.css"]
})
export class StockPieceComponent implements OnInit {
  stockPieceForm = new FormGroup({
    width: new FormControl("", Validators.required),
    height: new FormControl("", Validators.required),
    patternDirection: new FormControl("", Validators.required)
  });

  constructor() {}

  ngOnInit() {}
}
