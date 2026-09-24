(function () {
  "use strict";

  var NAIRA = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function featuresToList(featuresText) {
    if (!featuresText) return [];
    return featuresText.split("\n").map(function (line) { return line.trim(); }).filter(Boolean);
  }

  /* Parses "Label: Value" lines into [{label, value}]. A line with no
     colon is skipped rather than guessed at, so we never invent a spec. */
  function specsToRows(specsText) {
    if (!specsText) return [];
    return specsText.split("\n").map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) {
      var idx = line.indexOf(":");
      if (idx === -1) return null;
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    }).filter(Boolean);
  }

  function renderProduct(product) {
    document.title = product.name + " | ADC Systems";

    var catSlug = product.category || "";
    var subSlug = product.subcategory || "";
    var catName = window.ADC_categoryName ? window.ADC_categoryName(catSlug) : catSlug;
    var subName = subSlug && window.ADC_subcategoryName ? window.ADC_subcategoryName(catSlug, subSlug) : "";

    var crumb = document.getElementById("pd-breadcrumb");
    if (crumb) {
      crumb.innerHTML =
        '<a href="index.html">Home</a> <span>/</span> ' +
        '<a href="shop.html?category=' + encodeURIComponent(catSlug) + '">' + escapeHtml(catName) + '</a>' +
        (subName ? ' <span>/</span> <a href="shop.html?category=' + encodeURIComponent(catSlug) + '&subcategory=' + encodeURIComponent(subSlug) + '">' + escapeHtml(subName) + '</a>' : '') +
        ' <span>/</span> <span>' + escapeHtml(product.name) + '</span>';
    }

    var img = document.getElementById("pd-image");
    if (img) { img.src = product.image_url; img.alt = product.name; }

    var badge = document.getElementById("pd-badge");
    if (badge) {
      if (product.badge) { badge.textContent = product.badge; badge.style.display = ""; }
      else badge.style.display = "none";
    }

    var catLine = document.getElementById("pd-cat-line");
    if (catLine) catLine.textContent = subName ? (catName + " \u2022 " + subName) : catName;

    var titleEl = document.getElementById("pd-title");
    if (titleEl) titleEl.textContent = product.name;

    var priceEl = document.getElementById("pd-price");
    if (priceEl) {
      priceEl.innerHTML = NAIRA.format(product.price) +
        (product.compare_at_price ? '<small>' + NAIRA.format(product.compare_at_price) + '</small>' : '');
    }

    var overview = document.getElementById("pd-overview-text");
    if (overview) overview.textContent = product.short_description || product.description || "";

    var featureItems = featuresToList(product.features);
    var featuresList = document.getElementById("pd-features-list");
    var featuresTabBtn = document.getElementById("pd-tab-features");
    if (featuresList) {
      if (featureItems.length) {
        featuresList.innerHTML = featureItems.map(function (f) {
          return '<li><i class="fa-solid fa-check" aria-hidden="true"></i> ' + escapeHtml(f) + '</li>';
        }).join("");
      } else {
        featuresList.innerHTML = '<li class="pd-empty">Key features for this product have not been added yet.</li>';
      }
    }

    var specRows = specsToRows(product.specifications);
    var specsTable = document.getElementById("pd-specs-table");
    if (specsTable) {
      if (specRows.length) {
        specsTable.innerHTML = specRows.map(function (row) {
          return '<tr><th>' + escapeHtml(row.label) + '</th><td>' + escapeHtml(row.value) + '</td></tr>';
        }).join("");
      } else {
        specsTable.innerHTML = '<tr><td colspan="2" class="pd-empty">Specifications for this product have not been added yet.</td></tr>';
      }
    }

    /* If there is no long description beyond the short one, and no
       features/specs, fall back to showing the raw existing
       description in Overview so nothing reads empty for products
       that have not been migrated to the new fields yet. */
    if (overview && product.description && product.description !== product.short_description && !featureItems.length && !specRows.length) {
      overview.textContent = product.description;
    }

    var addBtn = document.getElementById("pd-add-to-cart");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (window.ADC_cart && window.ADC_cart.addToCart) {
          window.ADC_cart.addToCart(product.id, product.name, product.price, product.image_url);
          window.ADC_cart.openCart();
        }
      });
    }
  }

  function showNotFound() {
    var wrap = document.getElementById("pd-layout");
    if (wrap) wrap.innerHTML = '<p class="form-note">This product could not be found. <a href="shop.html">Return to the shop</a>.</p>';
  }

  function loadProduct() {
    var id = qs("id");
    if (!id || !window.supabase || !window.ADC_SUPABASE_URL || !window.ADC_SUPABASE_ANON_KEY) {
      showNotFound();
      return;
    }
    var client = window.supabase.createClient(window.ADC_SUPABASE_URL, window.ADC_SUPABASE_ANON_KEY);
    client.from("products")
      .select("id, name, category, subcategory, description, short_description, features, specifications, price, compare_at_price, image_url, badge")
      .eq("id", id).eq("is_active", true).single()
      .then(function (result) {
        if (result.error || !result.data) { showNotFound(); return; }
        renderProduct(result.data);
      })
      .catch(function () { showNotFound(); });
  }

  /* ---------- Desktop tabs ---------- */
  function wireTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".pd-tab"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".pd-panel"));
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-target");
        tabs.forEach(function (t) { t.classList.toggle("active", t === tab); t.setAttribute("aria-selected", t === tab ? "true" : "false"); });
        panels.forEach(function (p) { p.classList.toggle("active", p.id === target); });
      });
    });
  }

  /* ---------- Mobile swipe (native scroll-snap, no library) ---------- */
  function wireSwipe() {
    var track = document.getElementById("pd-swipe-track");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".pd-dot"));
    if (!track || !dots.length) return;

    function syncDots() {
      var slideWidth = track.clientWidth;
      if (!slideWidth) return;
      var index = Math.round(track.scrollLeft / slideWidth);
      dots.forEach(function (dot, i) { dot.classList.toggle("active", i === index); });
    }

    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(syncDots);
    }, { passive: true });

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        track.scrollTo({ left: track.clientWidth * i, behavior: "smooth" });
      });
    });

    syncDots();
  }

  function init() {
    wireTabs();
    wireSwipe();
    loadProduct();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
