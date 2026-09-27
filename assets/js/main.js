/**
* Template Name: MyResume - v4.2.0
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Hero type effect
   */
  // const typed = select('.typed')
  // if (typed) {
  //   let typed_strings = typed.getAttribute('data-typed-items')
  //   typed_strings = typed_strings.split(',')
  //   new Typed('.typed', {
  //     strings: typed_strings,
  //     loop: true,
  //     typeSpeed: 100,
  //     backSpeed: 50,
  //     backDelay: 2000
  //   });
  // }

  const typed = select('.typed');
if (typed) {
  let typed_strings = typed.getAttribute('data-typed-items');
  // 用逗號分隔每一組
  typed_strings = typed_strings.split(',').map(item => item.trim());

  new Typed('.typed', {
    strings: typed_strings,
    loop: true,
    typeSpeed: 130,
    backSpeed: 50,
    backDelay: 1500,
    contentType: 'html' // 讓 typed.js 支援 HTML
  });
}
  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function(direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox({
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  });

  /**
   * Project category tabs
   */
  const projectTabs = select('[data-project-filter]', true);
  const projectItems = select('[data-project-category]', true);
  if (projectTabs.length && projectItems.length) {
    const projectGrid = select('.featured-project-grid');
    const applyProjectFilter = (filter) => {
      projectItems.forEach((item) => {
        const category = item.getAttribute('data-project-category');
        const isFeatured = item.getAttribute('data-project-featured') === 'true';
        const shouldShow = filter === 'all' ? isFeatured : category === filter;
        item.classList.toggle('is-hidden', !shouldShow);
      });
      if (projectGrid) {
        projectGrid.classList.toggle('category-mode', filter !== 'all');
      }
      if (typeof AOS !== 'undefined') {
        AOS.refresh();
      }
    };

    projectTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-project-filter');
        projectTabs.forEach((item) => {
          item.classList.remove('active');
          item.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-pressed', 'true');
        applyProjectFilter(filter);
      });
    });

    applyProjectFilter('all');
  }

  /**
   * Portfolio details slider
   */
  if (select('.portfolio-details-slider')) {
    new Swiper('.portfolio-details-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  }

  /**
   * Testimonials slider
   */
  if (select('.testimonials-slider')) {
    new Swiper('.testimonials-slider', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      }
    });
  }

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      // 450ms ease-out: entrances decelerate in, they don't accelerate.
      duration: 450,
      easing: 'ease-out',
      once: true,
      mirror: false,
      disable: () =>
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })
  });

})()

document.addEventListener("DOMContentLoaded", function() {
    const hero = document.getElementById("hero");

    if (!hero || hero.dataset.heroBackground === "static") {
        return;
    }
    
    const focusImage = "./assets/img/background.jpg";
    const images = [
        focusImage,
        "./assets/img/background2.jpg",
        "./assets/img/background3.jpg"
    ];

    let index = 0;

    const updateHeroFocus = (imagePath) => {
        if (imagePath && imagePath.includes("background.jpg")) {
            hero.classList.add("hero-focus-right");
        } else {
            hero.classList.remove("hero-focus-right");
        }
    };

    hero.style.backgroundImage = `url(${images[index]})`;
    updateHeroFocus(images[index]);

    setInterval(() => {
        // 淡出
        hero.classList.remove("fade-in");
        hero.classList.add("fade-out");

        setTimeout(() => {
            // 換圖
            index = (index + 1) % images.length;
            const nextImage = images[index];
            hero.style.backgroundImage = `url(${nextImage})`;
            updateHeroFocus(nextImage);

            // 淡入
            hero.classList.remove("fade-out");
            hero.classList.add("fade-in");
        }, 1500); // 1 秒淡出後換圖
    }, 6000); // 每 6 秒切換一次
});

/**
 * Reveal images as they scroll into view.
 *
 * Deliberately not AOS: this waits for each image to finish decoding before
 * playing, so a lazy-loaded image never animates an empty box, and it staggers
 * images that arrive together so a row resolves left to right.
 */
(function () {
  const images = Array.from(
    document.querySelectorAll('.project-image, .ai-project-icon img')
  );
  if (!images.length) return;

  if (!('IntersectionObserver' in window)) return; // leave images visible

  images.forEach((img) => img.classList.add('reveal-img'));

  const show = (img, delay) => {
    const run = () => {
      img.style.transitionDelay = delay + 'ms';
      img.classList.add('is-revealed');
    };
    if (img.complete && img.naturalWidth) {
      run();
    } else {
      img.addEventListener('load', run, { once: true });
      img.addEventListener(
        'error',
        () => img.classList.add('is-revealed'),
        { once: true }
      );
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const arrived = entries.filter((entry) => entry.isIntersecting);
      if (!arrived.length) return;

      // Same row first, then left to right, so the stagger reads as one sweep.
      arrived.sort((a, b) => {
        const rowA = Math.round(a.boundingClientRect.top / 24);
        const rowB = Math.round(b.boundingClientRect.top / 24);
        return rowA - rowB || a.boundingClientRect.left - b.boundingClientRect.left;
      });

      arrived.forEach((entry, i) => {
        show(entry.target, i * 60);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px 10% 0px', threshold: 0.01 }
  );

  images.forEach((img) => observer.observe(img));
})();
