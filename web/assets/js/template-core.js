document.addEventListener("DOMContentLoaded", function () {
  const isDesktop = window.innerWidth > 1024;
  const requiredFiles = isDesktop
    ? ["template.ui.min.css"]
    : ["template-mob.ui.min.css"];

  function checkAllResourcesLoaded() {
    const resources = performance.getEntriesByType("resource");
    const loadedFiles = resources
      .map((res) => res.name.split("/").pop())
      .filter((name) => requiredFiles.includes(name));

    return requiredFiles.every((file) => loadedFiles.includes(file));
  }

  if (document.getElementById("search-box")) {
    function fetchEngine() {
      try {
        const xhrobj = new XMLHttpRequest();
        xhrobj.open("GET", "search-engine.bc");
        xhrobj.send();

        xhrobj.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            const container = document.getElementById("search-box");

            const tpl = document.createElement("template");
            tpl.innerHTML = xhrobj.responseText;

            tpl.content.querySelectorAll("use").forEach((u) => {
              ["href", "xlink:href"].forEach((attr) => {
                const val = u.getAttribute(attr);
                if (!val) return;

                if (val.includes("images/sprite-icons.svg")) {
                  u.setAttribute(
                    attr,
                    val.replace(
                      "images/sprite-icons.svg",
                      "PrimeTemplate_A/images/sprite-icons.svg"
                    )
                  );
                }
              });
            });

            container.innerHTML = "";
            container.appendChild(tpl.content);

            [".Basis_Date.end_date", ".Basis_Date.start_date"].forEach(
              (selector) => {
                const dateInputs = document.querySelectorAll(selector);
                dateInputs.forEach((input) => {
                  input.placeholder = "";
                });
              }
            );

            let r = document.querySelector(".flighttype-field");
            r.classList.add("flighttype-dropDown");
            const scripts = container.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
              const scriptTag = document.createElement("script");
              if (scripts[i].src) {
                scriptTag.src = scripts[i].src;
                scriptTag.async = false;
              } else {
                scriptTag.text = scripts[i].textContent;
              }
              document.head
                .appendChild(scriptTag)
                .parentNode.removeChild(scriptTag);
            }
          }
        };
      } catch (error) {
        console.error("مشکلی پیش آمده است. لطفا صبور باشید", error);
      }
    }

    function waitForFiles() {
      if (checkAllResourcesLoaded()) {
        fetchEngine();
      } else {
        setTimeout(waitForFiles, 500);
      }
    }
    waitForFiles();
  }
});

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

// ---------active header items------------
document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  if (!main) return;

  const currentPage = main.dataset.activepage;

  document
    .querySelectorAll(
      "header nav a, header .toggle-dropdown a, header nav li a"
    )
    .forEach((link) => {
      if (link.dataset.activepage === currentPage) {
        link.classList.remove("text-zinc-900");
        link.classList.add("text-primary-600");

        if (window.innerWidth >= 1024) {
          link.classList.add(
            "border-b-2",
            "border-solid",
            "border-primary-600",
            "pb-3"
          );
        }

        const icon = link.closest("li, .toggle-dropdown")?.querySelector("use");
        if (icon) {
          const href = icon.getAttribute("href");
          if (href.includes("-zinc")) {
            icon.setAttribute("href", href.replace("-zinc", "-primary"));
          }
        }
      }
    });
});

// -----------form header--------------
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".search-form");
  if (!form) return;

  const input = form.querySelector(".search-input");
  const button = form.querySelector(".search-toggle");
  const phoneSpan = document.querySelector(".phone-number-header");
  const phoneSvg = document.querySelector(".phone-svg-header");
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
      const screenWidth = window.innerWidth;

      if (screenWidth >= 1024 && screenWidth < 1280 && nav.scrollWidth > 400) {
        phoneSpan.style.display = "none";
        if (phoneSvg) phoneSvg.style.display = "none";
      } else if (screenWidth >= 1280 && nav.scrollWidth > 700) {
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
        if (phoneSvg) phoneSvg.style.display = "inline";
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

document.querySelectorAll(".highlight-rest").forEach((el) => {
  let words = el.textContent.trim().split(" ");
  if (words.length > 1) {
    let first = words[0];
    let rest = words.slice(1).join(" ");
    el.innerHTML = `${first} <span class="text-primary-600 font-bold">${rest}</span>`;
  }
});

// ---------scrollTopBtn----------
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".scrollTopBtn")) {
    const scrollTopBtn = document.querySelector(".scrollTopBtn");

    function checkScreenSize() {
      if (window.innerWidth > 1024) {
        scrollTopBtn.style.display = "none";
      } else {
        updateButtonVisibility();
      }
    }

    function updateButtonVisibility() {
      if (
        window.innerWidth <= 1024 &&
        (document.body.scrollTop > 100 ||
          document.documentElement.scrollTop > 100)
      ) {
        scrollTopBtn.style.display = "flex";
      } else {
        scrollTopBtn.style.display = "none";
      }
    }

    window.addEventListener("scroll", updateButtonVisibility);
    window.addEventListener("resize", checkScreenSize);
    scrollTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

    checkScreenSize();
  }
});

