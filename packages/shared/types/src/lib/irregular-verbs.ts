/** Curated irregular verb forms for drills and vocabulary display. */
export type IrregularVerbTier = 'common' | 'extended';

export type IrregularVerbEntry = {
  base: string;
  pastSimple: string;
  pastParticiple: string;
  tier: IrregularVerbTier;
};

/** Everyday irregular verbs (A1–B2); extended tier adds the full catalog. */
const COMMON_IRREGULAR_VERB_BASES = new Set([
  'be',
  'begin',
  'break',
  'bring',
  'build',
  'become',
  'buy',
  'catch',
  'choose',
  'come',
  'cut',
  'do',
  'drink',
  'drive',
  'eat',
  'fall',
  'feel',
  'fight',
  'find',
  'fly',
  'forget',
  'get',
  'give',
  'go',
  'grow',
  'have',
  'hear',
  'hold',
  'keep',
  'know',
  'learn',
  'leave',
  'let',
  'lose',
  'make',
  'mean',
  'meet',
  'pay',
  'put',
  'read',
  'run',
  'say',
  'see',
  'sell',
  'send',
  'set',
  'show',
  'sing',
  'sit',
  'sleep',
  'speak',
  'spend',
  'stand',
  'swim',
  'take',
  'teach',
  'tell',
  'think',
  'throw',
  'understand',
  'wake',
  'wear',
  'win',
  'write',
]);

type RawIrregularVerbEntry = Omit<IrregularVerbEntry, 'tier'>;

