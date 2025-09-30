document.addEventListener('DOMContentLoaded', function () {
  const isDesktop = window.innerWidth > 1024
  const requiredFiles = isDesktop
    ? ['template.ui.min.css']
    : ['template-mob.ui.min.css']

  function checkAllResourcesLoaded() {
    const resources = performance.getEntriesByType('resource')
    const loadedFiles = resources
      .map((res) => res.name.split('/').pop())
      .filter((name) => requiredFiles.includes(name))
    return requiredFiles.every((file) => loadedFiles.includes(file))
  }

  function fixUsePaths(root) {
    const mainEl = document.querySelector('main')
    const view = mainEl ? mainEl.getAttribute('data-view') : null
    const spritePath =
      view === 'mobile'
        ? '/PrimeTemplate_A/images/sprite-icons-mobile.svg'
        : '/PrimeTemplate_A/images/sprite-icons.svg'

    const isUseNode =
      root && root.tagName && root.tagName.toLowerCase() === 'use'
    const uses = isUseNode
      ? [root]
      : root && root.querySelectorAll
      ? root.querySelectorAll('use')
      : []

    uses.forEach((u) => {
      ;['href', 'xlink:href'].forEach((attr) => {
        const val = u.getAttribute(attr)
        if (!val) return

        if (val.startsWith('#')) return

        const [path, frag] = val.split('#')

        if (/sprite-icons/i.test(path) && path !== spritePath) {
          const nextVal = spritePath + (frag ? `#${frag}` : '')
          u.setAttribute(attr, nextVal)
        }
      })
    })
  }

  function initializeCalendarPopup() {
    document.addEventListener("click", function (e) {
      const dateBox = e.target.closest(".Basis_Date_Box");
      if (!dateBox) return;

      setTimeout(() => {
        const popup = document.querySelector(
          ".Basis_Calendar_Box.Selected_Basis_Calendar_Box"
        );
        if (!popup) return;

        const rect = dateBox.getBoundingClientRect();
        const parent = popup.offsetParent.getBoundingClientRect();

        popup.style.top =
          rect.top - parent.top + dateBox.offsetHeight + 50 + "px";

        if (
          document.documentElement.getAttribute("lang") === "fa" ||
          document.documentElement.getAttribute("lang") === "ar"
        ) {
          popup.style.right = parent.right - rect.right + "px";
          popup.style.left = "unset";
        } else {
          popup.style.left = rect.left - parent.left + "px";
          popup.style.right = "unset";
        }

        console.log(
          "✅ موقعیت پاپ‌آپ دقیق اعمال شد",
          popup.style.top,
          popup.style.right || popup.style.left
        );
      }, 50);
    });
  }

  function fetchEngine() {
    try {
      const xhrobj = new XMLHttpRequest()
      xhrobj.open('GET', 'search-engine.bc')
      xhrobj.send()

      xhrobj.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          const container = document.getElementById('search-box')
          const tpl = document.createElement('template')
          tpl.innerHTML = xhrobj.responseText

          fixUsePaths(tpl.content)

          container.innerHTML = ''
          container.appendChild(tpl.content)

          ;['.Basis_Date.end_date', '.Basis_Date.start_date'].forEach(
            (selector) => {
              const dateInputs = document.querySelectorAll(selector)
              dateInputs.forEach((input) => {
                input.placeholder = ''
              })
            },
          )

          const r = document.querySelector('.flighttype-field')
          r.classList.add('flighttype-dropDown')

          const scripts = container.getElementsByTagName('script')
          for (let i = 0; i < scripts.length; i++) {
            const scriptTag = document.createElement('script')
            if (scripts[i].src) {
              scriptTag.src = scripts[i].src
              scriptTag.async = false
            } else {
              scriptTag.text = scripts[i].textContent
            }
            document.head
              .appendChild(scriptTag)
              .parentNode.removeChild(scriptTag)
          }

          initializeCalendarPopup();

          const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                  fixUsePaths(node)
                }
              })
            })
          })

          observer.observe(container, { childList: true, subtree: true })
        }
      }
    } catch (error) {
      console.error('مشکلی پیش آمده است. لطفا صبور باشید', error)
    }
  }

  function waitForFiles() {
    if (checkAllResourcesLoaded()) {
      fetchEngine()
    } else {
      setTimeout(waitForFiles, 500)
    }
  }

  if (document.getElementById('search-box')) {
    waitForFiles()
  }
})

//-----------fetch-menu-header------------
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.header-fetch-container')
  if (!container) return

  const jsonData = container.dataset.headerJson
  if (!jsonData) return

  let items
  try {
    items = JSON.parse(jsonData)
  } catch (err) {
    console.error('Invalid JSON:', err)
    return
  }

  const fetchCache = new Map()
  const isDesktop = window.innerWidth > 1024

  const fetchPromises = items.map(async (item) => {
    try {
      const fetchType = item.fetch
      let html = ''

      if (item.submenu) {
        const res = await fetch(
          `/template-load-items.bc?fetch=${encodeURIComponent(fetchType)}&catid=${item.catid}&mid=${item.mid}&v=${Date.now()}`
        )

        if (!res.ok) throw new Error(`خطا در fetch (${res.status})`)
        html = await res.text()

        fetchCache.set(fetchType, html)
      } else {
        if (isDesktop) {
          html = `
            <li class="relative flex items-center h-full group">
              <a href="${item.mainLink}" class="header-mainLink-fetch group flex items-center lg:text-xs xl:text-base h-full transition-all duration-300 text-zinc-900 hover:text-primary-600" data-activepage="${item.activePage || ''}">
                <span class="header-fetch-text">${item.name}</span>
                <span class="absolute -bottom-px right-0 w-0 transition-all duration-300 h-0.5 bg-primary-600 group-hover:w-full"></span>
              </a>
            </li>
          `
        } else {
          html = `
            <li class="flex items-center py-4">
              <a href="${item.mainLink}" class="header-mainLink-fetch w-full font-medium text-sm text-zinc-900" data-activepage="${item.activePage || ''}">
                <span class="header-fetch-text">${item.name}</span>
              </a>
            </li>
          `
        }
      }

      return { item, html }
    } catch (err) {
      console.error(err)
      return { item, html: '' }
    }
  })

  const results = await Promise.all(fetchPromises)

  results.forEach(({ item, html }) => {
    if (!html) return

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    const mainLink = tempDiv.querySelector('.header-mainLink-fetch')
    if (mainLink) {
      mainLink.href = item.mainLink
      if (item.activePage) mainLink.dataset.activepage = item.activePage

      const spanText = mainLink.querySelector('.header-fetch-text')
      if (spanText) spanText.textContent = item.name
    }

    if (item.submenu) {
      const subLinks = tempDiv.querySelectorAll('.header-subLink-fetch')
      subLinks.forEach((a) => {
        const originalHref = a.getAttribute('href')
        const queryString = originalHref.includes('?')
          ? originalHref.split('?')[1]
          : ''
        a.href = item.subLinks + (queryString ? '?' + queryString : '')
      })
    }

    container.innerHTML += tempDiv.innerHTML
  })

  applyActivePage()
  initSearchForm()
})