// ---------active line-------------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tabs").forEach((tabsWrapper) => {
    const tabsContainer = tabsWrapper.querySelector(".tabs-container");
    const tabs = tabsContainer.querySelectorAll("button[data-index]");
    const line = tabsWrapper.querySelector(".active-line");

    function setActiveTab(index) {
      if (!tabs[index]) return;

      tabs.forEach((tab, i) => {
        tab.classList.toggle("text-primary-600", i === index);
        tab.classList.toggle("font-bold", i === index);
        tab.classList.toggle("text-zinc-900", i !== index);
      });

      const tab = tabs[index];
      const tabRect = tab.getBoundingClientRect();
      const containerRect = tabsContainer.getBoundingClientRect();

      const tabLeft = tabRect.left - containerRect.left;
      const width = tab.offsetWidth;

      line.style.width = width + "px";
      line.style.left = tabLeft + "px";
    }

    setActiveTab(0);

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => setActiveTab(i));
    });

    tabsContainer.addEventListener("scroll", () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains("text-primary-600")
      );
      if (activeIndex >= 0) setActiveTab(activeIndex);
    });

    window.addEventListener("resize", () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains("text-primary-600")
      );
      setActiveTab(activeIndex >= 0 ? activeIndex : 0);
    });
  });
});

// --------faq---------
document.addEventListener("DOMContentLoaded", () => {
  const faqs = document.querySelectorAll(".faq-border");
  const firstFaq = faqs[0];
  let firstFaqFirstOpen = true;

  faqs.forEach((faq, index) => {
    const trigger = faq.querySelector(".faq-content");
    const content = faq.querySelector(".faq-answer");
    const wrapper = faq.querySelector(".faq-content");
    const question = faq.querySelector(".faq-question");

    content.style.transition = "max-height 0.3s ease";

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = faq.classList.contains("active");

      faqs.forEach((f) => {
        const w = f.querySelector(".faq-content");
        if (f !== faq) {
          f.classList.remove("active");
          w.classList.remove(
            "gradient-border",
            "from-primary-600",
            "bg-primary-50"
          );
          w.classList.add("bg-zinc-100");
          const ans = f.querySelector(".faq-answer");
          ans.style.maxHeight = "0";
          f.querySelector(".faq-question").classList.remove("mb-3");
        }
      });

      if (!isOpen) {
        faq.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
        wrapper.classList.remove("bg-zinc-100");
        wrapper.classList.add(
          "bg-primary-50",
          "gradient-border",
          "from-primary-600"
        );
        question.classList.add("mb-3");
        if (faq === firstFaq && firstFaqFirstOpen) firstFaqFirstOpen = false;
      } else {
        faq.classList.remove("active");
        content.style.maxHeight = "0";
        wrapper.classList.remove(
          "gradient-border",
          "from-primary-600",
          "bg-primary-50"
        );
        wrapper.classList.add("bg-zinc-100");
        question.classList.remove("mb-3");
        if (faq === firstFaq && firstFaqFirstOpen) firstFaqFirstOpen = false;
      }
    });

    if (index === 0) {
      faq.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
      wrapper.classList.remove("bg-zinc-100");
      wrapper.classList.add(
        "bg-primary-50",
        "gradient-border",
        "from-primary-600"
      );
      question.classList.add("mb-3");
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest(".faq-border")) return;

    faqs.forEach((f) => {
      if (f === firstFaq && firstFaqFirstOpen) return;

      f.classList.remove("active");
      const w = f.querySelector(".faq-content");
      w.classList.remove(
        "gradient-border",
        "from-primary-600",
        "bg-primary-50"
      );
      w.classList.add("bg-zinc-100");
      f.querySelector(".faq-answer").style.maxHeight = "0";
      f.querySelector(".faq-question").classList.remove("mb-3");
    });
  });
});

