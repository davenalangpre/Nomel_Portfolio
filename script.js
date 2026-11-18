/**
 * Personal Portfolio Interactive Controller
 * Handles:
 * 1. Central site configuration (social links & contact details)
 * 2. Responsive mobile navigation drawer
 * 3. Scroll-spy active navigation highlighting
 * 4. Client-side portfolio search with instant jump & highlight
 * 5. Interactive Achievement & Milestone editor (persisted in localStorage)
 * 6. Contact form validation with honest mailto fallback
 */

const PORTFOLIO_CONFIG = {
  recipientEmail: "Nomeldavegeanga@pcb.edu.ph",
  locationText: "Botolan, Zambales, Philippines",
  socialLinks: {
    facebook: {
      url: "https://www.facebook.com/",
      handle: "Nomel Dave Geanga",
    },
    tiktok: {
      url: "https://www.tiktok.com/@azazzeeell",
      handle: "azazzeeell",
    },
    x: {
      url: "https://x.com/Nomel_Dave",
      handle: "@Nomel_Dave",
    },
  },
};

document.addEventListener("DOMContentLoaded", () => {
  applySiteConfiguration();
  initFooterYear();
  initMobileMenu();
  initScrollSpy();
  initPortfolioSearch();
  initAchievementManager();
  initContactForm();
});

/* ==========================================================================
   1. APPLY CONFIGURABLE SOCIAL & CONTACT DETAILS
   ========================================================================== */
function applySiteConfiguration() {
  const emailLink = document.getElementById("ownerEmailLink");
  const locationEl = document.getElementById("ownerLocation");

  if (emailLink && PORTFOLIO_CONFIG.recipientEmail) {
    emailLink.href = `mailto:${PORTFOLIO_CONFIG.recipientEmail}`;
    emailLink.textContent = PORTFOLIO_CONFIG.recipientEmail;
  }

  if (locationEl && PORTFOLIO_CONFIG.locationText) {
    locationEl.textContent = PORTFOLIO_CONFIG.locationText;
  }

  Object.entries(PORTFOLIO_CONFIG.socialLinks).forEach(([platform, data]) => {
    const anchor = document.querySelector(`.social-link[data-social="${platform}"]`);
    if (anchor && data) {
      anchor.href = data.url;
      const handleEl = anchor.querySelector(".social-handle");
      if (handleEl) {
        handleEl.textContent = data.handle;
      }
    }
  });
}

/* ==========================================================================
   2. DYNAMIC COPYRIGHT YEAR
   ========================================================================== */
function initFooterYear() {
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileMenu() {
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!navToggle || !primaryNav) return;

  const setMenuState = (isOpen) => {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    primaryNav.classList.toggle("is-open", isOpen);
  };

  navToggle.addEventListener("click", () => {
    const isCurrentlyOpen = navToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isCurrentlyOpen);
  });

  // Close drawer when any navigation link is clicked
  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  // Close drawer on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
      setMenuState(false);
      navToggle.focus();
    }
  });
}

/* ==========================================================================
   4. SCROLL-SPY ACTIVE NAVIGATION HIGHLIGHTING
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll(".portfolio-section");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length) return;

  const setActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("data-section") === sectionId;
      link.classList.toggle("active", isMatch);
      if (isMatch) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ==========================================================================
   5. FUNCTIONAL PORTFOLIO SEARCH BAR
   ========================================================================== */
function initPortfolioSearch() {
  const searchInput = document.getElementById("portfolioSearch");
  const clearBtn = document.getElementById("clearSearchBtn");
  const dropdown = document.getElementById("searchStatus");

  if (!searchInput || !clearBtn || !dropdown) return;

  const renderResults = (query) => {
    const trimmed = query.trim().toLowerCase();
    clearBtn.hidden = trimmed.length === 0;

    if (!trimmed) {
      dropdown.hidden = true;
      dropdown.innerHTML = "";
      return;
    }

    const searchableElements = Array.from(document.querySelectorAll(".searchable-item"));
    const matches = searchableElements.filter((el) => {
      const title = (el.getAttribute("data-search-title") || "").toLowerCase();
      const text = el.textContent.toLowerCase();
      return title.includes(trimmed) || text.includes(trimmed);
    });

    dropdown.innerHTML = "";

    if (matches.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "search-empty";
      emptyEl.textContent = `No matches found for "${query.trim()}"`;
      dropdown.appendChild(emptyEl);
    } else {
      matches.forEach((matchEl) => {
        const title = matchEl.getAttribute("data-search-title") || "Portfolio Section";
        const cleanText = matchEl.textContent.replace(/\s+/g, " ").trim();

        const itemBtn = document.createElement("button");
        itemBtn.type = "button";
        itemBtn.className = "search-result-item";

        const titleSpan = document.createElement("span");
        titleSpan.className = "search-result-title";
        titleSpan.textContent = title;

        const snippetSpan = document.createElement("span");
        snippetSpan.className = "search-result-snippet";
        snippetSpan.textContent = cleanText;

        itemBtn.append(titleSpan, snippetSpan);

        itemBtn.addEventListener("click", () => {
          dropdown.hidden = true;
          // Close mobile nav if open
          const primaryNav = document.getElementById("primaryNav");
          const navToggle = document.getElementById("navToggle");
          if (primaryNav && primaryNav.classList.contains("is-open")) {
            primaryNav.classList.remove("is-open");
            if (navToggle) navToggle.setAttribute("aria-expanded", "false");
          }

          matchEl.scrollIntoView({ behavior: "smooth", block: "center" });
          matchEl.classList.remove("search-highlight");
          void matchEl.offsetWidth; // trigger reflow to restart animation
          matchEl.classList.add("search-highlight");
        });

        dropdown.appendChild(itemBtn);
      });
    }

    dropdown.hidden = false;
  };

  searchInput.addEventListener("input", (event) => {
    renderResults(event.target.value);
  });

  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) {
      renderResults(searchInput.value);
    }
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderResults("");
    searchInput.focus();
  });

  // Dismiss dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) {
      dropdown.hidden = true;
    }
  });
}