//----------open-menu-mobile------------
document.addEventListener('DOMContentLoaded', function () {
  const headerMenu = document.querySelector('.header-menu')
  const headerMenuClose = document.querySelector('.header-menu-close')
  const bars3 = document.querySelector('.bars3')

  if (!headerMenu || !headerMenuClose || !bars3) return

  const isDesktop = () => window.innerWidth >= 1024

  const openMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = 'visible'
      headerMenu.style.opacity = '1'
    } else {
      headerMenu.style.transform = 'translateX(0)'
    }
    document.body.classList.add('overflow-hidden')
  }

  const closeMenu = () => {
    if (isDesktop()) {
      headerMenu.style.visibility = 'hidden'
      headerMenu.style.opacity = '0'
    } else {
      headerMenu.style.transform = 'translateX(1024px)'
    }
    document.body.classList.remove('overflow-hidden')
  }

  bars3.addEventListener('click', openMenu)
  headerMenuClose.addEventListener('click', closeMenu)

  headerMenu.addEventListener('click', (e) => {
    const toggle = e.target.closest('.toggle-dropdown')
    if (!toggle) return

    const submenu = toggle.nextElementSibling
    if (!submenu) return

    const dropdownIcon = toggle.querySelector('.dropdown-icon')
    const isOpen = submenu.style.maxHeight

    if (isOpen) {
      submenu.style.maxHeight = null
      submenu.style.opacity = '0'
    } else {
      submenu.style.maxHeight = submenu.scrollHeight * 30 + 'px'
      submenu.style.opacity = '1'
    }

    if (dropdownIcon) dropdownIcon.classList.toggle('rotate-180')

    e.stopPropagation()
  })
})

// ---------Section-order------------
document.addEventListener('DOMContentLoaded', function () {
  const main = document.querySelector('main')
  if (!main) return

  const sectionOrder = main.getAttribute('data-sectionorder')
  if (!sectionOrder) return

  const orderArray = sectionOrder
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  const parentContainer = document.querySelector('.parent-container')
  if (!parentContainer) return

  const sections = Array.from(
    parentContainer.querySelectorAll('.section-order'),
  )
  if (!sections.length) return

  orderArray.forEach((order) => {
    const section = sections.find(
      (sec) => sec.getAttribute('data-order') === order,
    )
    if (section) {
      parentContainer.appendChild(section)
    }
  })
})

// ---------active header items------------
function applyActivePage() {
  const main = document.querySelector('main')
  if (!main) return

  const currentPage = main.dataset.activepage?.trim()
  if (!currentPage) return

  document
    .querySelectorAll(
      'header nav a, header .toggle-dropdown a, header nav li a',
    )
    .forEach((link) => {
      if (link.dataset.activepage === currentPage) {
        link.classList.remove('text-zinc-900')
        link.classList.add('text-primary-600')

        if (window.innerWidth >= 1024) {
          if (!link.querySelector('.active-underline')) {
            link.style.position = 'relative'
            link.insertAdjacentHTML(
              'beforeend',
              `<span class="active-underline absolute -bottom-px right-0 w-full transition-all duration-300 h-0.5 bg-primary-600"></span>`,
            )
          }
        }

        if (window.innerWidth < 1024) {
          const icon = link
            .closest('li, .toggle-dropdown')
            ?.querySelector('use')
          if (icon) {
            const href = icon.getAttribute('href')
            if (href.includes('-zinc')) {
              icon.setAttribute('href', href.replace('-zinc', '-primary'))
            }
          }
        }
      }
    })
}

// -----------form header--------------
function initSearchForm() {
  const form = document.querySelector('.search-form')
  if (!form) return

  const input = form.querySelector('.search-input')
  const button = form.querySelector('.search-toggle')
  const phoneSpan = document.querySelector('.phone-number-header')
  const phoneSvg = document.querySelector('.phone-svg-header')
  const nav = document.querySelector('.header-nav')
  if (!input || !button || !phoneSpan || !nav) return

  let expanded = false

  function openForm() {
    form.classList.add('w-48')
    form.classList.remove('w-12')

    input.classList.add('w-full', 'pr-3')
    input.classList.remove('w-0', 'pr-0')

    expanded = true
    input.focus()

    setTimeout(() => {
      const screenWidth = window.innerWidth

      if (screenWidth >= 1024 && screenWidth < 1280 && nav.scrollWidth > 400) {
        phoneSpan.style.display = 'none'
        if (phoneSvg) phoneSvg.style.display = 'none'
      } else if (screenWidth >= 1280 && nav.scrollWidth > 700) {
        phoneSpan.style.display = 'none'
      }
    }, 10)
  }

  function closeForm() {
    form.classList.remove('w-48')
    form.classList.add('w-12')

    input.classList.remove('w-full', 'pr-3')
    input.classList.add('w-0', 'pr-0')

    expanded = false

    form.addEventListener('transitionend', function handler(e) {
      if (e.propertyName === 'width') {
        phoneSpan.style.display = 'inline'
        if (phoneSvg) phoneSvg.style.display = 'inline'
        form.removeEventListener('transitionend', handler)
      }
    })
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation()
    if (!expanded) {
      openForm()
    } else if (!input.value.trim()) {
      input.focus()
    } else {
      form.submit()
    }
  })

  document.addEventListener('click', (e) => {
    if (expanded && !form.contains(e.target)) {
      closeForm()
    }
  })

  form.addEventListener('submit', (e) => {
    if (!input.value.trim()) {
      e.preventDefault()
      input.focus()
    }
  })
}

