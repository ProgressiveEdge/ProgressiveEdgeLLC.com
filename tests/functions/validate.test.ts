import { describe, it, expect } from 'vitest';
import {
  validateContact,
  validateSupport,
  textFields,
  attachedFiles,
  extensionOf,
  MAX_FILE_BYTES,
} from '../../functions/_lib/validate';

const contact = (overrides: Record<string, string> = {}) => ({
  name: 'Pat Doe',
  email: 'pat@example.com',
  company: '',
  phone: '',
  service: 'Not sure yet',
  message: 'Hello',
  ...overrides,
});

const support = (overrides: Record<string, string> = {}) => ({
  name: 'Pat Doe',
  company: 'Acme',
  email: 'pat@example.com',
  phone: '',
  preferred_contact_method: 'Email',
  category: 'Hardware',
  priority: 'Normal',
  subject: 'Printer jam',
  description: 'It jams on every page.',
  issue_started: '',
  users_affected: 'Just me',
  troubleshooting_attempted: '',
  best_contact_time: '',
  remote_support_permission: '',
  ...overrides,
});

const file = (name: string, size = 1000) => ({ name, size });

describe('validateContact', () => {
  it('accepts a complete submission', () => {
    expect(validateContact(contact())).toEqual([]);
  });
  it('requires name, email and message', () => {
    expect(validateContact(contact({ name: '', email: '  ', message: '' }))).toEqual(['name', 'email', 'message']);
  });
  it('rejects a malformed email', () => {
    expect(validateContact(contact({ email: 'pat@example' }))).toEqual(['email']);
  });
  it('enforces length limits', () => {
    expect(validateContact(contact({ name: 'a'.repeat(201) }))).toEqual(['name']);
    expect(validateContact(contact({ message: 'a'.repeat(5000) }))).toEqual([]);
    expect(validateContact(contact({ message: 'a'.repeat(5001) }))).toEqual(['message']);
    expect(validateContact(contact({ phone: '1'.repeat(51) }))).toEqual(['phone']);
  });
  it('allows an empty service but not an unknown one', () => {
    expect(validateContact(contact({ service: '' }))).toEqual([]);
    expect(validateContact(contact({ service: 'Plumbing' }))).toEqual(['service']);
  });
});

describe('validateSupport', () => {
  it('accepts a complete submission with no files', () => {
    expect(validateSupport(support(), [])).toEqual([]);
  });
  it('requires the required fields', () => {
    const empty = support({
      name: '', email: '', preferred_contact_method: '', category: '', priority: '',
      subject: '', description: '', users_affected: '',
    });
    expect(validateSupport(empty, [])).toEqual([
      'name', 'email', 'preferred_contact_method', 'category', 'priority', 'subject', 'description', 'users_affected',
    ]);
  });
  it('rejects values outside the fixed choices', () => {
    expect(validateSupport(support({ priority: 'Urgent' }), [])).toEqual(['priority']);
    expect(validateSupport(support({ category: 'Coffee machine' }), [])).toEqual(['category']);
  });
  it('only accepts "yes" for remote support permission', () => {
    expect(validateSupport(support({ remote_support_permission: 'yes' }), [])).toEqual([]);
    expect(validateSupport(support({ remote_support_permission: 'sure' }), [])).toEqual(['remote_support_permission']);
  });
  it('enforces the subject and description limits', () => {
    expect(validateSupport(support({ subject: 'a'.repeat(501) }), [])).toEqual(['subject']);
    expect(validateSupport(support({ description: 'a'.repeat(8001) }), [])).toEqual(['description']);
  });
  it('accepts up to five allowed files', () => {
    const files = ['a.png', 'b.JPG', 'c.pdf', 'd.docx', 'e.xlsx'].map((n) => file(n));
    expect(validateSupport(support(), files)).toEqual([]);
  });
  it('rejects a sixth file', () => {
    const files = ['a.png', 'b.png', 'c.png', 'd.png', 'e.png', 'f.png'].map((n) => file(n));
    expect(validateSupport(support(), files)).toEqual(['attachments']);
  });
  it('rejects a disallowed extension', () => {
    expect(validateSupport(support(), [file('setup.exe')])).toEqual(['attachments']);
    expect(validateSupport(support(), [file('noextension')])).toEqual(['attachments']);
  });
  it('rejects a file over 10 MB', () => {
    expect(validateSupport(support(), [file('big.png', MAX_FILE_BYTES + 1)])).toEqual(['attachments']);
  });
  it('rejects more than 20 MB in total', () => {
    const eightMb = 8 * 1024 * 1024;
    expect(validateSupport(support(), [file('a.png', eightMb), file('b.png', eightMb), file('c.png', eightMb)])).toEqual(['attachments']);
  });
});

describe('form helpers', () => {
  it('reads and trims the named fields, ignoring others', () => {
    const form = new FormData();
    form.append('name', '  Pat  ');
    form.append('extra', 'ignored');
    expect(textFields(form, ['name', 'email'])).toEqual({ name: 'Pat', email: '' });
  });
  it('returns only non-empty attached files', () => {
    const form = new FormData();
    form.append('attachments', new File(['abc'], 'a.png'));
    form.append('attachments', new File([], ''));
    form.append('attachments', 'not a file');
    expect(attachedFiles(form).map((f) => f.name)).toEqual(['a.png']);
  });
  it('finds lowercase extensions', () => {
    expect(extensionOf('Report.PDF')).toBe('pdf');
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('README')).toBe('');
  });
});
