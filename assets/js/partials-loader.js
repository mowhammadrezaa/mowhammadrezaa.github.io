(function() {
  async function loadPartial(path) {
    const response = await fetch(path);
    return await response.text();
  }

  async function loadMainSections() {
    const main = document.getElementById('main');
    if (!main) return;
    const partialPaths = [
      'partials/intro.html',
      'partials/education.html',
      'partials/work_experience.html',
      'partials/projects.html',
      'partials/skills.html',
      'partials/research_interest.html',
      'partials/contact.html'
    ];
    const htmlParts = await Promise.all(partialPaths.map(loadPartial));
    main.innerHTML = htmlParts.join('\n');
  }

  async function replaceHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    header.outerHTML = await loadPartial('partials/header.html');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await replaceHeader();
    await loadMainSections();
    if (window.reinitializeTheme) {
      window.reinitializeTheme();
    }
  });
})();