document.querySelectorAll('.highlight-rest').forEach((el) => {
  let words = el.textContent.trim().split(' ')
  if (words.length > 1) {
    let first = words[0]
    let rest = words.slice(1).join(' ')
    el.innerHTML = `${first} <span class="text-primary-600 font-bold">${rest}</span>`
  }
})

// ---------scrollTopBtn----------
document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelector('.scrollTopBtn')) {
    const scrollTopBtn = document.querySelector('.scrollTopBtn')

    function checkScreenSize() {
      if (window.innerWidth > 1024) {
        scrollTopBtn.style.display = 'none'
      } else {
        updateButtonVisibility()
      }
    }

    function updateButtonVisibility() {
      if (
        window.innerWidth <= 1024 &&
        (document.body.scrollTop > 100 ||
          document.documentElement.scrollTop > 100)
      ) {
        scrollTopBtn.style.display = 'flex'
      } else {
        scrollTopBtn.style.display = 'none'
      }
    }

    window.addEventListener('scroll', updateButtonVisibility)
    window.addEventListener('resize', checkScreenSize)
    scrollTopBtn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' }),
    )

    checkScreenSize()
  }
})

// ---------active line-------------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tabs').forEach((tabsWrapper) => {
    const tabsContainer = tabsWrapper.querySelector('.tabs-container')
    const tabs = tabsContainer.querySelectorAll('button')
    const line = tabsWrapper.querySelector('.active-line')

    function setActiveTab(index) {
      if (!tabs[index]) return

      tabs.forEach((tab, i) => {
        tab.classList.toggle('text-primary-600', i === index)
        tab.classList.toggle('font-bold', i === index)
        tab.classList.toggle('text-zinc-900', i !== index)
      })

      const tab = tabs[index]
      const tabRect = tab.getBoundingClientRect()
      const containerRect = tabsContainer.getBoundingClientRect()

      const tabLeft = tabRect.left - containerRect.left
      const width = tab.offsetWidth

      line.style.width = width + 'px'
      line.style.left = tabLeft + 'px'
    }

    setActiveTab(0)

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => setActiveTab(i))
    })

    tabsContainer.addEventListener('scroll', () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains('text-primary-600'),
      )
      if (activeIndex >= 0) setActiveTab(activeIndex)
    })

    window.addEventListener('resize', () => {
      const activeIndex = [...tabs].findIndex((tab) =>
        tab.classList.contains('text-primary-600'),
      )
      setActiveTab(activeIndex >= 0 ? activeIndex : 0)
    })
  })
})

// --------faq---------
function initFaqAccordion(container = document) {
  const faqs = container.querySelectorAll('.faq-border')
  if (faqs.length === 0) return

  const firstFaq = faqs[0]
  let firstFaqFirstOpen = true

  faqs.forEach((faq, index) => {
    const trigger = faq.querySelector('.faq-content')
    const content = faq.querySelector('.faq-answer')
    const wrapper = faq.querySelector('.faq-content')
    const question = faq.querySelector('.faq-question')

    content.style.transition = 'max-height 0.3s ease'

    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = faq.classList.contains('active')

      faqs.forEach((f) => {
        const w = f.querySelector('.faq-content')
        if (f !== faq) {
          f.classList.remove('active')
          w.classList.remove(
            'gradient-border',
            'from-primary-600',
            'bg-primary-50',
          )
          w.classList.add('bg-zinc-100')
          const ans = f.querySelector('.faq-answer')
          ans.style.maxHeight = '0'
          f.querySelector('.faq-question').classList.remove('mb-3')
        }
      })

      if (!isOpen) {
        faq.classList.add('active')
        content.style.maxHeight = content.scrollHeight + 'px'
        wrapper.classList.remove('bg-zinc-100')
        wrapper.classList.add(
          'bg-primary-50',
          'gradient-border',
          'from-primary-600',
        )
        question.classList.add('mb-3')
        if (faq === firstFaq && firstFaqFirstOpen) firstFaqFirstOpen = false
      } else {
        faq.classList.remove('active')
        content.style.maxHeight = '0'
        wrapper.classList.remove(
          'gradient-border',
          'from-primary-600',
          'bg-primary-50',
        )
        wrapper.classList.add('bg-zinc-100')
        question.classList.remove('mb-3')
        if (faq === firstFaq && firstFaqFirstOpen) firstFaqFirstOpen = false
      }
    })

    if (index === 0) {
      faq.classList.add('active')
      content.style.maxHeight = content.scrollHeight + 'px'
      wrapper.classList.remove('bg-zinc-100')
      wrapper.classList.add(
        'bg-primary-50',
        'gradient-border',
        'from-primary-600',
      )
      question.classList.add('mb-3')
    }
  })

  document.addEventListener('click', (e) => {
    if (e.target.closest('.faq-border')) return

    faqs.forEach((f) => {
      if (f === firstFaq && firstFaqFirstOpen) return

      f.classList.remove('active')
      const w = f.querySelector('.faq-content')
      w.classList.remove('gradient-border', 'from-primary-600', 'bg-primary-50')
      w.classList.add('bg-zinc-100')
      f.querySelector('.faq-answer').style.maxHeight = '0'
      f.querySelector('.faq-question').classList.remove('mb-3')
    })
  })
}