/* ==========================================================================
   6. INTERACTIVE ACHIEVEMENT & MILESTONE MANAGER
   ========================================================================== */
function initAchievementManager() {
  const toggleBtn = document.getElementById("toggleAchievementEditor");
  const editorForm = document.getElementById("achievementEditorPanel");
  const input = document.getElementById("newAchievementInput");
  const list = document.getElementById("achievementList");
  const emptyHint = document.getElementById("achievementEmptyHint");

  if (!toggleBtn || !editorForm || !input || !list || !emptyHint) return;

  const STORAGE_KEY = "ndg_portfolio_achievements_v1";

  const loadSavedItems = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveItems = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fail silently if storage is restricted
    }
  };

  let achievements = loadSavedItems();

  const renderAchievements = () => {
    list.innerHTML = "";
    emptyHint.hidden = achievements.length > 0;

    achievements.forEach((text, index) => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = text;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-item-btn";
      removeBtn.setAttribute("aria-label", `Remove ${text}`);
      removeBtn.innerHTML = "&times;";
      removeBtn.addEventListener("click", () => {
        achievements.splice(index, 1);
        saveItems(achievements);
        renderAchievements();
      });

      li.append(span, removeBtn);
      list.appendChild(li);
    });
  };

  toggleBtn.addEventListener("click", () => {
    const isHidden = editorForm.hidden;
    editorForm.hidden = !isHidden;
    toggleBtn.setAttribute("aria-expanded", String(isHidden));
    if (isHidden) {
      input.focus();
    }
  });

  editorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    achievements.push(value);
    saveItems(achievements);
    input.value = "";
    renderAchievements();
  });

  renderAchievements();
}

/* ==========================================================================
   7. CONTACT FORM VALIDATION & MAILTO FALLBACK
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const nameInput = document.getElementById("senderName");
  const emailInput = document.getElementById("senderEmail");
  const messageInput = document.getElementById("senderMessage");

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const messageError = document.getElementById("messageError");
  const feedbackBox = document.getElementById("formFeedback");

  if (!form || !nameInput || !emailInput || !messageInput || !feedbackBox) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const setFieldError = (inputEl, errorEl, message) => {
    errorEl.textContent = message;
    inputEl.classList.toggle("input-invalid", Boolean(message));
  };

  const validateForm = () => {
    let isValid = true;
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const messageVal = messageInput.value.trim();

    if (nameVal.length < 2) {
      setFieldError(nameInput, nameError, "Please enter your name (at least 2 characters).");
      isValid = false;
    } else {
      setFieldError(nameInput, nameError, "");
    }

    if (!emailPattern.test(emailVal)) {
      setFieldError(emailInput, emailError, "Please enter a valid email address.");
      isValid = false;
    } else {
      setFieldError(emailInput, emailError, "");
    }

    if (messageVal.length < 10) {
      setFieldError(messageInput, messageError, "Please write a message of at least 10 characters.");
      isValid = false;
    } else {
      setFieldError(messageInput, messageError, "");
    }

    return { isValid, nameVal, emailVal, messageVal };
  };

  // Real-time validation clearing on input
  [nameInput, emailInput, messageInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.classList.contains("input-invalid")) {
        validateForm();
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const { isValid, nameVal, emailVal, messageVal } = validateForm();

    if (!isValid) {
      feedbackBox.hidden = false;
      feedbackBox.className = "form-feedback feedback-error";
      feedbackBox.textContent = "Please correct the highlighted fields before continuing.";
      return;
    }

    // Construct an honest mailto fallback because no server-side mail endpoint is attached
    const subject = encodeURIComponent(`Portfolio Inquiry from ${nameVal}`);
    const body = encodeURIComponent(
      `Name: ${nameVal}\nReply-To: ${emailVal}\n\nMessage:\n${messageVal}`
    );
    const mailtoHref = `mailto:${PORTFOLIO_CONFIG.recipientEmail}?subject=${subject}&body=${body}`;

    feedbackBox.hidden = false;
    feedbackBox.className = "form-feedback feedback-info";
    feedbackBox.innerHTML = `
      <strong>Validation passed!</strong> Because this static site has no backend email server configured yet, click below to open your email app with your message pre-filled:<br />
      <a href="${mailtoHref}" class="mailto-action-link">Open Email Client to Send &rarr;</a>
    `;
  });
}