const RAW_IRREGULAR_VERBS: RawIrregularVerbEntry[] = [
  { base: 'be', pastSimple: 'was/were', pastParticiple: 'been' },
  { base: 'beat', pastSimple: 'beat', pastParticiple: 'beaten' },
  { base: 'become', pastSimple: 'became', pastParticiple: 'become' },
  { base: 'begin', pastSimple: 'began', pastParticiple: 'begun' },
  { base: 'bend', pastSimple: 'bent', pastParticiple: 'bent' },
  { base: 'bet', pastSimple: 'bet', pastParticiple: 'bet' },
  { base: 'bid', pastSimple: 'bid', pastParticiple: 'bid' },
  { base: 'bind', pastSimple: 'bound', pastParticiple: 'bound' },
  { base: 'bite', pastSimple: 'bit', pastParticiple: 'bitten' },
  { base: 'bleed', pastSimple: 'bled', pastParticiple: 'bled' },
  { base: 'blow', pastSimple: 'blew', pastParticiple: 'blown' },
  { base: 'break', pastSimple: 'broke', pastParticiple: 'broken' },
  { base: 'bring', pastSimple: 'brought', pastParticiple: 'brought' },
  { base: 'broadcast', pastSimple: 'broadcast', pastParticiple: 'broadcast' },
  { base: 'build', pastSimple: 'built', pastParticiple: 'built' },
  { base: 'burn', pastSimple: 'burnt', pastParticiple: 'burnt' },
  { base: 'burst', pastSimple: 'burst', pastParticiple: 'burst' },
  { base: 'buy', pastSimple: 'bought', pastParticiple: 'bought' },
  { base: 'catch', pastSimple: 'caught', pastParticiple: 'caught' },
  { base: 'choose', pastSimple: 'chose', pastParticiple: 'chosen' },
  { base: 'cling', pastSimple: 'clung', pastParticiple: 'clung' },
  { base: 'come', pastSimple: 'came', pastParticiple: 'come' },
  { base: 'cost', pastSimple: 'cost', pastParticiple: 'cost' },
  { base: 'creep', pastSimple: 'crept', pastParticiple: 'crept' },
  { base: 'cut', pastSimple: 'cut', pastParticiple: 'cut' },
  { base: 'deal', pastSimple: 'dealt', pastParticiple: 'dealt' },
  { base: 'dig', pastSimple: 'dug', pastParticiple: 'dug' },
  { base: 'do', pastSimple: 'did', pastParticiple: 'done' },
  { base: 'draw', pastSimple: 'drew', pastParticiple: 'drawn' },
  { base: 'dream', pastSimple: 'dreamt', pastParticiple: 'dreamt' },
  { base: 'drink', pastSimple: 'drank', pastParticiple: 'drunk' },
  { base: 'drive', pastSimple: 'drove', pastParticiple: 'driven' },
  { base: 'eat', pastSimple: 'ate', pastParticiple: 'eaten' },
  { base: 'fall', pastSimple: 'fell', pastParticiple: 'fallen' },
  { base: 'feed', pastSimple: 'fed', pastParticiple: 'fed' },
  { base: 'feel', pastSimple: 'felt', pastParticiple: 'felt' },
  { base: 'fight', pastSimple: 'fought', pastParticiple: 'fought' },
  { base: 'find', pastSimple: 'found', pastParticiple: 'found' },
  { base: 'flee', pastSimple: 'fled', pastParticiple: 'fled' },
  { base: 'fling', pastSimple: 'flung', pastParticiple: 'flung' },
  { base: 'fly', pastSimple: 'flew', pastParticiple: 'flown' },
  { base: 'forbid', pastSimple: 'forbade', pastParticiple: 'forbidden' },
  { base: 'forget', pastSimple: 'forgot', pastParticiple: 'forgotten' },
  { base: 'forgive', pastSimple: 'forgave', pastParticiple: 'forgiven' },
  { base: 'freeze', pastSimple: 'froze', pastParticiple: 'frozen' },
  { base: 'get', pastSimple: 'got', pastParticiple: 'gotten' },
  { base: 'give', pastSimple: 'gave', pastParticiple: 'given' },
  { base: 'go', pastSimple: 'went', pastParticiple: 'gone' },
  { base: 'grow', pastSimple: 'grew', pastParticiple: 'grown' },
  { base: 'hang', pastSimple: 'hung', pastParticiple: 'hung' },
  { base: 'have', pastSimple: 'had', pastParticiple: 'had' },
  { base: 'hear', pastSimple: 'heard', pastParticiple: 'heard' },
  { base: 'hide', pastSimple: 'hid', pastParticiple: 'hidden' },
  { base: 'hit', pastSimple: 'hit', pastParticiple: 'hit' },
  { base: 'hold', pastSimple: 'held', pastParticiple: 'held' },
  { base: 'hurt', pastSimple: 'hurt', pastParticiple: 'hurt' },
  { base: 'keep', pastSimple: 'kept', pastParticiple: 'kept' },
  { base: 'kneel', pastSimple: 'knelt', pastParticiple: 'knelt' },
  { base: 'know', pastSimple: 'knew', pastParticiple: 'known' },
  { base: 'lay', pastSimple: 'laid', pastParticiple: 'laid' },
  { base: 'lead', pastSimple: 'led', pastParticiple: 'led' },
  { base: 'lean', pastSimple: 'leant', pastParticiple: 'leant' },
  { base: 'leap', pastSimple: 'leapt', pastParticiple: 'leapt' },
  { base: 'learn', pastSimple: 'learnt', pastParticiple: 'learnt' },
  { base: 'leave', pastSimple: 'left', pastParticiple: 'left' },
  { base: 'lend', pastSimple: 'lent', pastParticiple: 'lent' },
  { base: 'let', pastSimple: 'let', pastParticiple: 'let' },
  { base: 'lie', pastSimple: 'lay', pastParticiple: 'lain' },
  { base: 'light', pastSimple: 'lit', pastParticiple: 'lit' },
  { base: 'lose', pastSimple: 'lost', pastParticiple: 'lost' },
  { base: 'make', pastSimple: 'made', pastParticiple: 'made' },
  { base: 'mean', pastSimple: 'meant', pastParticiple: 'meant' },
  { base: 'meet', pastSimple: 'met', pastParticiple: 'met' },
  { base: 'pay', pastSimple: 'paid', pastParticiple: 'paid' },
  { base: 'put', pastSimple: 'put', pastParticiple: 'put' },
  { base: 'quit', pastSimple: 'quit', pastParticiple: 'quit' },
  { base: 'read', pastSimple: 'read', pastParticiple: 'read' },
  { base: 'ride', pastSimple: 'rode', pastParticiple: 'ridden' },
  { base: 'ring', pastSimple: 'rang', pastParticiple: 'rung' },
  { base: 'rise', pastSimple: 'rose', pastParticiple: 'risen' },
  { base: 'run', pastSimple: 'ran', pastParticiple: 'run' },
  { base: 'say', pastSimple: 'said', pastParticiple: 'said' },
  { base: 'see', pastSimple: 'saw', pastParticiple: 'seen' },
  { base: 'seek', pastSimple: 'sought', pastParticiple: 'sought' },
  { base: 'sell', pastSimple: 'sold', pastParticiple: 'sold' },
  { base: 'send', pastSimple: 'sent', pastParticiple: 'sent' },
  { base: 'set', pastSimple: 'set', pastParticiple: 'set' },
  { base: 'sew', pastSimple: 'sewed', pastParticiple: 'sewn' },
  { base: 'shake', pastSimple: 'shook', pastParticiple: 'shaken' },
  { base: 'shine', pastSimple: 'shone', pastParticiple: 'shone' },
  { base: 'shoot', pastSimple: 'shot', pastParticiple: 'shot' },
  { base: 'show', pastSimple: 'showed', pastParticiple: 'shown' },
  { base: 'shrink', pastSimple: 'shrank', pastParticiple: 'shrunk' },
  { base: 'shut', pastSimple: 'shut', pastParticiple: 'shut' },
  { base: 'sing', pastSimple: 'sang', pastParticiple: 'sung' },
  { base: 'sink', pastSimple: 'sank', pastParticiple: 'sunk' },
  { base: 'sit', pastSimple: 'sat', pastParticiple: 'sat' },
  { base: 'sleep', pastSimple: 'slept', pastParticiple: 'slept' },
  { base: 'slide', pastSimple: 'slid', pastParticiple: 'slid' },
  { base: 'speak', pastSimple: 'spoke', pastParticiple: 'spoken' },
  { base: 'speed', pastSimple: 'sped', pastParticiple: 'sped' },
  { base: 'spend', pastSimple: 'spent', pastParticiple: 'spent' },
  { base: 'spin', pastSimple: 'spun', pastParticiple: 'spun' },
  { base: 'spit', pastSimple: 'spat', pastParticiple: 'spat' },
  { base: 'split', pastSimple: 'split', pastParticiple: 'split' },
  { base: 'spread', pastSimple: 'spread', pastParticiple: 'spread' },
  { base: 'spring', pastSimple: 'sprang', pastParticiple: 'sprung' },
  { base: 'stand', pastSimple: 'stood', pastParticiple: 'stood' },
  { base: 'steal', pastSimple: 'stole', pastParticiple: 'stolen' },
  { base: 'stick', pastSimple: 'stuck', pastParticiple: 'stuck' },
  { base: 'sting', pastSimple: 'stung', pastParticiple: 'stung' },
  { base: 'stink', pastSimple: 'stank', pastParticiple: 'stunk' },
  { base: 'strike', pastSimple: 'struck', pastParticiple: 'struck' },
  { base: 'swear', pastSimple: 'swore', pastParticiple: 'sworn' },
  { base: 'sweep', pastSimple: 'swept', pastParticiple: 'swept' },
  { base: 'swim', pastSimple: 'swam', pastParticiple: 'swum' },
  { base: 'swing', pastSimple: 'swung', pastParticiple: 'swung' },
  { base: 'take', pastSimple: 'took', pastParticiple: 'taken' },
  { base: 'teach', pastSimple: 'taught', pastParticiple: 'taught' },
  { base: 'tear', pastSimple: 'tore', pastParticiple: 'torn' },
  { base: 'tell', pastSimple: 'told', pastParticiple: 'told' },
  { base: 'think', pastSimple: 'thought', pastParticiple: 'thought' },
  { base: 'throw', pastSimple: 'threw', pastParticiple: 'thrown' },
  { base: 'understand', pastSimple: 'understood', pastParticiple: 'understood' },
  { base: 'wake', pastSimple: 'woke', pastParticiple: 'woken' },
  { base: 'wear', pastSimple: 'wore', pastParticiple: 'worn' },
  { base: 'weep', pastSimple: 'wept', pastParticiple: 'wept' },
  { base: 'win', pastSimple: 'won', pastParticiple: 'won' },
  { base: 'wind', pastSimple: 'wound', pastParticiple: 'wound' },
  { base: 'withdraw', pastSimple: 'withdrew', pastParticiple: 'withdrawn' },
  { base: 'write', pastSimple: 'wrote', pastParticiple: 'written' },
];

