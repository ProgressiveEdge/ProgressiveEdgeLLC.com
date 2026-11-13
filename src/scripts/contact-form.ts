import { CONTACT_FIELDS, textFields, validateContact } from '../../functions/_lib/validate';
import { postForm, resetTurnstile, showFieldErrors } from './forms';

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
const banner = document.querySelector<HTMLElement>('[data-form-error]');
const success = document.querySelector<HTMLElement>('[data-form-success]');

if (form && banner && success) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  let sending = false;

  const setSending = (on: boolean) => {
    sending = on;
    if (button) {
      button.disabled = on;
      button.textContent = on ? 'Sending…' : 'Send Message';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(form);
    const firstInvalid = showFieldErrors(form, validateContact(textFields(data, CONTACT_FIELDS)));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setSending(true);
    banner.hidden = true;
    const result = await postForm('/api/contact', data);
    if (result.ok) {
      form.hidden = true;
      success.hidden = false;
      success.focus();
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
}
