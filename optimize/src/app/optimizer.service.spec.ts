import { TestBed } from '@angular/core/testing';

import { OptimizerService } from './optimizer.service';

describe('OptimizerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OptimizerService = TestBed.get(OptimizerService);
    expect(service).toBeTruthy();
  });
});
