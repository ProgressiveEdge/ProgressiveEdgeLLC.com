import { describe, it, expect } from 'vitest';
import {
  contractProblems,
  fileInputProblems,
  findForm,
  formControls,
  siteKeyProblems,
  turnstileSiteKeys,
} from '../scripts/dist-checks.mjs';

const RULES = {
  name: { required: true, max: 200 },
  email: { required: true, max: 254, email: true },
  service: { oneOf: ['AI & Automation', 'Not sure yet'] },
  priority: { required: true, oneOf: ['High', 'Normal'] },
  consent: { oneOf: ['yes'] },
  notes: { max: 5000 },
};

// Markup the way Astro writes it: double-quoted attributes, & escaped, boolean attributes bare.
const GOOD = `
<form class="form-card" data-test-form method="post" action="/api/test" novalidate>
  <input id="name" name="name" type="text" required maxlength="200" autocomplete="name">
  <input id="email" name="email" type="email" required maxlength="254">
  <select id="service" name="service"><option value="AI &amp; Automation">AI &amp; Automation</option><option value="Not sure yet" selected>Not sure yet</option></select>
  <label><input type="radio" name="priority" value="High">High</label>
  <label><input type="radio" name="priority" value="Normal" checked>Normal</label>
  <input type="checkbox" id="consent" name="consent" value="yes">
  <textarea id="notes" name="notes" rows="4" maxlength="5000"></textarea>
  <input type="file" id="attachments" name="attachments" multiple accept=".png,.pdf" hidden data-file-input>
  <input id="website" name="website" type="text" tabindex="-1" autocomplete="off">
  <div class="cf-turnstile turnstile" data-sitekey="0x4AAAAAAF-real-key" data-theme="dark"></div>
  <button class="btn" type="submit">Send</button>
</form>`;

const controlsOf = (html: string) => formControls(findForm(html, 'data-test-form') ?? '');
const EXTRA = ['website', 'attachments'];

describe('findForm', () => {
  it('returns the inside of the form carrying the marker attribute', () => {
    const page = `<form data-other-form><input name="x"></form>${GOOD}`;
    expect(findForm(page, 'data-test-form')).toContain('name="email"');
    expect(findForm(page, 'data-test-form')).not.toContain('name="x"');
  });

  it('is null when no form carries the marker', () => {
    expect(findForm(GOOD, 'data-missing-form')).toBeNull();
  });
});

describe('formControls', () => {
  it('reads each named control with its type, flags, limit and choices', () => {
    const controls = controlsOf(GOOD);
    expect(controls.get('name')).toMatchObject({ type: 'text', required: true, maxlength: 200 });
    expect(controls.get('email')).toMatchObject({ type: 'email', required: true, maxlength: 254 });
    expect(controls.get('notes')).toMatchObject({ type: 'textarea', required: false, maxlength: 5000 });
    expect(controls.get('service')).toMatchObject({ type: 'select', values: ['AI & Automation', 'Not sure yet'] });
    expect(controls.get('priority')).toMatchObject({ type: 'radio', values: ['High', 'Normal'], checked: true });
    expect(controls.get('attachments')).toMatchObject({ type: 'file', accept: '.png,.pdf' });
  });

  it('leaves a select placeholder with an empty value out of the choices', () => {
    const controls = formControls('<select name="pick" required><option value="" selected disabled>Pick one</option><option value="A">A</option></select>');
    expect(controls.get('pick')).toMatchObject({ type: 'select', required: true, values: ['A'] });
  });
});

describe('contractProblems', () => {
  it('finds nothing when the markup matches the rules', () => {
    expect(contractProblems(controlsOf(GOOD), RULES, EXTRA)).toEqual([]);
  });

  it('reports a field the rules expect but the form lacks', () => {
    const html = GOOD.replace('name="email"', 'name="e-mail"');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual([
      'missing field "email"',
      'unknown field "e-mail"',
    ]);
  });

  it('reports a required flag that differs from the rule', () => {
    const html = GOOD.replace('name="name" type="text" required', 'name="name" type="text"');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual(['"name": the form says optional, the rules say required']);
  });

  it('reports a length limit that differs from the rule', () => {
    const html = GOOD.replace('maxlength="5000"', 'maxlength="500"');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual(['"notes": maxlength is 500, the rules say 5000']);
  });

  it('reports an email rule on a field that is not an email input', () => {
    const html = GOOD.replace('name="email" type="email"', 'name="email" type="text"');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual(['"email": the rules expect an email address, the form has a text field']);
  });

  it('reports choices that differ from the rule', () => {
    const html = GOOD.replace('value="High">High', 'value="Urgent">Urgent');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual([
      '"priority": choices are [Urgent, Normal], the rules allow [High, Normal]',
    ]);
  });

  it('reports a required radio group with nothing checked by default', () => {
    const html = GOOD.replace('value="Normal" checked', 'value="Normal"');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual(['"priority": required, but no choice is checked by default']);
  });

  it('reports free text where the rules allow only a list', () => {
    const html = GOOD.replace(/<select[\s\S]*?<\/select>/, '<input name="service" type="text">');
    expect(contractProblems(controlsOf(html), RULES, EXTRA)).toEqual(['"service": the rules allow only listed choices, the form has a text field']);
  });
});

describe('fileInputProblems', () => {
  it('finds nothing when the file input accepts exactly the allowed extensions', () => {
    expect(fileInputProblems(controlsOf(GOOD), 'attachments', ['pdf', 'png'])).toEqual([]);
  });

  it('reports a missing file input', () => {
    expect(fileInputProblems(controlsOf(GOOD), 'uploads', ['png'])).toEqual(['missing file input "uploads"']);
  });

  it('reports an accept list that differs from the allowed extensions', () => {
    expect(fileInputProblems(controlsOf(GOOD), 'attachments', ['png', 'pdf', 'txt'])).toEqual([
      '"attachments": accepts [.png, .pdf], the rules allow [.png, .pdf, .txt]',
    ]);
  });
});

describe('Turnstile site keys', () => {
  it('lists the site key of every widget on a page', () => {
    expect(turnstileSiteKeys(GOOD)).toEqual(['0x4AAAAAAF-real-key']);
    expect(turnstileSiteKeys('<div class="card"></div>')).toEqual([]);
  });

  it('accepts a real site key', () => {
    expect(siteKeyProblems('0x4AAAAAAF-wQ43yQ5oxxgYX')).toEqual([]);
  });

  it.each(['1x00000000000000000000AA', '2x00000000000000000000AB', '1x00000000000000000000BB', '3x00000000000000000000FF'])(
    'rejects the Cloudflare test key %s',
    (key) => {
      expect(siteKeyProblems(key)).toEqual([`Turnstile test site key ${key}`]);
    },
  );

  it('rejects an empty or malformed key', () => {
    expect(siteKeyProblems('')).toEqual(['empty Turnstile site key']);
    expect(siteKeyProblems('YOUR_SITE_KEY')).toEqual(['"YOUR_SITE_KEY" is not a Turnstile site key']);
  });
});
