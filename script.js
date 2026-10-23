document.addEventListener("DOMContentLoaded", () => {
  const CONTACT_EMAIL = "veltrixstudio.shop@gmail.com";

  /* ---------- Smooth scrolling for in-page links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (toggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Active nav link ---------- */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    const file = (a.getAttribute("href") || "").split("#")[0].split("/").pop();
    if (file && file === here) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Scroll reveal ---------- */
  const revealItems = document.querySelectorAll(
    ".service-card, .section-heading, .closing-cta, .step-card, .work-card, .discord-band, .price-card, .service-item, .project-card, .faq-item, .contact-card, .contact-form"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((item) => {
      item.classList.add("reveal");
      observer.observe(item);
    });
  }

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        btn.textContent = "Copied ✓";
      } catch (err) {
        btn.textContent = CONTACT_EMAIL;
      }
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  const form = document.querySelector("#contact-form");

  if (form) {
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const type = (data.get("type") || "").toString();
      const budget = (data.get("budget") || "").toString();
      const message = (data.get("message") || "").toString().trim();

      const subject = `New project inquiry${type ? " - " + type : ""} (${name})`;
      const promo = window.VeltrixPromo ? window.VeltrixPromo.summary() : "";
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Project type: ${type || "Not specified"}`,
        `Budget: ${budget || "Not specified"}`,
        promo ? `Promo: ${promo}` : null,
        "",
        "Project details:",
        message,
      ].filter((line) => line !== null).join("\n");

      const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = url;

      if (status) {
        status.textContent = "Opening your email app… If nothing opens, email us directly at " + CONTACT_EMAIL;
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
});
