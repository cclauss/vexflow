// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna Cheppudira 2013.
// Co-author: Benjamin W. Bohl
// MIT License

import { Glyph } from './glyph';
import { Stave } from './stave';
import { StaveModifier, StaveModifierPosition } from './stavemodifier';
import { Tables } from './tables';
import { Category } from './typeguard';
import { defined, log } from './util';

export interface ClefType {
  point: number;
  code: string;
  line: number;
}

export interface ClefAnnotatiomType extends ClefType {
  x_shift: number;
  code: string;
  line: number;
}

export interface ClefMetrics {
  width: number;
  annotations: {
    [key: string]: {
      point: number;
      [type: string]: { line?: number; shiftX?: number } | number;
    };
  };
}

// eslint-disable-next-line
function L(...args: any[]) {
  if (Clef.DEBUG) log('Vex.Flow.Clef', args);
}

/**
 * Clef implements various types of clefs that can be rendered on a stave.
 *
 * See `tests/clef_tests.ts` for usage examples.
 */
export class Clef extends StaveModifier {
  /** To enable logging for this class, set `Vex.Flow.Clef.DEBUG` to `true`. */
  static DEBUG: boolean = false;

  static get CATEGORY(): string {
    return Category.Clef;
  }

  annotation?: ClefAnnotatiomType;

  /**
   * The attribute `clef` must be a key from
   * `Clef.types`
   */
  clef: ClefType = Clef.types['treble'];

  protected attachment?: Glyph;
  protected size?: string;
  protected type?: string;

  /**
   * Every clef name is associated with a glyph code from the font file
   * and a default stave line number.
   */
  static get types(): Record<string, ClefType> {
    return {
      treble: {
        code: 'gClef',
        line: 3,
        point: 0,
      },
      bass: {
        code: 'fClef',
        line: 1,
        point: 0,
      },
      alto: {
        code: 'cClef',
        line: 2,
        point: 0,
      },
      tenor: {
        code: 'cClef',
        line: 1,
        point: 0,
      },
      percussion: {
        code: 'unpitchedPercussionClef1',
        line: 2,
        point: 0,
      },
      soprano: {
        code: 'cClef',
        line: 4,
        point: 0,
      },
      'mezzo-soprano': {
        code: 'cClef',
        line: 3,
        point: 0,
      },
      'baritone-c': {
        code: 'cClef',
        line: 0,
        point: 0,
      },
      'baritone-f': {
        code: 'fClef',
        line: 2,
        point: 0,
      },
      subbass: {
        code: 'fClef',
        line: 0,
        point: 0,
      },
      french: {
        code: 'gClef',
        line: 4,
        point: 0,
      },
      tab: {
        code: '6stringTabClef',
        line: 3,
        point: 0,
      },
    };
  }

  static get annotationSmufl(): Record<string, string> {
    return {
      '8va': 'timeSig8',
      '8vb': 'timeSig8',
    };
  }

  /** Create a new clef. */
  constructor(type: string, size?: string, annotation?: string) {
    super();

    this.setPosition(StaveModifierPosition.BEGIN);
    this.setType(type, size, annotation);
    this.setWidth(Glyph.getWidth(this.clef.code, this.clef.point, `clef_${this.size}`));
    L('Creating clef:', type);
  }

  /** Set clef type, size and annotation. */
  setType(type: string, size?: string, annotation?: string): this {
    this.type = type;
    this.clef = Clef.types[type];
    if (size === undefined) {
      this.size = 'default';
    } else {
      this.size = size;
    }

    const musicFont = Tables.currentMusicFont();

    // If an annotation, such as 8va, is specified, add it to the Clef object.
    if (annotation !== undefined) {
      const code = Clef.annotationSmufl[annotation];
      const point = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.point`);
      const line = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.line`);
      const x_shift = musicFont.lookupMetric(`clef_${this.size}.annotations.${annotation}.${this.type}.shiftX`);

      this.annotation = { code, point, line, x_shift };

      this.attachment = new Glyph(this.annotation.code, this.annotation.point);
      this.attachment.metrics.x_max = 0;
      this.attachment.setXShift(this.annotation.x_shift);
    } else {
      this.annotation = undefined;
    }

    return this;
  }

  /** Get clef width. */
  getWidth(): number {
    if (this.type === 'tab') {
      defined(this.stave, 'ClefError', "Can't get width without stave.");
    }
    return this.width;
  }

  /** Set associated stave. */
  setStave(stave: Stave): this {
    this.stave = stave;
    return this;
  }

  /** Render clef. */
  draw(): void {
    const stave = this.checkStave();
    const ctx = stave.checkContext();
    this.setRendered();

    this.applyStyle(ctx);
    ctx.openGroup('clef', this.getAttribute('id'));
    Glyph.renderGlyph(ctx, this.x, stave.getYForLine(this.clef.line), this.clef.point, this.clef.code, {
      category: `clef_${this.size}`,
    });
    if (this.annotation !== undefined && this.attachment !== undefined) {
      this.placeGlyphOnLine(this.attachment, stave, this.annotation.line);
      this.attachment.setStave(stave);
      this.attachment.setContext(ctx);
      this.attachment.renderToStave(this.x);
    }
    ctx.closeGroup();
    this.restoreStyle(ctx);
  }
}
