// Preserve the current section when switching languages.
document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});

const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('main section[id]')];

function updateNavigation() {
  if (!sections.length) return;
  const bottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
  const marker = Math.min(160, window.innerHeight * 0.2);
  // Short final sections cannot reach the top: reaching the page bottom selects the last section.
  let active = sections[0];
  if (bottom) active = sections[sections.length - 1];
  else for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) active = section;
  }
  navLinks.forEach(link => {
    const selected = link.hash === '#' + active.id;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let scheduled = false;
function scheduleNavigationUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    updateNavigation();
  });
}
window.addEventListener('scroll', scheduleNavigationUpdate, {passive: true});
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('hashchange', scheduleNavigationUpdate);
window.addEventListener('load', scheduleNavigationUpdate);
updateNavigation();