// ---------- check contrast -----------
function getBrightness(hexColor) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function adjustTextColor(element, bgColor = null) {
  let colorToUse = bgColor || window.getComputedStyle(element).backgroundColor;
  let hexColor;

  if (colorToUse.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
    hexColor = colorToUse
      .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
      .slice(1)
      .map((n) => {
        return parseInt(n).toString(16).padStart(2, "0");
      })
      .join("");
    hexColor = `#${hexColor}`;
  } else if (colorToUse.match(/^#([0-9a-f]{3}){1,2}$/i)) {
    hexColor = colorToUse;
  }

  if (hexColor) {
    const brightness = getBrightness(hexColor);

    element.style.color = brightness < 0.5 ? "white" : "black";
  }
}

function getHoverBackgroundColor(element) {
  const hoverClass = Array.from(element.classList).find((className) =>
    className.startsWith("hover:bg-")
  );
  if (hoverClass) {
    const rootStyles = getComputedStyle(document.documentElement);
    const bgColor = rootStyles
      .getPropertyValue(`--${hoverClass.replace("hover:bg-", "")}`)
      .trim();

    if (bgColor) return bgColor;
  }
  return null;
}

function getTextColorFromClass(element) {
  const primaryTextClass = Array.from(element.classList).find((className) =>
    className.startsWith("text-primary")
  );
  const secondaryTextClass = Array.from(element.classList).find((className) =>
    className.startsWith("text-secondary")
  );

  if (primaryTextClass) {
    return window.getComputedStyle(element).color;
  }

  if (secondaryTextClass) {
    return window.getComputedStyle(element).color;
  }

  return null;
}

const boxes = document.querySelectorAll(".check-contrast");

boxes.forEach((box) => {
  const originalBgColor = window.getComputedStyle(box).backgroundColor;
  const originalTextColor = getTextColorFromClass(box);

  adjustTextColor(box, originalBgColor);

  box.addEventListener("mouseover", () => {
    const hoverColor = getHoverBackgroundColor(box);
    if (hoverColor) {
      const brightness = getBrightness(hoverColor);
      box.style.color = brightness < 0.5 ? "white" : "black";
    } else {
      adjustTextColor(box, originalBgColor);
    }

    const spans = box.querySelectorAll("span");
    spans.forEach((span) => {
      if (hoverColor) {
        const brightness = getBrightness(hoverColor);
        span.style.color = brightness < 0.5 ? "white" : "black";
      } else {
        adjustTextColor(span, originalBgColor);
      }
    });
  });

  box.addEventListener("mouseout", () => {
    if (originalTextColor) {
      box.style.color = originalTextColor;
    } else {
      adjustTextColor(box, originalBgColor);
    }

    const spans = box.querySelectorAll("span");
    spans.forEach((span) => {
      if (originalTextColor) {
        span.style.color = originalTextColor;
      } else {
        adjustTextColor(span, originalBgColor);
      }
    });
  });
});

// see-more contact
document.addEventListener("DOMContentLoaded", function () {
  function setupSeeMore(content, button) {
    let expanded = false;
    const MAX = parseInt(button.dataset.max) || 320;

    content.style.overflow = "hidden";
    content.style.transition = "height 0.5s ease";

    if (content.scrollHeight > MAX) {
      content.style.height = MAX + "px";
      button.style.display = "";
      button.textContent = "مشاهده بیشتر";
    } else {
      content.style.height = "auto";
      button.style.display = "none";
      expanded = true;
    }

    const forceReflow = () => content.getBoundingClientRect().height;

    button.addEventListener("click", function () {
      if (!expanded) {
        content.style.height = MAX + "px";
        forceReflow();
        content.style.height = content.scrollHeight + "px";
        button.textContent = "نمایش کمتر";
        expanded = true;

        const onEnd = (e) => {
          if (e.propertyName === "height") {
            content.style.height = "auto";
            content.removeEventListener("transitionend", onEnd);
          }
        };
        content.addEventListener("transitionend", onEnd);
      } else {
        const start = content.scrollHeight;
        content.style.height = start + "px";
        forceReflow();
        content.style.height = MAX + "px";
        button.textContent = "مشاهده بیشتر";
        expanded = false;
      }
    });
  }

  function setupReadMoreLink(content, link) {
    const MAX = parseInt(link.dataset.max) || 240;

    if (content.scrollHeight > MAX) {
      link.style.display = "inline-block";
    } else {
      link.style.display = "none";
    }
  }

  document.querySelectorAll(".content-box").forEach((box) => {
    const content = box.querySelector(".content-inner");
    const seeMoreBtn = box.querySelector(".see-more");
    const linkBtn = box.querySelector(".read-more-link");

    if (content && seeMoreBtn) {
      setupSeeMore(content, seeMoreBtn);
    }
    if (content && linkBtn) {
      setupReadMoreLink(content, linkBtn);
    }
  });
});

// ---------------shareBtn-----------------
document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.getElementById("shareBtn");
  const shareMenu = document.getElementById("shareMenu");
  const items = shareMenu.querySelectorAll(".share-item");

  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = shareMenu.classList.contains("opacity-100");

    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  shareMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    closeMenu();
  });

  function openMenu() {
    shareMenu.classList.remove("opacity-0", "pointer-events-none");
    shareMenu.classList.add("opacity-100", "pointer-events-auto");
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.remove("scale-0");
        item.classList.add("scale-100");
      }, i * 100);
    });
  }

  function closeMenu() {
    shareMenu.classList.remove("opacity-100", "pointer-events-auto");
    shareMenu.classList.add("opacity-0", "pointer-events-none");
    items.forEach((item) => item.classList.remove("scale-100"));
    items.forEach((item) => item.classList.add("scale-0"));
  }
});

