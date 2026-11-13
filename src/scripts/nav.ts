// Mobile menu (below 768px). Escape or a link click closes it; Escape returns focus to the button.
// Without this script the links stay visible and simply wrap.
const header = document.querySelector<HTMLElement>('[data-nav]');
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const panel = document.querySelector<HTMLElement>('[data-nav-panel]');

if (header && toggle && panel) {
  header.dataset.enhanced = '';

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  panel.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });
  window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
