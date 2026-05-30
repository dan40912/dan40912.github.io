(function () {
  const isHome = /\/demo\/(?:index\.html)?$/.test(window.location.pathname) || window.location.pathname.endsWith("/demo/");
  const header = document.querySelector(".site-header, .report-header");
  const hasHomeCta = !!header?.querySelector(".header-cta[href='index.html'], .demo-home-link[href='index.html']");
  if (!header || isHome || hasHomeCta || header.querySelector(".demo-home-link")) return;

  const link = document.createElement("a");
  link.className = "demo-home-link";
  link.href = "index.html";
  link.textContent = "返回作品集";
  header.appendChild(link);
})();
