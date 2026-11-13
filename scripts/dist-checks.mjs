// Checks on the built pages that need more than a text search: the forms against the rules the
// Worker enforces (functions/_lib/validate.ts), and the Turnstile site keys. scripts/check-dist.mjs
// runs them on every build; tests/dist-checks.test.ts covers them.
//
// They read the HTML Astro writes (double-quoted attributes, no ">" inside an attribute value),
// not arbitrary HTML.

/** @typedef {{ required?: boolean, max?: number, email?: boolean, oneOf?: readonly string[] }} Rule */
/** @typedef {{ type: string, required: boolean, checked: boolean, maxlength?: number, accept?: string, values: string[] }} Control */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

/** @param {string} text */
function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, ref) => {
    if (ref[0] === '#') {
      return String.fromCodePoint(ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : Number(ref.slice(1)));
    }
    return ENTITIES[ref.toLowerCase()] ?? match;
  });
}

const ATTRIBUTE = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** A tag's attributes, lower-case name → decoded value ('' for a bare attribute such as required). */
function attributes(/** @type {string} */ source) {
  /** @type {Map<string, string>} */
  const found = new Map();
  for (const [, name, double, single, bare] of source.matchAll(ATTRIBUTE)) {
    found.set(name.toLowerCase(), decode(double ?? single ?? bare ?? ''));
  }
  return found;
}

/**
 * The HTML inside the first <form> that carries the `marker` attribute, or null.
 * @param {string} html
 * @param {string} marker
 * @returns {string | null}
 */
export function findForm(html, marker) {
  for (const [, attrs, inner] of html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    if (attributes(attrs).has(marker)) return inner;
  }
  return null;
}

/** The values a <select> offers, leaving out a placeholder whose value is empty. */
function optionValues(/** @type {string} */ html) {
  const values = [];
  for (const [, attrs, text] of html.matchAll(/<option\b([^>]*)>([^<]*)/gi)) {
    const option = attributes(attrs);
    const value = option.get('value') ?? decode(text).trim();
    if (value !== '') values.push(value);
  }
  return values;
}

const CONTROL = /<(input|textarea)\b([^>]*)>|<select\b([^>]*)>([\s\S]*?)<\/select>/gi;

/**
 * The named controls in a form. Radio buttons and checkboxes that share a name are one control
 * whose `values` lists each button's value.
 * @param {string} formHtml
 * @returns {Map<string, Control>}
 */
export function formControls(formHtml) {
  /** @type {Map<string, Control>} */
  const controls = new Map();
  for (const [, tag, tagAttrs, selectAttrs, options] of formHtml.matchAll(CONTROL)) {
    const attrs = attributes(tag ? tagAttrs : selectAttrs);
    const name = attrs.get('name');
    if (!name) continue;
    const type = !tag
      ? 'select'
      : tag.toLowerCase() === 'textarea'
        ? 'textarea'
        : (attrs.get('type') || 'text').toLowerCase();
    const control = controls.get(name) ?? { type, required: false, checked: false, values: [] };
    control.required ||= attrs.has('required');
    control.checked ||= attrs.has('checked');
    if (attrs.has('maxlength')) control.maxlength = Number(attrs.get('maxlength'));
    if (attrs.has('accept')) control.accept = attrs.get('accept');
    if (type === 'radio' || type === 'checkbox') control.values.push(attrs.get('value') ?? 'on');
    if (type === 'select') control.values.push(...optionValues(options));
    controls.set(name, control);
  }
  return controls;
}

/** @param {readonly string[]} a @param {readonly string[]} b */
const sameChoices = (a, b) => a.length === b.length && a.every((v) => b.includes(v)) && b.every((v) => a.includes(v));

/** @param {readonly string[]} values */
const list = (values) => `[${values.join(', ')}]`;

/** @param {string} type */
const kind = (type) => (type === 'textarea' ? 'a text area' : `a ${type} field`);

/**
 * Where a form's controls disagree with the rules, as readable sentences ([] when they agree).
 * `extra` names controls the form may have that no rule covers, such as the honeypot.
 * @param {Map<string, Control>} controls
 * @param {Record<string, Rule>} rules
 * @param {readonly string[]} extra
 * @returns {string[]}
 */
