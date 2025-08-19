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

  const currentPage = main.dataset.activepage;

  document.querySelectorAll("nav a").forEach((link) => {
    if (link.dataset.activepage === currentPage) {
      link.classList.remove("text-zinc-900");
      link.classList.add("text-primary-600");
      link.classList.add("border-b-2","border-solid", "border-primary-600", "pb-2");

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
        tab.classList.toggle('text-zinc-900', i !== index);
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
    hexColor = colorToUse.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => {
      return parseInt(n).toString(16).padStart(2, '0');
    }).join('');
    hexColor = `#${hexColor}`;
  } else if (colorToUse.match(/^#([0-9a-f]{3}){1,2}$/i)) {
    hexColor = colorToUse;
  }

  if (hexColor) {
    const brightness = getBrightness(hexColor);

    element.style.color = brightness < 0.5 ? 'white' : 'black';
  }
}

function getHoverBackgroundColor(element) {
  // بررسی کلاس‌ها مثل hover:bg-secondary-50
  const hoverClass = Array.from(element.classList).find(className => className.startsWith("hover:bg-"));
  if (hoverClass) {
    // بررسی رنگ مربوطه از CSS متغیرهای ریشه
    const rootStyles = getComputedStyle(document.documentElement);
    const bgColor = rootStyles.getPropertyValue(`--${hoverClass.replace("hover:bg-", "")}`).trim();

    // اگر رنگ پیدا شد، آن را برمی‌گردانیم
    if (bgColor) return bgColor;
  }
  return null; // اگر رنگی پیدا نشد
}

function getTextColorFromClass(element) {
  // بررسی وجود کلاس‌های text-primary-600 یا text-secondary
  const primaryTextClass = Array.from(element.classList).find(className => className.startsWith("text-primary"));
  const secondaryTextClass = Array.from(element.classList).find(className => className.startsWith("text-secondary"));

  if (primaryTextClass) {
    return window.getComputedStyle(element).color; // برمی‌گرداند رنگ متن در صورت وجود کلاس text-primary
  }

  if (secondaryTextClass) {
    return window.getComputedStyle(element).color; // برمی‌گرداند رنگ متن در صورت وجود کلاس text-secondary
  }

  return null; // اگر هیچ کدام از این کلاس‌ها وجود نداشت
}

const boxes = document.querySelectorAll('.check-contrast');

boxes.forEach(box => {
  // ذخیره رنگ پس‌زمینه اصلی
  const originalBgColor = window.getComputedStyle(box).backgroundColor;
  const originalTextColor = getTextColorFromClass(box); // ذخیره رنگ متن اصلی (اگر وجود داشته باشد)

  adjustTextColor(box, originalBgColor); // بررسی رنگ متن اولیه

  // بررسی رنگ پس‌زمینه هنگام هاور
  box.addEventListener('mouseover', () => {
    const hoverColor = getHoverBackgroundColor(box); // گرفتن رنگ پس‌زمینه هاور
    if (hoverColor) {
      const brightness = getBrightness(hoverColor);
      box.style.color = brightness < 0.5 ? 'white' : 'black'; // تنظیم رنگ متن
    } else {
      adjustTextColor(box, originalBgColor); // اگر رنگ هاور پیدا نشد، رنگ متن رو طبق رنگ اصلی تنظیم می‌کنیم
    }

    // بررسی تگ‌های span داخل box و تغییر رنگ آن‌ها
    const spans = box.querySelectorAll('span');
    spans.forEach(span => {
      if (hoverColor) {
        const brightness = getBrightness(hoverColor);
        span.style.color = brightness < 0.5 ? 'white' : 'black'; // تنظیم رنگ متن span
      } else {
        adjustTextColor(span, originalBgColor); // اگر رنگ هاور پیدا نشد، رنگ متن span رو طبق رنگ اصلی تنظیم می‌کنیم
      }
    });
  });

  // برگشت به حالت اولیه بعد از هاور
  box.addEventListener('mouseout', () => {
    if (originalTextColor) {
      box.style.color = originalTextColor; // برگرداندن رنگ متن به رنگ اصلی که با کلاس text-primary یا text-secondary تنظیم شده
    } else {
      adjustTextColor(box, originalBgColor); // اگر کلاس رنگ متن وجود نداشت، رنگ متن را دوباره بر اساس رنگ پس‌زمینه اصلی تنظیم می‌کنیم
    }

    // برگشت به رنگ اصلی برای تگ‌های span
    const spans = box.querySelectorAll('span');
    spans.forEach(span => {
      if (originalTextColor) {
        span.style.color = originalTextColor; // برگرداندن رنگ متن span به رنگ اصلی
      } else {
        adjustTextColor(span, originalBgColor); // اگر رنگ متن span مشخص نشده بود، رنگ متن آن را طبق رنگ اصلی تنظیم می‌کنیم
      }
    });
  });
});