//-----------swiper--------------
if (document.querySelector(".swiper-busy-destination")) {
  var swiperBusyDestination = new Swiper(".swiper-busy-destination", {
    slidesPerView: "auto",
    speed: 400,
    centeredSlides: false,
    spaceBetween: 8,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-popular-destination")) {
  var swiperPopularDestination = new Swiper(".swiper-popular-destination", {
    slidesPerView: "auto",
    speed: 400,
    centeredSlides: false,
    spaceBetween: 12,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-popular-tours")) {
  var swiperPopularTours = new Swiper(".swiper-popular-tours", {
    slidesPerView: "auto",
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-popular-hotels")) {
  var swiperPopularHotels = new Swiper(".swiper-popular-hotels", {
    slidesPerView: "auto",
    speed: 400,
    spaceBetween: 12,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-news")) {
  var swiperNews = new Swiper(".swiper-news", {
    slidesPerView: "auto",
    speed: 400,
    spaceBetween: 0,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".small-img-gallery")) {
  var smallImgGallery = new Swiper(".small-img-gallery", {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  });
}
if (document.querySelector(".big-img-gallery")) {
  var bigImgGallery = new Swiper(".big-img-gallery", {
    spaceBetween: 10,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: smallImgGallery,
    },
  });
}
if (document.querySelector(".swiper-news")) {
  var swiperNews = new Swiper(".swiper-news", {
    slidesPerView: "auto",
    speed: 400,
    spaceBetween: 0,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-popular-destination-mobile")) {
  var swiperPopularDestinationMobile = new Swiper(
    ".swiper-popular-destination-mobile",
    {
      slidesPerView: 1.3,
      speed: 400,
      centeredSlides: false,
      spaceBetween: 12,
      grabCursor: true,
      autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    }
  );
}
if (document.querySelector(".swiper-popular-hotels-mobile")) {
  var swiperPopularHotelsMobile = new Swiper(".swiper-popular-hotels-mobile", {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-news-mobile")) {
  var swiperNewsMobile = new Swiper(".swiper-news-mobile", {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-visa-mobile")) {
  var swiperVisaMobile = new Swiper(".swiper-visa-mobile", {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
if (document.querySelector(".swiper-popular-tours-mobile")) {
  var swiperPopularToursMobile = new Swiper(".swiper-popular-tours-mobile", {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });
}