// ---------- check contrast -----------
function applyContrastCheck() {
  function getBrightness(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16)
    const g = parseInt(hexColor.substr(3, 2), 16)
    const b = parseInt(hexColor.substr(5, 2), 16)

    return (r * 0.299 + g * 0.587 + b * 0.114) / 255
  }

  function adjustTextColor(element, bgColor = null) {
    let colorToUse = bgColor || window.getComputedStyle(element).backgroundColor
    let hexColor

    if (colorToUse.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)) {
      hexColor = colorToUse
        .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
        .slice(1)
        .map((n) => {
          return parseInt(n).toString(16).padStart(2, '0')
        })
        .join('')
      hexColor = `#${hexColor}`
    } else if (colorToUse.match(/^#([0-9a-f]{3}){1,2}$/i)) {
      hexColor = colorToUse
    }

    if (hexColor) {
      const brightness = getBrightness(hexColor)

      element.style.color = brightness < 0.5 ? 'white' : 'black'
    }
  }

  function getHoverBackgroundColor(element) {
    const hoverClass = Array.from(element.classList).find((className) =>
      className.startsWith('hover:bg-'),
    )
    if (hoverClass) {
      const rootStyles = getComputedStyle(document.documentElement)
      const bgColor = rootStyles
        .getPropertyValue(`--${hoverClass.replace('hover:bg-', '')}`)
        .trim()

      if (bgColor) return bgColor
    }
    return null
  }

  function getTextColorFromClass(element) {
    const primaryTextClass = Array.from(element.classList).find((className) =>
      className.startsWith('text-primary'),
    )
    const secondaryTextClass = Array.from(element.classList).find((className) =>
      className.startsWith('text-secondary'),
    )

    if (primaryTextClass) {
      return window.getComputedStyle(element).color
    }

    if (secondaryTextClass) {
      return window.getComputedStyle(element).color
    }

    return null
  }

  const boxes = document.querySelectorAll('.check-contrast')

  boxes.forEach((box) => {
    const originalBgColor = window.getComputedStyle(box).backgroundColor
    const originalTextColor = getTextColorFromClass(box)

    adjustTextColor(box, originalBgColor)

    box.addEventListener('mouseover', () => {
      const hoverColor = getHoverBackgroundColor(box)
      if (hoverColor) {
        const brightness = getBrightness(hoverColor)
        box.style.color = brightness < 0.5 ? 'white' : 'black'
      } else {
        adjustTextColor(box, originalBgColor)
      }

      const spans = box.querySelectorAll('span')
      spans.forEach((span) => {
        if (hoverColor) {
          const brightness = getBrightness(hoverColor)
          span.style.color = brightness < 0.5 ? 'white' : 'black'
        } else {
          adjustTextColor(span, originalBgColor)
        }
      })
    })

    box.addEventListener('mouseout', () => {
      if (originalTextColor) {
        box.style.color = originalTextColor
      } else {
        adjustTextColor(box, originalBgColor)
      }

      const spans = box.querySelectorAll('span')
      spans.forEach((span) => {
        if (originalTextColor) {
          span.style.color = originalTextColor
        } else {
          adjustTextColor(span, originalBgColor)
        }
      })
    })
  })
}
document.addEventListener('DOMContentLoaded', () => {
  applyContrastCheck()
})

// see-more contact
document.addEventListener('DOMContentLoaded', function () {
  function setupSeeMore(content, button) {
    let expanded = false
    const MAX = parseInt(button.dataset.max) || 320

    content.style.overflow = 'hidden'
    content.style.transition = 'height 0.5s ease'

    if (content.scrollHeight > MAX) {
      content.style.height = MAX + 'px'
      button.style.display = ''
      button.textContent = 'مشاهده بیشتر'
    } else {
      content.style.height = 'auto'
      button.style.display = 'none'
      expanded = true
    }

    const forceReflow = () => content.getBoundingClientRect().height

    button.addEventListener('click', function () {
      if (!expanded) {
        content.style.height = MAX + 'px'
        forceReflow()
        content.style.height = content.scrollHeight + 'px'
        button.textContent = 'نمایش کمتر'
        expanded = true

        const onEnd = (e) => {
          if (e.propertyName === 'height') {
            content.style.height = 'auto'
            content.removeEventListener('transitionend', onEnd)
          }
        }
        content.addEventListener('transitionend', onEnd)
      } else {
        const start = content.scrollHeight
        content.style.height = start + 'px'
        forceReflow()
        content.style.height = MAX + 'px'
        button.textContent = 'مشاهده بیشتر'
        expanded = false
      }
    })
  }

  function setupReadMoreLink(content, link) {
    const MAX = parseInt(link.dataset.max) || 240

    if (content.scrollHeight > MAX) {
      link.style.display = 'inline-block'
    } else {
      link.style.display = 'none'
    }
  }

  document.querySelectorAll('.content-box').forEach((box) => {
    const contents = box.querySelectorAll('.content-inner')
    const seeMoreBtn = box.querySelector('.see-more')
    contents.forEach((content) => {
      const linkBtn = content.parentElement.querySelector('.read-more-link')

      if (seeMoreBtn) setupSeeMore(content, seeMoreBtn)
      if (linkBtn) setupReadMoreLink(content, linkBtn)
    })
  })
})

//-----------dynamic-bg-----------------
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dynamic-bg').forEach((section, index) => {
    const imgSource = section.querySelector('.dynamic-img')
    const bgUrl = imgSource?.dataset.bg?.trim()
    if (bgUrl) {
      section.style.setProperty('--bg', `url(${bgUrl})`)
    } else {
      section.style.setProperty('--bg', 'none')
    }
  })
})

