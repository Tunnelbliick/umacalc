import { TestBed } from '@angular/core/testing';

import { LoadTracksService } from './load-tracks.service';

describe('LoadTracksService', () => {
  let service: LoadTracksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadTracksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
