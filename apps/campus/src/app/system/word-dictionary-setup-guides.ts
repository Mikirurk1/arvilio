import type { TranslationProviderId, WordDictionaryProviderId } from '@pkg/types';

export type SetupGuideLink = {
  label: string;
  href: string;
};

export type ProviderSetupGuide = {
  summary: string;
  pricing: string;
  envVars?: Array<{ name: string; note: string }>;
  steps: Array<{ text: string; links?: SetupGuideLink[] }>;
};

export const DICTIONARY_SETUP_GUIDES: Record<WordDictionaryProviderId, ProviderSetupGuide> = {
  dictionary_api_dev: {
    summary: 'Public JSON dictionary API — no account or API key.',
    pricing: 'Free (donations welcome at high volume).',
    envVars: [{ name: 'DICTIONARY_API_URL', note: 'Default endpoint is fine for English.' }],
    steps: [
      {
        text: 'No signup. SoEnglish sends GET requests to the dictionary endpoint.',
        links: [
          { label: 'Free Dictionary API', href: 'https://dictionaryapi.dev/' },
          { label: 'API docs (GitHub)', href: 'https://github.com/meetDeveloper/freeDictionaryAPI' },
        ],
      },
      {
        text: 'Example: GET …/api/v2/entries/en/{word}',
        links: [
          {
            label: 'Try hello',
            href: 'https://api.dictionaryapi.dev/api/v2/entries/en/hello',
          },
        ],
      },
    ],
  },
  wiktionary: {
    summary: 'Official Wikimedia REST API for English definitions.',
    pricing: 'Free — set a descriptive User-Agent.',
    envVars: [
      { name: 'WIKTIONARY_API_URL', note: 'English definition endpoint.' },
      { name: 'WIKTIONARY_USER_AGENT', note: 'Required by Wikimedia bot policy.' },
    ],
    steps: [
      {
        text: 'No API key. On miss, SoEnglish falls back to Free Dictionary API.',
        links: [
          { label: 'MediaWiki REST API', href: 'https://www.mediawiki.org/wiki/API:REST_API' },
          {
            label: 'Definition endpoint',
            href: 'https://en.wiktionary.org/api/rest_v1/#/Page%20content/get_page_definition__term_',
          },
        ],
      },
      {
        text: 'Example: GET …/page/definition/{term}',
        links: [
          {
            label: 'Try hello',
            href: 'https://en.wiktionary.org/api/rest_v1/page/definition/hello',
          },
        ],
      },
    ],
  },
  reverso: {
    summary:
      'Dictionary mode combines Free Dictionary API with Reverso context when Translation source is Reverso.',
    pricing: 'No public self-service API key for Context — corporate API via sales.',
    steps: [
      {
        text: 'Set Translation source to Reverso. Optional REVERSO_API_KEY for corporate access.',
        links: [
          { label: 'Reverso Corporate & API', href: 'https://documents.reverso.net/Pricing.aspx?lang=en' },
        ],
      },
      {
        text: 'Endpoint used by SoEnglish (same as Reverso mobile/web).',
        links: [
          { label: 'Reverso Context', href: 'https://www.reverso.net/text-translation' },
        ],
      },
    ],
  },
};

