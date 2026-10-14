// The rrule library. It ships CommonJS to Node and an ES module to bundlers, and Node's ESM
// loader cannot see its named exports, so they are read from whichever form was loaded. This
// keeps the package importable in plain Node (server-side rendering, scripts, tests).
import * as rruleModule from 'rrule';

const rrule = rruleModule.rrulestr ? rruleModule : rruleModule.default;

export const { RRule, rrulestr } = rrule;
