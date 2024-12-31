import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandPieceComponent } from './demand-piece.component';

describe('DemandPieceComponent', () => {
  let component: DemandPieceComponent;
  let fixture: ComponentFixture<DemandPieceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandPieceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandPieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
