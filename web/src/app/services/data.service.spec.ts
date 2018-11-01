import { TestBed } from '@angular/core/testing';

import { getContrastYIQ } from '../services/data.service';

describe('DataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  const testColorsForWhiteFont = [
    '#dc1010',
    '#0409b0',
    '#ac6d00',
    '#9a0396',
    '#1bb912'
  ];

  const testColorsForBlackFont = [
    '#efbcf7',
    '#60fff8',
    '#fff464',
    '#c3adff',
    '#80ff7e'
  ];

  testColorsForWhiteFont.forEach(color => {
    it('should set a white font for ' + color, () => {
      expect(getContrastYIQ(color)).toEqual('white');
    });
  });

  testColorsForBlackFont.forEach(color => {
    it('should set a black font for ' + color, () => {
      expect(getContrastYIQ(color)).toEqual('black');
    });
  });
});
