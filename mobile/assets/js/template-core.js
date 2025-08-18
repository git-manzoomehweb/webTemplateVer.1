document.addEventListener("DOMContentLoaded", function () {
  const headerMenu = document.querySelector(".header-menu");
  const headerMenuClose = document.querySelector(".header-menu-close");
  const bars3 = document.querySelector(".bars3");

  if (!headerMenu || !headerMenuClose || !bars3) return;

  const isDesktop = () => window.innerWidth >= 1024;

  const openMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = "visible";
      headerMenu.style.opacity = "1";
    } else {
      headerMenu.style.transform = "translateX(0)";
    }
    document.body.classList.add("overflow-hidden");
  };

  const closeMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = "hidden";
      headerMenu.style.opacity = "0";
    } else {
      headerMenu.style.transform = "translateX(1024px)";
    }
    document.body.classList.remove("overflow-hidden");
  };

  bars3.addEventListener("click", openMenu);
  headerMenuClose.addEventListener("click", closeMenu);

  // Dropdown
  const toggleDropdowns = document.querySelectorAll(".toggle-dropdown");

  toggleDropdowns.forEach((toggle) => {
    const submenu = toggle.nextElementSibling;
    const dropdownIcon = toggle.querySelector(".dropdown-icon");

    if (!submenu) return;

    toggle.addEventListener("click", function () {
      const isOpen = submenu.style.maxHeight;

      if (isOpen) {
        submenu.style.maxHeight = null;
        submenu.style.opacity = "0";
      } else {
        submenu.style.maxHeight = submenu.scrollHeight + "px";
        submenu.style.opacity = "1";
      }

      if (dropdownIcon) dropdownIcon.classList.toggle("rotate-180");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (!main) return;

  const currentPage = main.dataset.page;

  document.querySelectorAll("nav a").forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.remove("text-zinc-900");
      link.classList.add("text-primary-600");

      const icon = link.closest("li")?.querySelector("use");
      if (icon) {
        const href = icon.getAttribute("href");
        if (href.includes("-zinc")) {
          icon.setAttribute("href", href.replace("-zinc", "-primary"));
        }
      }
    }
  });
});

// form header

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".search-form");
  if (!form) return;

  const input = form.querySelector(".search-input");
  const button = form.querySelector(".search-toggle");
  const phoneSpan = document.querySelector(".phone-number-header");
  const nav = document.querySelector(".header-nav");
  if (!input || !button || !phoneSpan || !nav) return;

  let expanded = false;

  function openForm() {
    form.classList.add("w-48");
    form.classList.remove("w-12");

    input.classList.add("w-full", "pr-3");
    input.classList.remove("w-0", "pr-0");

    expanded = true;
    input.focus();

    setTimeout(() => {
      if (nav.scrollWidth > 700) {
        phoneSpan.style.display = "none";
      }
    }, 10);
  }

  function closeForm() {
    form.classList.remove("w-48");
    form.classList.add("w-12");

    input.classList.remove("w-full", "pr-3");
    input.classList.add("w-0", "pr-0");

    expanded = false;

    form.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "width") {
        phoneSpan.style.display = "inline";
        form.removeEventListener("transitionend", handler);
      }
    });
  }

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!expanded) {
      openForm();
    } else if (!input.value.trim()) {
      input.focus();
    } else {
      form.submit();
    }
  });

  document.addEventListener("click", (e) => {
    if (expanded && !form.contains(e.target)) {
      closeForm();
    }
  });

  form.addEventListener("submit", (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      input.focus();
    }
  });
});

document.querySelectorAll(".highlight-rest").forEach(el => {
  let words = el.textContent.trim().split(" ");
  if (words.length > 1) {
    let first = words[0];  
    let rest = words.slice(1).join(" ");  
    el.innerHTML = `${first} <span class="text-primary-600 font-bold">${rest}</span>`;
  }
});


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.tabs').forEach(tabsWrapper => {
    const tabsContainer = tabsWrapper.querySelector('.tabs-container');
    const tabs = tabsContainer.querySelectorAll('button[data-index]');
    const line = tabsWrapper.querySelector('.active-line');

    function setActiveTab(index) {
      if (!tabs[index]) return;

      tabs.forEach((tab, i) => {
        tab.classList.toggle('text-primary-600', i === index);
        tab.classList.toggle('font-bold', i === index);
        tab.classList.toggle('text-gray-500', i !== index);
      });

      const tab = tabs[index];
      const tabRect = tab.getBoundingClientRect();
      const containerRect = tabsContainer.getBoundingClientRect();

      const tabLeft = tabRect.left - containerRect.left;
      const width = tab.offsetWidth;

      line.style.width = width + 'px';
      line.style.left = tabLeft + 'px';
    }

    setActiveTab(0);

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => setActiveTab(i));
    });

    tabsContainer.addEventListener('scroll', () => {
      const activeIndex = [...tabs].findIndex(tab =>
        tab.classList.contains('text-primary-600')
      );
      if (activeIndex >= 0) setActiveTab(activeIndex);
    });

    window.addEventListener('resize', () => {
      const activeIndex = [...tabs].findIndex(tab =>
        tab.classList.contains('text-primary-600')
      );
      setActiveTab(activeIndex >= 0 ? activeIndex : 0);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const faqs = document.querySelectorAll(".faq-border");

  faqs.forEach(faq => {
    const question = faq.querySelector(".faq-question");
    const content  = faq.querySelector(".faq-answer");
    const wrapper  = faq.querySelector(".faq-content");

    question.addEventListener("click", e => {
      e.stopPropagation(); 

      const isOpen = faq.classList.contains("active");

      faqs.forEach(f => {
        f.classList.remove("active");
        f.querySelector(".faq-answer").style.maxHeight = "0";
        f.querySelector(".faq-answer").style.transition = "all 0.3s ease";
        f.querySelector(".faq-content").style.backgroundColor = "rgb(244,244,245)";
        f.querySelector(".faq-question").classList.remove("mb-3"); 
      });

      if (!isOpen) {
        faq.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px"; 
        content.style.transition = "all 0.3s ease";
        wrapper.style.backgroundColor = "var(--primary-50)";
        question.classList.add("mb-3");
      }
    });
  });


  document.addEventListener("click", () => {
    faqs.forEach(f => {
      f.classList.remove("active");
      f.querySelector(".faq-answer").style.maxHeight = "0";
      f.querySelector(".faq-content").style.backgroundColor = "rgb(244,244,245)";
      f.querySelector(".faq-question").classList.remove("mb-3"); 
    });
  });
});