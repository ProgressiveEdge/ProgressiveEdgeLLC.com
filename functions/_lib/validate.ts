// Form rules shared by the Worker (server) and the form scripts (browser), so both sides apply
// exactly the same choices and limits. scripts/check-dist.mjs also checks the built forms against
// them, so this file must stay plain enough for Node to run directly (types only, no enums).

export const CONTACT_SERVICES = [
  'Managed IT Support',
  'AI & Automation',
  'Technology Consulting',
  'Websites & Digital Products',
  'Not sure yet',
] as const;

export const CONTACT_METHODS = ['Email', 'Phone', 'Text'] as const;

export const SUPPORT_CATEGORIES = [
  'Computer / Laptop',
  'Microsoft 365 / Email',
  'Password / Account Access',
  'Printer / Scanner',
  'Network / Wi-Fi',
  'Software / Application',
  'Security Concern',
  'New Employee Setup',
  'Hardware',
  'Other',
] as const;

export const PRIORITIES = ['Critical', 'High', 'Normal', 'Low'] as const;

export const USERS_AFFECTED = ['Just me', 'A few people', 'An entire department', 'Everyone'] as const;

export const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx', 'xls', 'xlsx'] as const;
export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
export const MAX_BODY_BYTES = 25 * 1024 * 1024;

export type Fields = Record<string, string>;
export interface FileMeta {
  name: string;
  size: number;
}

export interface Rule {
  required?: boolean;
  max?: number;
  email?: boolean;
  oneOf?: readonly string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CONTACT_RULES: Record<string, Rule> = {
  name: { required: true, max: 200 },
  email: { required: true, max: 254, email: true },
  company: { max: 200 },
  phone: { max: 50 },
  service: { oneOf: CONTACT_SERVICES },
  message: { required: true, max: 5000 },
};

export const SUPPORT_RULES: Record<string, Rule> = {
  name: { required: true, max: 200 },
  company: { max: 200 },
  email: { required: true, max: 254, email: true },
  phone: { max: 50 },
  preferred_contact_method: { required: true, oneOf: CONTACT_METHODS },
  category: { required: true, oneOf: SUPPORT_CATEGORIES },
  priority: { required: true, oneOf: PRIORITIES },
  subject: { required: true, max: 500 },
  description: { required: true, max: 8000 },
  issue_started: { max: 200 },
  users_affected: { required: true, oneOf: USERS_AFFECTED },
  troubleshooting_attempted: { max: 8000 },
  best_contact_time: { max: 200 },
  remote_support_permission: { oneOf: ['yes'] },
};

export const CONTACT_FIELDS = Object.keys(CONTACT_RULES);
export const SUPPORT_FIELDS = Object.keys(SUPPORT_RULES);

function invalidFields(fields: Fields, rules: Record<string, Rule>): string[] {
  const invalid: string[] = [];
  for (const [name, rule] of Object.entries(rules)) {
    const value = (fields[name] ?? '').trim();
    if (value === '') {
      if (rule.required) invalid.push(name);
      continue;
    }
    const tooLong = rule.max !== undefined && value.length > rule.max;
    const badEmail = rule.email === true && !EMAIL.test(value);
    const badChoice = rule.oneOf !== undefined && !rule.oneOf.includes(value);
    if (tooLong || badEmail || badChoice) invalid.push(name);
  }
  return invalid;
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot < 0 ? '' : filename.slice(dot + 1).toLowerCase();
}

export function validateContact(fields: Fields): string[] {
  return invalidFields(fields, CONTACT_RULES);
}

export function validateSupport(fields: Fields, files: FileMeta[]): string[] {
  const invalid = invalidFields(fields, SUPPORT_RULES);
  const total = files.reduce((sum, f) => sum + f.size, 0);
  const allowed: readonly string[] = ALLOWED_EXTENSIONS;
  const filesOk =
    files.length <= MAX_FILES &&
    total <= MAX_TOTAL_BYTES &&
    files.every((f) => f.size <= MAX_FILE_BYTES && allowed.includes(extensionOf(f.name)));
  if (!filesOk) invalid.push('attachments');
  return invalid;
}

/** The named text fields from a submitted form, trimmed. Missing or file values become ''. */
export function textFields(form: FormData, names: readonly string[]): Fields {
  const fields: Fields = {};
  for (const name of names) {
    const value = form.get(name);
    fields[name] = typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '';
  }
  return fields;
}

/** Files attached under `name`, skipping the empty placeholder a browser sends for an unused file input. */
export function attachedFiles(form: FormData, name = 'attachments'): File[] {
  return form.getAll(name).filter((value): value is File => typeof value !== 'string' && value.size > 0);
}
