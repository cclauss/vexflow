// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Font } from '../font';
import { GonvilleSmuflFont } from './gonville_glyphs';
import { GonvilleMetrics } from './gonville_metrics';

export function loadGonville() {
  Font.load('Gonville', GonvilleSmuflFont, GonvilleMetrics);
}
