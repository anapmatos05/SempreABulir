import { TestBed } from '@angular/core/testing';

import { Grupo } from './grupo';

describe('Grupo', () => {
  let service: Grupo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Grupo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