// ---------------shareBtn-----------------
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn')
  const shareMenu = document.getElementById('shareMenu')

  if (!shareBtn || !shareMenu) return

  const items = shareMenu.querySelectorAll('.share-item')

  const openMenu = () => {
    shareMenu.classList.add('opacity-100', 'pointer-events-auto')
    shareMenu.classList.remove('opacity-0', 'pointer-events-none')

    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('scale-100')
        item.classList.remove('scale-0')
      }, i * 100)
    })
  }

  const closeMenu = () => {
    shareMenu.classList.remove('opacity-100', 'pointer-events-auto')
    shareMenu.classList.add('opacity-0', 'pointer-events-none')

    items.forEach((item) => {
      item.classList.remove('scale-100')
      item.classList.add('scale-0')
    })
  }

  shareBtn.addEventListener('click', async (e) => {
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: 'این صفحه رو ببین!',
          url: window.location.href,
        })
        console.log('صفحه با موفقیت به اشتراک گذاشته شد!')
      } catch (err) {
        console.log('خطا یا لغو:', err)
        openMenu()
      }
    } else {
      openMenu()
    }
  })

  shareMenu.addEventListener('click', (e) => e.stopPropagation())
  document.addEventListener('click', closeMenu)
})

//--------------landing to search-engine------------
document.querySelectorAll('.ticket-article').forEach((e) => {
  const rEl = e.querySelector('.dep-text')
  const r = rEl ? rEl.innerText.trim() : ''

  const iEl = e.querySelector('.dep-id')
  const i = iEl ? iEl.innerText.trim() : ''

  const aEl = e.querySelector('.des-text')
  const a = aEl ? aEl.innerText.trim() : ''

  const lEl = e.querySelector('.des-id')
  const l = lEl ? lEl.innerText.trim() : ''

  const btn = e.querySelector('.set-ticket')
  if (!btn) return

  btn.addEventListener('click', () => {
    if (
      window.location.pathname === '/' 
    ) {
      const dep1 = document.querySelector('#r-flight #flightSearch #departure1')
      const depId = document.querySelector(
        '#r-flight #flightSearch .departure-route .locationId',
      )
      const des1 = document.querySelector(
        '#r-flight #flightSearch .destination-route #destination1',
      )
      const desId = document.querySelector(
        '#r-flight #flightSearch .destination-route .locationId',
      )

      if (dep1) dep1.value = r
      if (depId) depId.value = i
      if (des1) des1.value = a
      if (desId) desId.value = l

      const rFlight = document.querySelector('#r-flight')
      if (rFlight) rFlight.classList.remove('hidden')

      const scrollTarget = document.querySelector('.search-box-container')
      if (scrollTarget) {
        window.scrollTo({
          top: scrollTarget.offsetTop,
          behavior: 'smooth',
        })
      }
    }
  })
})

// ---------------fetch-content-----------------
document.addEventListener('DOMContentLoaded', () => {
  const tabGroups = [
    {
      btnClass: 'hotel-fetch-btn',
      containerClass: 'fetch-content-hotel_group',
      type: 'hotel_group',
      swiperSelector: '.swiper-popular-hotels',
      swiperVar: 'swiperPopularHotels',
      initialLoad: true,
    },
    {
      btnClass: 'tour-fetch-btn',
      containerClass: 'fetch-content-tour_group',
      type: 'tour_group',
      swiperSelector: '.swiper-popular-tours',
      swiperVar: 'swiperPopularTours',
      initialLoad: true,
    },
    {
      btnClass: 'faq-fetch-btn',
      containerClass: 'fetch-content-faq',
      type: 'faq',
      swiperSelector: null,
      swiperVar: null,
      initialLoad: true,
    },
    {
      btnClass: 'article-fetch-btn',
      containerClass: 'fetch-content-article-list_group',
      type: 'article-list_group',
      swiperSelector: null,
      swiperVar: null,
      initialLoad: false,
    },
  ]

  function initSwiper(selector, globalVarName) {
    if (!selector) return
    window[globalVarName] = new Swiper(selector, {
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
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        1024: {
          slidesPerView: 'auto',
          spaceBetween: 12,
        },
      },
    })
  }

  tabGroups.forEach(
    ({
      btnClass,
      containerClass,
      type,
      swiperSelector,
      swiperVar,
      initialLoad,
    }) => {
      const buttons = document.querySelectorAll(`.${btnClass}`)
      const container = document.querySelector(`.${containerClass}`)
      if (!container) return

      async function loadContent(btn) {
        buttons.forEach((b) => b.classList.remove('active'))
        if (btn.classList) btn.classList.add('active')

        container.innerHTML =
          '<div class="h-full flex items-center justify-center"><span class="fetch-loader"></span></div>'

        const dataId = btn.getAttribute('data-id')

        const paramKey = btnClass === 'faq-fetch-btn' ? 'id' : 'catid'

        const minLoaderTime = new Promise((resolve) =>
          setTimeout(resolve, 1000),
        )

        try {
          const res = await fetch(
            `/template-load-items.bc?fetch=${type}&${paramKey}=${encodeURIComponent(
              dataId,
            )}`,
          )
          if (!res.ok)
            throw new Error(`خطا در ارتباط با سرور (کد ${res.status})`)

          const html = await res.text()
          await minLoaderTime
          container.innerHTML = html

          if (btnClass === 'faq-fetch-btn') {
            const imgSrc = btn.getAttribute('data-src')
            const imgEl = container.querySelector('.faq-img')
            if (imgEl) {
              imgEl.style.display = imgSrc ? 'block' : 'none'
              if (imgSrc) imgEl.src = imgSrc
            }

            if (typeof initFaqAccordion === 'function') {
              initFaqAccordion(container)
            }
          }

          if (btnClass === 'article-fetch-btn') {
            bindArticleFilter()
          }

          if (swiperSelector && swiperVar) {
            initSwiper(swiperSelector, swiperVar)
          }

          if (typeof applyContrastCheck === 'function') {
            applyContrastCheck()
          }
        } catch (err) {
          console.error(err)
          await minLoaderTime
          container.innerHTML = `
            <div class="text-center text-red-500 py-6">
              خطا در بارگذاری داده‌ها.<br>
              لطفاً دوباره تلاش کنید.
            </div>`
        }
      }

      buttons.forEach((btn) =>
        btn.addEventListener('click', () => loadContent(btn)),
      )
      const allId = container.dataset.all_id

      if (allId) {
        const tempBtn = {
          getAttribute: (attr) => (attr === 'data-id' ? allId : null),
          classList: { remove: () => {}, add: () => {} },
        }
        loadContent(tempBtn)
      } else if (buttons.length > 0) {
        loadContent(buttons[0])
      }
    },
  )
})

