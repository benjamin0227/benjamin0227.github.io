// Preserve the current section when switching languages.
document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', () => { link.hash = location.hash; });
});
if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('.nav a')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin: '-5% 0px -65% 0px'});
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
