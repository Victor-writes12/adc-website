// ADC Systems , main.js
(function () {
  "use strict";

  // Preloader: dismiss shortly after the DOM is parsed rather than waiting on
  // full asset load (videos can be large), with a hard safety cap either way.
  var pre = document.getElementById("preloader");
  if (pre) {
    var dismissed = false;
    function dismissPreloader() {
      if (dismissed) return;
      dismissed = true;
      pre.classList.add("done");
    }
    // main.js runs as a deferred script, so the DOM is already parsed by now.
    setTimeout(dismissPreloader, 350);
    setTimeout(dismissPreloader, 2000); // hard safety cap
  }

  // Mobile nav
  var burger = document.querySelector(".hamburger");
  var links = document.querySelector(".nav-links");
  var scrim = document.querySelector(".nav-scrim");

  function closeNav() {
    links && links.classList.remove("open");
    scrim && scrim.classList.remove("open");
    burger && burger.classList.remove("is-open");
    burger && burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  function toggleNav() {
    var isOpen = links && links.classList.toggle("open");
    scrim && scrim.classList.toggle("open", !!isOpen);
    burger && burger.classList.toggle("is-open", !!isOpen);
    burger && burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", toggleNav);
  if (scrim) scrim.addEventListener("click", closeNav);
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Lightweight parallax on hero background media (video/poster layers)
  var parallaxEls = document.querySelectorAll(".hero-media");
  if (parallaxEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    function updateParallax() {
      parallaxEls.forEach(function (el) {
        var section = el.closest(".hero, .page-hero");
        if (!section) return;
        var rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        var shift = (progress - 0.5) * 60; // max ~30px travel either way
        el.style.transform = "translateY(" + shift.toFixed(1) + "px) scale(1.08)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // Cookie consent banner
  var COOKIE_KEY = "adc-cookie-consent";
  if (!localStorage.getItem(COOKIE_KEY)) {
    var cookieBar = document.createElement("div");
    cookieBar.className = "cookie-banner";
    cookieBar.setAttribute("role", "dialog");
    cookieBar.setAttribute("aria-label", "Cookie notice");
    cookieBar.innerHTML =
      '<p>We use a few essential cookies to make this site work, and optional ones to understand site traffic. You can accept all cookies or continue with essential only.</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-red" id="cookieAccept">Accept All</button>' +
      '<button type="button" class="btn btn-outline-navy" id="cookieEssential" style="border-color:rgba(255,255,255,.35);color:#fff;">Essential Only</button>' +
      "</div>";
    document.body.appendChild(cookieBar);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cookieBar.classList.add("show");
      });
    });
    function closeCookieBar(value) {
      localStorage.setItem(COOKIE_KEY, value);
      cookieBar.classList.remove("show");
      setTimeout(function () {
        cookieBar.remove();
      }, 400);
    }
    document.getElementById("cookieAccept").addEventListener("click", function () {
      closeCookieBar("all");
    });
    document.getElementById("cookieEssential").addEventListener("click", function () {
      closeCookieBar("essential");
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form (on-screen confirmation; EmailJS and Supabase hook into
  // the same form separately and read its values before this resets it)
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Deferred so emailjs-client.js and supabase-client.js, whose listeners
      // are attached after this one, get to read the field values first.
      setTimeout(function () {
        var note = document.getElementById("form-note");
        if (note) {
          note.textContent = "Thanks, your request has been noted. Our team will reach out shortly.";
          note.style.display = "block";
        }
        form.reset();
      }, 0);
    });
  }
})();