export function contractProblems(controls, rules, extra = []) {
  const problems = [];
  for (const [name, rule] of Object.entries(rules)) {
    const control = controls.get(name);
    if (!control) {
      problems.push(`missing field "${name}"`);
      continue;
    }
    const label = `"${name}":`;

    if (control.type === 'select' || control.type === 'radio' || control.type === 'checkbox') {
      if (!rule.oneOf) problems.push(`${label} the form offers choices, the rules accept any text`);
      else if (!sameChoices(control.values, rule.oneOf)) {
        problems.push(`${label} choices are ${list(control.values)}, the rules allow ${list(rule.oneOf)}`);
      }
    } else {
      if (rule.oneOf) problems.push(`${label} the rules allow only listed choices, the form has ${kind(control.type)}`);
      if (control.maxlength !== rule.max) {
        problems.push(`${label} maxlength is ${control.maxlength ?? 'missing'}, the rules say ${rule.max ?? 'none'}`);
      }
      if (rule.email && control.type !== 'email') {
        problems.push(`${label} the rules expect an email address, the form has ${kind(control.type)}`);
      }
      if (!rule.email && control.type === 'email') {
        problems.push(`${label} the form has an email field, the rules do not check for an email address`);
      }
    }

    // A radio group can't be required in HTML, but a default choice means one is always sent.
    if (control.type === 'radio') {
      if (rule.required && !control.checked) problems.push(`${label} required, but no choice is checked by default`);
    } else if (control.required !== Boolean(rule.required)) {
      const say = (/** @type {boolean} */ required) => (required ? 'required' : 'optional');
      problems.push(`${label} the form says ${say(control.required)}, the rules say ${say(Boolean(rule.required))}`);
    }
  }
  for (const name of controls.keys()) {
    if (!(name in rules) && !extra.includes(name)) problems.push(`unknown field "${name}"`);
  }
  return problems;
}

/**
 * Whether the form's file input accepts exactly the allowed extensions.
 * @param {Map<string, Control>} controls
 * @param {string} name
 * @param {readonly string[]} extensions without the dot, e.g. ['png', 'pdf']
 * @returns {string[]}
 */
export function fileInputProblems(controls, name, extensions) {
  const control = controls.get(name);
  if (!control || control.type !== 'file') return [`missing file input "${name}"`];
  const accepted = (control.accept ?? '')
    .split(',')
    .map((ext) => ext.trim().toLowerCase())
    .filter(Boolean);
  const allowed = extensions.map((ext) => `.${ext}`);
  return sameChoices(accepted, allowed) ? [] : [`"${name}": accepts ${list(accepted)}, the rules allow ${list(allowed)}`];
}

/**
 * The data-sitekey of every Turnstile widget (class "cf-turnstile") on a page, '' when missing.
 * @param {string} html
 * @returns {string[]}
 */
export function turnstileSiteKeys(html) {
  const keys = [];
  for (const [, attrs] of html.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/gi)) {
    const tag = attributes(attrs);
    if ((tag.get('class') ?? '').split(/\s+/).includes('cf-turnstile')) keys.push(tag.get('data-sitekey') ?? '');
  }
  return keys;
}

// Cloudflare's published dummy site keys (they pass or fail every visitor) and the shape of a real one.
const TEST_SITE_KEY = /^[123]x0{20}[A-F]{2}$/;
const SITE_KEY = /^0x[A-Za-z0-9_-]+$/;

/**
 * Why a Turnstile site key can't go live ([] when it can). A test key never verifies against the
 * real secret, so it would break both forms.
 * @param {string} key
 * @returns {string[]}
 */
export function siteKeyProblems(key) {
  if (key === '') return ['empty Turnstile site key'];
  if (TEST_SITE_KEY.test(key)) return [`Turnstile test site key ${key}`];
  if (!SITE_KEY.test(key)) return [`"${key}" is not a Turnstile site key`];
  return [];
}