//-------------paging--------------
const getSelectedCatId = () => {
  const selectedLabel = document.querySelector('.article-fetch-btn.active')
  if (selectedLabel) {
    return selectedLabel.getAttribute('data-id')
  }
  const fetchContentArticle = document.querySelector(
    '.fetch-content-article-list_group',
  )
  return fetchContentArticle
    ? fetchContentArticle.getAttribute('data-all_id')
    : null
}

const fetchArticlePage = async (dataPageNum) => {
  const fetchContentArticle = document.querySelector(
    '.fetch-content-article-list_group',
  )
  const cmsQuery = getSelectedCatId()
  if (!cmsQuery) return

  const pagingResponse = await fetch(
    `/template-load-items.bc?fetch=article-list_group&catid=${cmsQuery}&pagenum=${dataPageNum}`,
  )
  const pagingData = await pagingResponse.text()
  fetchContentArticle.innerHTML = pagingData

  bindArticleFilter()
}

//---------filter-article-title-----------
function bindArticleFilter() {
  const filterInput = document.getElementById('articleNameFilter')
  const filterBtn = document.querySelector('.articleNameFilterBtn')
  const articleWrapper = document.querySelector('.article-card-container')
  const pagingEl = document.getElementById('paging')
  if (!filterInput || !filterBtn || !articleWrapper) return

  const notFoundEl = document.createElement('div')
  notFoundEl.className =
    'hidden flex flex-col items-center justify-center h-full'
  notFoundEl.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full">
      <h2 class="text-3xl font-bold mb-2">هیچ موردی پیدا نشد!</h2>
      <p class="text-lg mb-6">چشم‌ها همه‌جا رو گشتن ولی چیزی پیدا نکردن</p>
      <span class="not-found-loader"></span>
    </div>
  `
  articleWrapper.parentNode.insertBefore(notFoundEl, articleWrapper.nextSibling)

  const doFilter = () => {
    const searchTerm = filterInput.value.trim().toLowerCase()
    const articles = articleWrapper.querySelectorAll('.article-card')
    let found = false

    articles.forEach((article) => {
      const title = article.getAttribute('data-title') || ''
      const match = title.toLowerCase().includes(searchTerm)
      article.style.display = match ? '' : 'none'
      if (match) found = true
    })

    if (!found) {
      articleWrapper.style.display = 'none'
      if (pagingEl) pagingEl.style.display = 'none'
      notFoundEl.classList.remove('hidden')
    } else {
      articleWrapper.style.display = ''
      if (pagingEl) pagingEl.style.display = ''
      notFoundEl.classList.add('hidden')
    }
  }

  filterBtn.addEventListener('click', doFilter)
  filterInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      doFilter()
    }
  })
}

//-----------hotel and visa words-------------
document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search)
  const qParam = urlParams.get('q')
  if (qParam !== 'all') return

  const filters = [
    {
      wrapper: '.hotel-card-container',
      items: '.hotel-card',
      title: '.hotel-card-title',
      keyword: ['hotel', 'هتل'],
      containerTitle: '.hotel-container-title',
    },
    {
      wrapper: '.visa-card-container',
      items: '.visa-card',
      title: '.visa-card-title',
      keyword: ['visa', 'ویزا'],
      containerTitle: '.visa-container-title',
    },
  ]

  filters.forEach((filter) => {
    const container = document.querySelector(filter.wrapper)
    const containerTitle = document.querySelector(filter.containerTitle)
    if (!container) return

    const allItems = Array.from(container.querySelectorAll(filter.items))
    if (allItems.length === 0) {
      if (containerTitle) containerTitle.style.display = 'none'
      container.style.display = 'none'
      return
    }

    container.innerHTML = ''
    let hasMatch = false

    allItems.forEach((item) => {
      const titleEl = item.querySelector(filter.title)
      const titleText = titleEl ? titleEl.textContent.toLowerCase() : ''
      if (filter.keyword.some((kw) => titleText.startsWith(kw))) {
        const clone = item.cloneNode(true)
        container.appendChild(clone)
        hasMatch = true
      }
    })

    if (!hasMatch) {
      if (containerTitle) containerTitle.style.display = 'none'
      container.style.display = 'none'
    }
  })
})

//--------switch-comment-btn---------
document.addEventListener('DOMContentLoaded', () => {
  const commentButtons = document.querySelectorAll('.comment-btn')
  const commentContents = document.querySelectorAll('.comment-content')

  if (!commentButtons.length || !commentContents.length) return

  commentButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      commentButtons.forEach((b) => {
        b.classList.remove('text-primary-900')
        b.classList.add('text-zinc-900')
      })
      btn.classList.remove('text-zinc-900')
      btn.classList.add('text-primary-900')

      const targetId = btn.dataset.comment
      commentContents.forEach((content) => {
        if (content.id === targetId) {
          content.classList.remove('hidden', 'opacity-0', 'scale-95')
          content.classList.add('block', 'opacity-100', 'scale-100')
        } else {
          content.classList.remove('block', 'opacity-100', 'scale-100')
          content.classList.add('hidden', 'opacity-0', 'scale-95')
        }
      })
    })
  })
})

//----empty-fields-check----------
document.addEventListener('DOMContentLoaded', () => {
  const checkEmptyFaceFields = (parent) => {
    const emptyFaceText = parent.querySelector('.empty-face-text')

    if (emptyFaceText && emptyFaceText.textContent.trim() === '') {
      parent.style.display = 'none'
    }
  }

  const observer = new MutationObserver(() => {
    const emptyFaceFields = document.querySelectorAll('.empty-face-fields')

    emptyFaceFields.forEach((parent) => {
      checkEmptyFaceFields(parent)
    })
  })

  const config = { childList: true, subtree: true }
  const rootElement = document.body

  observer.observe(rootElement, config)

  const emptyFaceFields = document.querySelectorAll('.empty-face-fields')
  emptyFaceFields.forEach((parent) => {
    checkEmptyFaceFields(parent)
  })
})

document.addEventListener('DOMContentLoaded', function () {
  const smallGalleryEl = document.querySelector('.small-img-gallery')
  const bigGalleryEl = document.querySelector('.big-img-gallery')
  if (!smallGalleryEl || !bigGalleryEl) {
    console.warn('⚠️ گالری پیدا نشد، Swiper ساخته نشد.')
    return
  }

  const smallImgGallery = new Swiper('.small-img-gallery', {
    spaceBetween: 10,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
  })

  const bigImgGallery = new Swiper('.big-img-gallery', {
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: { swiper: smallImgGallery },
  })

  const popupModalGallery = document.getElementById('popupModalGallery')
  const popupContentGallery = document.querySelector(
    '.big-img-gallery-popup .swiper-wrapper',
  )
  const closePopupGallery = document.getElementById('closePopupGallery')
  const images = document.querySelectorAll(
    '.small-img-gallery .swiper-slide img',
  )
  const galleryCount = document.querySelector('.gallery-img-count')

  if (!popupModalGallery || !popupContentGallery || !closePopupGallery) {
    console.warn('⚠️ عناصر مربوط به پاپ‌آپ گالری پیدا نشدن.')
    return
  }

  const totalImages = images.length
  if (totalImages === 0) {
    console.warn('⚠️ هیچ تصویری برای گالری وجود ندارد.')
    return
  }

  let swiperPopup = null

  images.forEach((image, index) => {
    image.addEventListener('click', function () {
      popupContentGallery.innerHTML = ''

      images.forEach((thumbImage) => {
        const slide = document.createElement('div')
        slide.classList.add('swiper-slide')
        const thumbImageElement = document.createElement('img')
        thumbImageElement.src = thumbImage.src
        thumbImageElement.classList.add(
          'w-full',
          'h-full',
          'object-cover',
          'rounded-xl',
        )
        slide.appendChild(thumbImageElement)
        popupContentGallery.appendChild(slide)
      })

      if (swiperPopup) swiperPopup.destroy(true, true)

      swiperPopup = new Swiper('.big-img-gallery-popup', {
        loop: true,
        initialSlide: index,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        slidesPerView: 1,
        spaceBetween: 10,
        on: {
          init: function () {
            if (galleryCount) {
              galleryCount.textContent = `${
                this.realIndex + 1
              } از ${totalImages}`
            }
          },
          slideChange: function () {
            if (galleryCount) {
              galleryCount.textContent = `${
                this.realIndex + 1
              } از ${totalImages}`
            }
          },
        },
      })

      popupModalGallery.classList.remove('hidden')
      popupModalGallery.classList.add('flex')
      document.body.style.overflow = 'hidden'
    })
  })

  closePopupGallery.addEventListener('click', function () {
    popupModalGallery.classList.add('hidden')
    popupModalGallery.classList.remove('flex')
    document.body.style.overflow = ''
  })

  popupModalGallery.addEventListener('click', function (e) {
    if (e.target === popupModalGallery) {
      popupModalGallery.classList.add('hidden')
      popupModalGallery.classList.remove('flex')
      document.body.style.overflow = ''
    }
  })
})

//--------------open and close filter menu----------------
document.addEventListener('DOMContentLoaded', () => {
  const filterBtn = document.getElementById('filterOpenBtn')
  const closeBtn = document.getElementById('filterCloseBtn')
  const filterPanel = document.querySelector('.filters-panel')

  if (filterBtn && filterPanel) {
    filterBtn.addEventListener('click', () => {
      filterPanel.classList.remove('translate-y-full')
    })
  }
  if (closeBtn && filterPanel) {
    closeBtn.addEventListener('click', () => {
      filterPanel.classList.add('translate-y-full')
    })
  }
})

//--------------POV-form-------------//
document.querySelectorAll('.pov-form').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault()
    const loading = form.closest('form').querySelector('.Loading_Form')
    const message = form.closest('form').querySelector('.Message-Form')
    loading.classList.remove('hidden')

    const formData = new FormData(form)
    fetch(form.getAttribute('action'), {
      method: form.getAttribute('method'),
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        loading.classList.add('hidden')
        message.innerHTML = data

        if (data.includes('موفق') || data.includes('Success')) {
          message.style.color = 'green'
        } else {
          message.style.color = 'red'
        }

        form
          .querySelectorAll('textarea, input')
          .forEach((el) => (el.value = ''))
      })
      .catch((err) => {
        loading.classList.add('hidden')
        message.innerHTML = 'خطایی رخ داد، دوباره تلاش کنید.'
        message.style.color = 'red'
      })
  })
})

function refresh_captcha(element, event) {
  const form = element.closest('form')
  const captchaContainer = form.querySelector('.load-captcha')

  fetch('/Client_Captcha.bc')
    .then((response) => response.text())
    .then((data) => {
      captchaContainer.innerHTML = data
    })
}

//--------------contact-form-------------
const OK_COLOR = 'rgb(20 170 20)'
const ERR_COLOR = 'rgb(220 38 38)'

function makeFormHandlers({
  rootId,
  uploadSource,
  captchaSource,
  placeholders,
}) {
  const $root = () => document.getElementById(rootId)

  function uploadDocument(args) {
    try {
      const root = $root()
      if (!root) return
      const loading = root.querySelector('.Loading_Form')
      if (loading) loading.style.display = 'block'

      const captcha =
        root.querySelector('#captchaContainer input[name="captcha"]')?.value ||
        ''
      const captchaid =
        root.querySelector('#captchaContainer input[name="captchaid"]')
          ?.value || ''
      const stringJson = JSON.stringify(args.source?.rows?.[0] || {})

      $bc.setSource(uploadSource, {
        value: stringJson,
        captcha,
        captchaid,
        run: true,
      })
    } catch (e) {
      console.error('uploadDocument error:', e)
    }
  }

  function refreshCaptcha() {
    $bc.setSource(captchaSource, true)
  }

  async function onProcessed(args) {
    try {
      const root = $root()
      if (!root) return

      const loading = root.querySelector('.Loading_Form')
      const msg = root.querySelector('.message-api')

      const response = args.response
      const json = await response.json()
      const errorid = json.errorid

      if (loading) loading.style.display = 'none'

      if (errorid === 6) {
        if (msg) {
          msg.textContent = 'درخواست شما با موفقیت ثبت شد.'
          msg.style.color = OK_COLOR
        }
      } else {
        refreshCaptcha()
        setTimeout(() => {
          if (loading) loading.style.display = 'none'
          if (msg) {
            msg.textContent = 'خطایی رخ داده، لطفاً مجدداً اقدام کنید.'
            msg.style.color = ERR_COLOR
          }
        }, 500)
      }
    } catch (e) {
      console.error('onProcessed error:', e)
    }
  }

  function renderPlaceholders() {
    try {
      const root = $root()
      if (!root || !placeholders) return
      placeholders.forEach(({ selector, placeholder }) => {
        root.querySelectorAll(selector).forEach((el) => {
          el.setAttribute('placeholder', placeholder)
        })
      })
    } catch (e) {
      console.error('renderPlaceholders error:', e)
    }
  }

  return { uploadDocument, refreshCaptcha, onProcessed, renderPlaceholders }
}

const contactForm = makeFormHandlers({
  rootId: 'contact-form-resize',
  uploadSource: 'cms.uploadContact',
  captchaSource: 'captcha.refreshContact',
  placeholders: [
    {
      selector: '.contact-form-username input[data-bc-text-input]',
      placeholder: 'نام و نام خانوادگی',
    },
    {
      selector: '.contact-form-email input[data-bc-text-input]',
      placeholder: 'ایمیل خود را وارد کنید',
    },
  ],
})

window.uploadDocumentContact = contactForm.uploadDocument
window.refreshCaptchaContact = contactForm.refreshCaptcha
window.OnProcessedEditObjectContact = contactForm.onProcessed
window.RenderFormContact = contactForm.renderPlaceholders

const footerForm = makeFormHandlers({
  rootId: 'footer-form-resize',
  uploadSource: 'cms.uploadFooter',
  captchaSource: 'captcha.refreshFooter',
  placeholders: [
    {
      selector: '.footer-form-email input[data-bc-text-input]',
      placeholder: 'ایمیل خود را وارد کنید',
    },
  ],
})

window.uploadDocumentFooter = footerForm.uploadDocument
window.refreshCaptchaFooter = footerForm.refreshCaptcha
window.OnProcessedEditObjectFooter = footerForm.onProcessed
window.RenderFormFooter = footerForm.renderPlaceholders

// dont repeat breadcrumb
document.addEventListener('DOMContentLoaded', function () {
  const breadcrumbContainer = document.querySelector('.breadcrumb')
  if (!breadcrumbContainer) return

  const items = breadcrumbContainer.querySelectorAll('li')
  if (!items || items.length === 0) return

  const uniqueLinks = new Map()

  items.forEach((li) => {
    if (!li) return

    const link = li.querySelector('a')
    if (!link) return

    const text = link.textContent.trim()
    if (!text) return

    if (!uniqueLinks.has(text)) {
      uniqueLinks.set(text, li)
    } else {
      li.remove()
    }
  })
})

//-----------swiper--------------
if (document.querySelector('.swiper-busy-destination')) {
  var swiperBusyDestination = new Swiper('.swiper-busy-destination', {
    slidesPerView: 'auto',
    speed: 400,
    centeredSlides: false,
    spaceBetween: 8,
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  })
}
if (document.querySelector('.swiper-popular-destination')) {
  var swiperPopularDestination = new Swiper('.swiper-popular-destination', {
    slidesPerView: 1.3,
    speed: 400,
    centeredSlides: false,
    spaceBetween: 12,
    grabCursor: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 12,
      },
    },
  })
}
if (document.querySelector('.swiper-popular-tours')) {
  var swiperPopularTours = new Swiper('.swiper-popular-tours', {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 12,
      },
    },
  })
}
if (document.querySelector('.swiper-popular-hotels')) {
  var swiperPopularHotels = new Swiper('.swiper-popular-hotels', {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 24,
      },
    },
  })
}
if (document.querySelector('.swiper-news')) {
  var swiperNews = new Swiper('.swiper-news', {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 0,
      },
    },
  })
}
if (document.querySelector('.swiper-visa')) {
  var swiperVisaMobile = new Swiper('.swiper-visa', {
    slidesPerView: 1.17,
    speed: 400,
    spaceBetween: 4,
    grabCursor: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      1024: {
        slidesPerView: 'auto',
        spaceBetween: 0,
      },
    },
  })
}
if (document.querySelector('.swiper-comments')) {
  var swiperComments = new Swiper('.swiper-comments', {
    slidesPerView: 3,
    speed: 400,
    spaceBetween: 12,
    grabCursor: true,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  })
}
