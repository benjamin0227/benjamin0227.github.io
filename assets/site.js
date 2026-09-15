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


const publicationList = document.querySelector('.publication-list');
const publicationControls = document.querySelector('.publication-controls');
if (publicationList && publicationControls) {
  const chronologicalPapers = [...publicationList.querySelectorAll('.paper')];
  const buttons = [...publicationControls.querySelectorAll('button')];
  function setPublicationView(view) {
    const papers = view === 'selected'
      ? [...chronologicalPapers].sort((a, b) => Number(a.dataset.selectedOrder) - Number(b.dataset.selectedOrder))
      : chronologicalPapers;
    for (const paper of papers) {
      paper.hidden = view === 'selected' && paper.dataset.selected !== 'true';
      publicationList.append(paper);
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.publicationView === view)));
    document.querySelector('.publication-empty').hidden = papers.some(paper => !paper.hidden);
    scheduleNavigationUpdate();
  }
  buttons.forEach(button => button.addEventListener('click', () => setPublicationView(button.dataset.publicationView)));
  publicationControls.hidden = false;
  setPublicationView(publicationList.dataset.defaultView);
}
