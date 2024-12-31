import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPieceComponent } from './stock-piece.component';

describe('StockPieceComponent', () => {
  let component: StockPieceComponent;
  let fixture: ComponentFixture<StockPieceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockPieceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