export const TRANSLATION_SETUP_GUIDES: Record<TranslationProviderId, ProviderSetupGuide> = {
  deepl: {
    summary: 'Official DeepL REST API — separate from DeepL Pro web/app subscription.',
    pricing: 'API account required. Free tier: 500,000 characters/month (DeepL API Free).',
    envVars: [
      { name: 'DEEPL_AUTH_KEY', note: 'From Account → API Keys. Free keys end with :fx.' },
      { name: 'DEEPL_API_URL', note: 'Use https://api-free.deepl.com for free keys.' },
    ],
    steps: [
      {
        text: 'Create a DeepL API account (not regular DeepL Pro).',
        links: [
          { label: 'DeepL API signup', href: 'https://www.deepl.com/pro-api' },
          { label: 'API plans', href: 'https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans' },
        ],
      },
      {
        text: 'Copy API key → System → Word dictionary → DeepL, or DEEPL_AUTH_KEY in server env.',
        links: [
          { label: 'Authentication docs', href: 'https://developers.deepl.com/docs/getting-started/auth' },
          { label: 'Translate endpoint', href: 'https://developers.deepl.com/api-reference/translate' },
        ],
      },
    ],
  },
  google: {
    summary: 'Google Cloud Translation API v2 (Basic).',
    pricing: 'GCP billing required. Free tier: 500,000 characters/month.',
    envVars: [
      { name: 'GOOGLE_TRANSLATE_API_KEY', note: 'Restrict to Cloud Translation API.' },
      { name: 'GOOGLE_TRANSLATE_API_URL', note: 'Default https://translation.googleapis.com' },
    ],
    steps: [
      {
        text: 'Create a GCP project, enable billing, enable Cloud Translation API.',
        links: [
          { label: 'Setup guide', href: 'https://docs.cloud.google.com/translate/docs/setup' },
          { label: 'Pricing', href: 'https://cloud.google.com/translate/pricing' },
        ],
      },
      {
        text: 'APIs & Services → Credentials → Create API key → save in System UI or env.',
        links: [{ label: 'Cloud Console', href: 'https://console.cloud.google.com/' }],
      },
    ],
  },
  microsoft: {
    summary: 'Azure AI Translator (Text Translation).',
    pricing: 'Azure account. F0 free tier: 2,000,000 characters/month.',
    envVars: [
      { name: 'AZURE_TRANSLATOR_KEY', note: 'Key 1 from Keys and Endpoint.' },
      { name: 'AZURE_TRANSLATOR_REGION', note: 'e.g. eastus — required for regional resources.' },
      { name: 'AZURE_TRANSLATOR_URL', note: 'Default global endpoint.' },
    ],
    steps: [
      {
        text: 'Sign up at azure.microsoft.com/free (use your own tenant — not Azure Marketplace).',
        links: [
          { label: 'Azure free account', href: 'https://azure.microsoft.com/free/' },
          { label: 'Translator pricing (F0)', href: 'https://azure.microsoft.com/pricing/details/translator/' },
        ],
      },
      {
        text: 'Create a Translator resource with pricing tier F0.',
        links: [
          {
            label: 'Create Translator',
            href: 'https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation',
          },
          {
            label: 'REST quickstart',
            href: 'https://learn.microsoft.com/en-us/azure/ai-services/translator/text-translation/quickstart/rest-api',
          },
        ],
      },
    ],
  },
  reverso: {
    summary: 'Uses api.reverso.net — not an open developer portal.',
    pricing: 'Free ad-hoc use possible; corporate API via Reverso sales.',
    envVars: [
      { name: 'REVERSO_API_URL', note: 'Default https://api.reverso.net/translate/v1/translation' },
      { name: 'REVERSO_API_KEY', note: 'Optional Bearer token (corporate).' },
      { name: 'REVERSO_CONTEXT_TARGET_LANG', note: 'Native gloss language, e.g. uk.' },
    ],
    steps: [
      {
        text: 'No public API key signup. SoEnglish calls the same endpoint as Reverso apps.',
        links: [
          { label: 'Corporate & API pricing', href: 'https://documents.reverso.net/Pricing.aspx?lang=en' },
        ],
      },
      {
        text: 'If blocked by Cloudflare from your server IP, use a corporate key or another provider.',
      },
    ],
  },
  mymemory: {
    summary: 'Public translation memory API — no signup for basic use.',
    pricing: 'Free: 5,000 chars/day (anonymous) or 50,000/day with contact email.',
    envVars: [
      { name: 'TRANSLATION_API_URL', note: 'Default MyMemory GET endpoint.' },
      { name: 'TRANSLATION_API_EMAIL', note: 'Raises daily quota (de= parameter).' },
    ],
    steps: [
      {
        text: 'Optional: set MyMemory email below or TRANSLATION_API_EMAIL in server env.',
        links: [
          { label: 'API specification', href: 'https://mymemory.translated.net/doc/spec.php' },
          { label: 'Usage limits', href: 'https://mymemory.translated.net/doc/usagelimits.php' },
        ],
      },
      {
        text: 'Example: GET …/get?q=Hello&langpair=en|uk&de=you@example.com',
      },
    ],
  },
  libretranslate: {
    summary: 'Open-source Argos Translate server — self-host locally or use paid libretranslate.com.',
    pricing: 'Self-hosted: free. Managed libretranslate.com requires a paid API key.',
    envVars: [
      { name: 'LIBRETRANSLATE_URL', note: 'Base URL, e.g. http://127.0.0.1:5001 (port 5001 — macOS uses 5000 for AirPlay).' },
      { name: 'LIBRETRANSLATE_API_KEY', note: 'Only if your instance requires API keys.' },
    ],
    steps: [
      {
        text: 'Recommended for dev: start the bundled Docker service, then set LIBRETRANSLATE_URL.',
        links: [
          { label: 'LibreTranslate docs', href: 'https://docs.libretranslate.com/' },
          { label: 'Self-host install', href: 'https://docs.libretranslate.com/guides/installation/' },
        ],
      },
      {
        text: 'From repo root: npm run docker:libretranslate — first start downloads en/uk models (~few min).',
      },
      {
        text: 'Add to .env: LIBRETRANSLATE_URL=http://127.0.0.1:5001 — restart API (npm run dev:api). Port 5001 avoids macOS AirPlay on 5000.',
      },
      {
        text: 'Test: POST {url}/translate with q, source=en, target=uk.',
        links: [{ label: 'API reference', href: 'https://docs.libretranslate.com/api/' }],
      },
      {
        text: 'Managed cloud (paid): get key at portal.libretranslate.com — not required for self-host.',
        links: [{ label: 'LibreTranslate portal', href: 'https://portal.libretranslate.com/' }],
      },
    ],
  },
  gtx: {
    summary: 'Unofficial Google Translate fallback — no configuration.',
    pricing: 'No API key; not a documented Google API — use for dev fallback only.',
    steps: [
      {
        text: 'Runs automatically when earlier providers in the chain fail. No env vars.',
      },
      {
        text: 'For production, prefer DeepL, Google Cloud, Azure, MyMemory, or self-hosted LibreTranslate.',
        links: [
          { label: 'Google Cloud Translation (official)', href: 'https://cloud.google.com/translate' },
        ],
      },
    ],
  },
};

export const SUPPLEMENTAL_DATAMUSE_GUIDE: ProviderSetupGuide = {
  summary: 'Always queried alongside the dictionary — synonyms, antonyms, phrase gloss fallback.',
  pricing: 'Free — no API key (up to 100,000 requests/day).',
  steps: [
    {
      text: 'No configuration in System UI.',
      links: [{ label: 'Datamuse API', href: 'https://www.datamuse.com/api/' }],
    },
  ],
};
