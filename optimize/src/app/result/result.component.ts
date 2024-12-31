import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

const CANVAS_SCALE = 0.8;

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
})
export class ResultComponent implements OnInit {
  @ViewChild('stockPieceCanvas', { static: false }) canvas: ElementRef;
  @Input() stockPiece: any;
  @Input() index: any;

  ngOnInit() {}

  ngAfterViewInit() {
    let canvas = this.canvas.nativeElement;
    let ctx = canvas.getContext('2d');

    ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
    ctx.lineWidth = 1*CANVAS_SCALE;
    ctx.translate(2, 2);

    ctx.fillStyle = '#AAAAAA';
    ctx.beginPath();
    ctx.rect(0, 0, this.stockPiece.width, this.stockPiece.length);
    ctx.fill();
    ctx.stroke();
    console.log(this.stockPiece)
    for (let cutPiece of this.stockPiece.cutPieces) {
      this.drawCutPiece(ctx, cutPiece);
    }
    for (let wastePiece of this.stockPiece.wastePieces) {
      if (wastePiece.width > 2 && wastePiece.length > 2) {
        this.drawWastePiece(ctx, wastePiece);
      }
    }
  }

  canvasWidth(): number {
    return (this.stockPiece.width + 4) * CANVAS_SCALE;
  }

  canvasHeight(): number {
    return (this.stockPiece.length + 4) * CANVAS_SCALE;
  }

  drawPatternDirection(ctx, cutPiece) {
    if (cutPiece.patternDirection === 'None') {
      return;
    }

    const inc = 1;
    const xPad = 0.1;
    const yPad = 0.1;
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.clip();
    if (cutPiece.patternDirection === 'ParallelToWidth') {
      ctx.beginPath();
      for (
        let i = cutPiece.y + inc;
        i < cutPiece.y + cutPiece.length;
        i += inc
      ) {
        ctx.moveTo(cutPiece.x + xPad, i);
        ctx.lineTo(cutPiece.x + cutPiece.width - xPad, i);
      }
      ctx.stroke();
    } else if (cutPiece.patternDirection === 'ParallelToLength') {
      ctx.beginPath();
      for (
        let i = cutPiece.x + inc;
        i < cutPiece.x + cutPiece.width;
        i += inc
      ) {
        ctx.moveTo(i, cutPiece.y + yPad);
        ctx.lineTo(i, cutPiece.y + cutPiece.length - yPad);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCutPiece(ctx, cutPiece) {
    console.log(this.stockPiece.stock)
    ctx.beginPath();
    ctx.rect(cutPiece.x, cutPiece.y, cutPiece.width, cutPiece.length);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();
    ctx.stroke();
    this.drawPatternDirection(ctx, cutPiece);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '22px Arial';
    let text = cutPiece.width + 'x' + cutPiece.length;
    let label = cutPiece.label;
   
    let metrics = ctx.measureText(text);
    ctx.save();
    ctx.translate(
      cutPiece.x + cutPiece.width / 2,
      cutPiece.y + cutPiece.length / 2
    );
    if (metrics.width > cutPiece.width && cutPiece.length > cutPiece.width) {
      ctx.rotate(-Math.PI / 2);
    }
    ctx.fillText(text, 0, 0);
    // ctx.fillText(label, 0, 20);
    ctx.restore();
  }

  drawWastePiece(ctx, wastePiece) {
    ctx.beginPath();
    ctx.fillStyle = '#95a5a6';
    ctx.rect(wastePiece.x, wastePiece.y, wastePiece.width, wastePiece.length);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '22px Arial';
    let text = wastePiece.width + 'x' + wastePiece.length;
    let metrics = ctx.measureText(text);
    ctx.save();
    ctx.translate(
      wastePiece.x + wastePiece.width / 2,
      wastePiece.y + wastePiece.length / 2
    );
    if (
      metrics.width > wastePiece.width &&
      wastePiece.length > wastePiece.width
    ) {
      ctx.rotate(-Math.PI / 2);
    }
    ctx.fillText(text, 0, 0);
   
    ctx.restore();
  }
}
