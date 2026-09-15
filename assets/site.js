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


const hobbyTabs = [...document.querySelectorAll('.hobby-tabs [role="tab"]')];
function selectHobby(tab, focus = false) {
  hobbyTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
  scheduleNavigationUpdate();
}
hobbyTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectHobby(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % hobbyTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + hobbyTabs.length) % hobbyTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = hobbyTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectHobby(hobbyTabs[next], true); }
  });
});
document.querySelectorAll('.hobby-panel').forEach(panel => {
  const slides = [...panel.querySelectorAll('.hobby-slide')];
  let index = 0;
  panel.querySelectorAll('[data-step]').forEach(button => {
    button.disabled = slides.length < 2;
    button.addEventListener('click', () => {
      if (slides.length < 2) return;
      slides[index].hidden = true;
      index = (index + Number(button.dataset.step) + slides.length) % slides.length;
      slides[index].hidden = false;
      panel.querySelector('.hobby-count').textContent = `${index + 1} / ${slides.length}`;
    });
  });
});