const IRREGULAR_VERBS: IrregularVerbEntry[] = RAW_IRREGULAR_VERBS.map((entry) => ({
  ...entry,
  tier: COMMON_IRREGULAR_VERB_BASES.has(entry.base) ? 'common' : 'extended',
}));

const BY_BASE = new Map<string, IrregularVerbEntry>(
  IRREGULAR_VERBS.map((entry) => [entry.base.toLowerCase(), entry]),
);

export function lookupIrregularVerb(text: string): IrregularVerbEntry | null {
  const key = text.trim().toLowerCase();
  return BY_BASE.get(key) ?? null;
}

/** Extended tier returns the full catalog; common returns everyday verbs only. */
export function listIrregularVerbs(tier?: IrregularVerbTier): readonly IrregularVerbEntry[] {
  if (tier === 'common') {
    return IRREGULAR_VERBS.filter((entry) => entry.tier === 'common');
  }
  return IRREGULAR_VERBS;
}

export function countIrregularVerbs(tier?: IrregularVerbTier): number {
  return listIrregularVerbs(tier).length;
}

function hashToUInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Platform-wide daily pick from the common tier (UTC `YYYY-MM-DD` date key). */
export function pickIrregularVerbOfDay(dateKey?: string): IrregularVerbEntry {
  const key =
    dateKey ??
    (typeof globalThis !== 'undefined'
      ? new Date().toISOString().slice(0, 10)
      : '1970-01-01');
  const pool = listIrregularVerbs('common');
  const catalog = pool.length > 0 ? pool : listIrregularVerbs('extended');
  const index = hashToUInt(`irregular-verb|${key}`) % catalog.length;
  return catalog[index]!;
}

export function formatIrregularVerbRow(entry: IrregularVerbEntry): string {
  return `${entry.base} → ${entry.pastSimple} → ${entry.pastParticiple}`;
}

/** True when the word row has at least one verb sense. */
export function wordHasVerbSense(
  partOfSpeech?: string | null,
  definitions?: Array<{ partOfSpeech?: string }>,
): boolean {
  const isVerb = (pos?: string | null) => {
    const p = pos?.trim().toLowerCase() ?? '';
    return p === 'verb' || p.includes('verb');
  };
  if (isVerb(partOfSpeech)) return true;
  return (definitions ?? []).some((d) => isVerb(d.partOfSpeech));
}

/** Attach irregular verb forms when the lemma is in the list and has a verb sense. */
export function resolveVerbForms(
  text: string,
  partOfSpeech?: string | null,
  definitions?: Array<{ partOfSpeech?: string }>,
): { pastSimple: string; pastParticiple: string } | null {
  if (!wordHasVerbSense(partOfSpeech, definitions)) return null;
  const entry = lookupIrregularVerb(text);
  if (!entry) return null;
  return {
    pastSimple: entry.pastSimple,
    pastParticiple: entry.pastParticiple,
  };
}
