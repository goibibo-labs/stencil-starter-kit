import buildFont from './build-font';
import buildSpacing from './build-spacing';
import buildMisc from './build-misc';
import {buildColors} from './build-color';

export interface Theme {
  font: ReturnType<typeof buildFont>;
  spacing: ReturnType<typeof buildSpacing>;
  misc: ReturnType<typeof buildMisc>;
  colors: ReturnType<typeof buildColors>;
}
