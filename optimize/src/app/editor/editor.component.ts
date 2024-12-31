import { PatternDirection } from './../models';
import { Component, EventEmitter, Output, OnInit,Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
} from '@angular/forms';
import { OptimizerService } from '../optimizer.service';
import { CutPiece, StockPiece,OptimizeMethod } from '../models';

import { ApiService } from './../api.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  @Output() optimizeStart = new EventEmitter();
  @Output() optimizeProgress = new EventEmitter<number>();
  @Output() optimizeFinish = new EventEmitter();
  @Output() optimizeError = new EventEmitter<string>();
  order: string;

  Stocks: any = [];
  Panel: any = [];

  optimizing = false;

  form: FormGroup = this.fb.group({
    optimizeMethod: this.fb.control('', [Validators.required]),
    cutWidth: this.fb.control('', [Validators.required]),
    stockPieces: this.fb.array([]),
    cutPieces: this.fb.array([]),
  });

  constructor(
    private fb: FormBuilder,
    private optimizerService: OptimizerService,
    private api: ApiService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.optimizeMethodControl.setValue(this.optimizerService.optimizeMethod);
    this.cutWidthControl.setValue(this.optimizerService.cutWidth);
    this.getStockPieces();
    this.getCutPieces();
    console.log(this.route.snapshot.paramMap.get('cutlist'));
    
    this.route.queryParams
      .subscribe(params => {
        if(params.cutlist!=undefined){
          this.getStocksApi(params.cutlist);
        }
        
      }
    );
  }

  get optimizeMethodControl() {
    return this.form.controls.optimizeMethod as FormControl;
  }

  get cutWidthControl() {
    return this.form.controls.cutWidth as FormControl;
  }

  getStocksApi(report) {
      let stockPiece = [{
      enabled: true,
      length: "2400",
      patternDirection: "None",
      width: "1200"
  }];
  console.log(JSON.parse(report))
  let data = {
    stock : stockPiece,
    cut : JSON.parse(report)
  };

  let loader = this.renderer.selectRootElement('#loader');
  this.renderer.setStyle(loader, 'display', 'none');
  this.Stocks = data;
  this.onSubmit();
  
      // this.api.getStock(report)
      // .subscribe(data => {
       
      // });
    
    
  }

  getStockPieces() {
    this.optimizerService
      .getStockPieces()
      .subscribe((stockPieces: StockPiece[]) => {
        for (let stockPiece of stockPieces) {
          this.addStockPiece(
            stockPiece.enabled,
            stockPiece.width.toString(),
            stockPiece.length.toString(),
            stockPiece.patternDirection.toString()
          );
        }
      });
  }

  get stockPieceFormArray() {
    return this.form.controls.stockPieces as FormArray;
  }

  addStockPiece(
    enabled: boolean,
    width: string,
    length: string,
    patternDirection: string
  ) {
    let stockPieceGroup = this.fb.group({
      enabled: [enabled],
      width: [width, Validators.required],
      length: [length, Validators.required],
      patternDirection: [patternDirection, Validators.required],
    });

    this.stockPieceFormArray.push(stockPieceGroup);
  }

  newStockPiece() {
    this.addStockPiece(true, '', '', '');
  }

  removeStockPiece(index: number) {
    this.stockPieceFormArray.removeAt(index);
  }

  getCutPieces() {
    this.optimizerService.getCutPieces().subscribe((cutPieces: CutPiece[]) => {
      let cutPieceQuantities = new Map<string, number>();
      for (let cutPiece of cutPieces) {
        let key = JSON.stringify(cutPiece);
        const quantity = cutPieceQuantities.get(key) || 0;
        cutPieceQuantities.set(key, quantity + 1);
      }

      for (let [key, quantity] of cutPieceQuantities) {
        const cutPiece = JSON.parse(key);
        this.addCutPiece(
          cutPiece.enabled,
          quantity.toString(),
          cutPiece.width.toString(),
          cutPiece.length.toString(),
          cutPiece.patternDirection.toString()
        );
      }
    });
  }

  get cutPieceFormArray() {
    return this.form.controls.cutPieces as FormArray;
  }

  addCutPiece(
    enabled: boolean,
    quantity: string,
    width: string,
    length: string,
    patternDirection: string
  ) {
    let cutPieceGroup = this.fb.group({
      enabled: [enabled],
      quantity: [quantity, Validators.required],
      width: [width, Validators.required],
      length: [length, Validators.required],
      patternDirection: [patternDirection, Validators.required],
    });

    this.cutPieceFormArray.push(cutPieceGroup);
  }

  newCutPiece() {
    this.addCutPiece(true, '', '', '', '');
  }

  removeCutPiece(index: number) {
    this.cutPieceFormArray.removeAt(index);
  }

  onSubmit() {
    this.optimizerService.optimizeMethod = "guillotine" as OptimizeMethod;
    this.optimizerService.cutWidth = 0;

    this.optimizerService.clearStockPieces();
    for (let control of this.Stocks.stock) {
     
      this.optimizerService.addStockPiece({
        enabled: control.enabled,
        width: control.width,
        length: control.length,
        patternDirection: control.patternDirection,
      });
    }

    this.optimizerService.clearCutPieces();
    for (let control of this.Stocks.cut) {
        let panel = control;
        
        // panel.forEach(element => {
          if(panel.width!=0 && panel.height!=0){
            // for (let index = 0; index < panel.qty; index++) {
              this.Panel.push(panel);
              this.optimizerService.addCutPiece({
                enabled: true,
                width: panel.width,
                length: panel.length,
                label:panel.label,
                patternDirection: "None" as PatternDirection,
              });
              
            // }
           
          }
          
        // });
        
      
    }

    console.log(this.optimizerService);

    this.optimizing = true;
    this.optimizeStart.emit();

    this.optimizerService.optimize().subscribe({
      next: data => {
        if (data.type === 'progress') {
          this.optimizeProgress.emit(Math.round(data.progress * 100));
        } else if (data.type === 'finished') {
          this.optimizing = false;
          data.solution.stock=this.Panel;
          this.optimizeFinish.emit(data.solution);
        }
      },
      error: msg => {
        this.optimizing = false;
        this.optimizeError.emit(msg);
      },
    });
  }

  cancel() {
    this.optimizerService.cancel();
    this.optimizing = false;
    this.optimizeFinish.emit(null);
  }
}
