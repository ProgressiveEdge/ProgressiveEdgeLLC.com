import {
  ALLOWED_EXTENSIONS,
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  SUPPORT_FIELDS,
  extensionOf,
  textFields,
  validateSupport,
} from '../../functions/_lib/validate';
import { postForm, resetTurnstile, showFieldErrors } from './forms';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const form = document.querySelector<HTMLFormElement>('[data-support-form]');
const banner = document.querySelector<HTMLElement>('[data-form-error]');
const success = document.querySelector<HTMLElement>('[data-form-success]');
const ticketLine = document.querySelector<HTMLElement>('[data-ticket-line]');
const ticketNumber = document.querySelector<HTMLElement>('[data-ticket-number]');
const another = document.querySelector<HTMLButtonElement>('[data-submit-another]');
const drop = document.querySelector<HTMLElement>('[data-file-drop]');
const input = document.querySelector<HTMLInputElement>('[data-file-input]');
const list = document.querySelector<HTMLUListElement>('[data-file-list]');
const skipped = document.querySelector<HTMLElement>('[data-file-skipped]');

if (form && banner && success && ticketLine && ticketNumber && another && drop && input && list && skipped) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const allowed: readonly string[] = ALLOWED_EXTENSIONS;
  let files: File[] = [];
  let sending = false;

  const setSending = (on: boolean) => {
    sending = on;
    if (button) {
      button.disabled = on;
      button.textContent = on ? 'Submitting…' : 'Submit Support Request';
    }
  };

  const render = () => {
    list.replaceChildren(
      ...files.map((file, index) => {
        const item = document.createElement('li');
        item.className = 'file-item';
        const name = document.createElement('span');
        name.className = 'file-item-name';
        name.textContent = file.name;
        const size = document.createElement('span');
        size.className = 'file-item-size';
        size.textContent = formatBytes(file.size);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'file-remove';
        remove.setAttribute('aria-label', `Remove ${file.name}`);
        remove.textContent = '✕';
        remove.addEventListener('click', () => {
          files.splice(index, 1);
          render();
          drop.focus();
        });
        item.append(name, size, remove);
        return item;
      }),
    );
  };

  const addFiles = (incoming: File[]) => {
    const rejected: string[] = [];
    for (const file of incoming) {
      const total = files.reduce((sum, f) => sum + f.size, 0) + file.size;
      const ok =
        files.length < MAX_FILES &&
        allowed.includes(extensionOf(file.name)) &&
        file.size <= MAX_FILE_BYTES &&
        total <= MAX_TOTAL_BYTES;
      if (ok) files.push(file);
      else rejected.push(file.name);
    }
    skipped.hidden = rejected.length === 0;
    skipped.textContent =
      rejected.length === 0 ? '' : `Not added (too large, too many, or an unsupported type): ${rejected.join(', ')}`;
    render();
  };

  input.addEventListener('change', () => {
    addFiles(Array.from(input.files ?? []));
    input.value = '';
  });
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      input.click();
    }
  });
  drop.addEventListener('dragover', (event) => {
    event.preventDefault();
    drop.classList.add('drag-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    drop.classList.remove('drag-over');
    addFiles(Array.from(event.dataTransfer?.files ?? []));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(form);
    data.delete('attachments');
    for (const file of files) data.append('attachments', file);

    const firstInvalid = showFieldErrors(form, validateSupport(textFields(data, SUPPORT_FIELDS), files));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setSending(true);
    banner.hidden = true;
    const result = await postForm('/api/support', data);
    if (result.ok) {
      const number = result.data.ticketNumber;
      ticketNumber.textContent = typeof number === 'string' ? number : '';
      ticketLine.hidden = typeof number !== 'string';
      form.hidden = true;
      success.hidden = false;
      success.focus();
      setSending(false);
      return;
    }

    banner.hidden = false;
    const fields = result.data.fields;
    const firstServerInvalid = result.data.error === 'validation' && Array.isArray(fields) ? showFieldErrors(form, fields as string[]) : null;
    if (firstServerInvalid) firstServerInvalid.focus();
    else banner.focus();
    resetTurnstile(form);
    setSending(false);
  });

  another.addEventListener('click', () => {
    form.reset();
    files = [];
    render();
    skipped.hidden = true;
    showFieldErrors(form, []);
    resetTurnstile(form);
    success.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLInputElement>('#name')?.focus();
  });
}
