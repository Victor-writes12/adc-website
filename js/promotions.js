
(function () {
  "use strict";

  if (!window.ADC_SUPABASE_URL || !window.supabase) return;

  var client = window.supabase.createClient(
    window.ADC_SUPABASE_URL,
    window.ADC_SUPABASE_ANON_KEY
  );

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function injectStyles() {
    if (document.getElementById("adc-promo-styles")) return;
    var style = document.createElement("style");
    style.id = "adc-promo-styles";
    style.textContent = [
      ".adc-promo-overlay{position:fixed;inset:0;background:rgba(97, 99, 104, 0.6);display:flex;align-items:center;justify-content:center;padding:1rem;z-index:9999;opacity:0;transition:opacity .25s ease;}",
      ".adc-promo-overlay.is-visible{opacity:1;}",
      ".adc-promo-card{background:var(--white,#fff);border-radius:var(--radius-l,18px);max-width:460px;width:100%;display:grid;grid-template-columns:1.15fr 1fr;overflow:hidden;box-shadow:0 30px 60px -20px rgba(10,23,48,.5);position:relative;transform:translateY(14px);transition:transform .25s ease;}",
      ".adc-promo-overlay.is-visible .adc-promo-card{transform:translateY(0);}",
      ".adc-promo-body{padding:clamp(1.6rem,4vw,2.4rem);display:flex;flex-direction:column;justify-content:center;gap:.9rem;}",
      ".adc-promo-kicker{color:var(--red-600,#c81e2c);font-family:var(--f-head,inherit);font-weight:700;font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;}",
      ".adc-promo-title{font-family:var(--f-head,inherit);color:var(--navy-950,#0a1730);font-size:1.5rem;line-height:1.25;font-weight:800;margin:0;}",
      ".adc-promo-desc{color:var(--slate,#5b6472);font-size:.95rem;line-height:1.5;margin:0;}",
      ".adc-promo-cta{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;background:var(--red-600,#c81e2c);color:#fff;font-family:var(--f-head,inherit);font-weight:700;font-size:.9rem;padding:.85rem 1.3rem;border-radius:999px;text-decoration:none;margin-top:.4rem;width:fit-content;transition:filter .2s ease;}",
      ".adc-promo-cta:hover{filter:brightness(1.08);}",
      ".adc-promo-image{background:var(--navy-950,#0a1730);position:relative;min-height:180px;}",
      ".adc-promo-image img{width:100%;height:100%;object-fit:cover;display:block;}",
      ".adc-promo-close{position:absolute;top:.9rem;right:.9rem;width:34px;height:34px;border-radius:50%;border:1px solid var(--line,#e4e7ee);background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.1rem;line-height:1;color:var(--navy-900,#132043);z-index:2;}",
      ".adc-promo-close:hover{background:var(--paper-dim,#f2f3f6);}",
      "@media (max-width:640px){.adc-promo-card{grid-template-columns:1fr;}.adc-promo-image{min-height:100px;order:-1;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showModal(promo, dismissedKey) {
    injectStyles();

    var overlay = document.createElement("div");
    overlay.className = "adc-promo-overlay";

    var imageHtml = promo.image_url
      ? '<div class="adc-promo-image"><img src="' + escapeHtml(promo.image_url) + '" alt=""></div>'
      : "";

    var ctaHtml = promo.cta_url
      ? '<a class="adc-promo-cta" href="' + escapeHtml(promo.cta_url) + '">' + escapeHtml(promo.cta_text || "Learn more") + "</a>"
      : "";

    overlay.innerHTML =
      '<div class="adc-promo-card" role="dialog" aria-modal="true">' +
        '<button type="button" class="adc-promo-close" aria-label="Close">&times;</button>' +
        '<div class="adc-promo-body">' +
          '<span class="adc-promo-kicker">ADC Systems</span>' +
          '<h2 class="adc-promo-title">' + escapeHtml(promo.title) + '</h2>' +
          (promo.description ? '<p class="adc-promo-desc">' + escapeHtml(promo.description) + '</p>' : '') +
          ctaHtml +
        '</div>' +
        imageHtml +
      '</div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("is-visible"); });

    function dismiss() {
      overlay.classList.remove("is-visible");
      sessionStorage.setItem(dismissedKey, "1");
      setTimeout(function () { overlay.remove(); }, 250);
    }

    overlay.querySelector(".adc-promo-close").addEventListener("click", dismiss);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) dismiss();
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") { dismiss(); document.removeEventListener("keydown", escHandler); }
    });
  }

  function loadPromotion() {
    var nowIso = new Date().toISOString();
    client
      .from("promotions")
      .select("id, title, description, image_url, cta_text, cta_url, is_active, starts_at, ends_at")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .or("ends_at.is.null,ends_at.gte." + nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.length) return;
        var promo = res.data[0];
        var dismissedKey = "adc-promo-dismissed-" + promo.id;
        if (sessionStorage.getItem(dismissedKey)) return;
        showModal(promo, dismissedKey);
      })
      .catch(function () {
        /* fail silently, site works fine without a promotion */
      });
  }

  ready(function () {
    setTimeout(loadPromotion, 700);
  });
})();