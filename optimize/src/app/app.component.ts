import { StockPiece } from './models';
import { AfterViewInit, Component, Renderer2,ElementRef, ViewChild } from '@angular/core';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as htmlToPdfmake from 'html-to-pdfmake';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
//import * as html2canvas from 'html2canvas';

 

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {

  @ViewChild('pdfPageView',{static:true})
  pdfTable!: ElementRef;

  title = 'binpacker2d-ng';

  message = '';
  progress = 0;
  optimizing = false;
  optimizerResults = null;

  public Stocks:any;

  public Results:any;

  constructor(private renderer: Renderer2) {}

  onOptimizeStart() {
    this.progress = 0;
    this.optimizing = true;
    this.optimizerResults = null;
  }

  onOptimizeProgress(progress: number) {
    this.progress = progress;
  }

  onOptimizeFinish(results: object) {
    // console.log(results)
    this.optimizing = false;

   let StockPiece = results['stockPieces'].reverse();
   results['stockPieces']=StockPiece;
    this.optimizerResults = results;
    // results will be null if the optimization was cancelled
    if (results !== null) {
      // console.log(results);
      this.Stocks=results['stock'];
      this.Results=results;
      const fitness = results['fitness'].toFixed(5);
      this.message = `Fitness score: ${fitness}`;
    } else {
      this.message = '';
    }
  }

  onOptimizeError(msg: string) {
    this.optimizing = false;
    this.optimizerResults = null;
    this.message = `Error: ${msg}`;
  }


  wasteCalculation(piece:any,width:any,length:any){
    let total = 0;
    let Total = width*length;
    console.log(piece)
    piece.forEach(waste => {
      total=total+(waste.width * waste.length);
    });
    
    return ((total/Total)*100).toFixed(2);
  }

  ngAfterViewInit() {
    //let loader = this.renderer.selectRootElement('#loader');
    //this.renderer.setStyle(loader, 'display', 'none');
  }

  public downloadAsPDF() {

    

    let data = document.getElementById('mainContainer'); 
    
    var imgWidth = 210; 
var pageHeight = 297;  
var imgHeight = data.clientHeight * imgWidth / data.clientWidth;
var heightLeft = imgHeight;


   
    html2canvas(data).then(canvas => {
    const contentDataURL = canvas.toDataURL('image/png')  // 'image/jpeg' for lower quality output.
    

        var doc = new jspdf('p', 'mm','a4');
    var position = 0;

    doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    doc.save( 'file.pdf');
  }); 
     
  }
}
