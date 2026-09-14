(function () {
  "use strict";

  var CART_KEY = "adc-cart";
  var WHATSAPP_NUMBER = "2348163614795";
  var NAIRA = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
    renderCartDrawer();
    if (document.getElementById("checkout-items")) renderCheckoutSummary();
  }
  function addToCart(id, name, price, img) {
    var cart = readCart();
    if (cart[id]) cart[id].qty += 1;
    else cart[id] = { qty: 1, name: name, price: price, img: img };
    writeCart(cart);
  }
  function setQty(id, qty) {
    var cart = readCart();
    if (!cart[id]) return;
    if (qty <= 0) delete cart[id];
    else cart[id].qty = qty;
    writeCart(cart);
  }
  function cartEntries() {
    var cart = readCart();
    return Object.keys(cart).map(function (id) {
      return { id: id, item: cart[id] };
    });
  }
  function cartCount() {
    return cartEntries().reduce(function (sum, e) { return sum + e.item.qty; }, 0);
  }
  function cartSubtotal() {
    return cartEntries().reduce(function (sum, e) { return sum + e.item.qty * e.item.price; }, 0);
  }

  function updateCartBadge() {
    var badge = document.getElementById("cart-count");
    if (!badge) return;
    var count = cartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  function renderCartDrawer() {
    var itemsWrap = document.getElementById("cart-items");
    var footer = document.getElementById("cart-footer");
    if (!itemsWrap) return;

    var entries = cartEntries();

    if (entries.length === 0) {
      itemsWrap.innerHTML =
        '<div class="cart-empty" id="cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2.4l2.7 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>' +
        "<p>Your cart is empty.</p>" +
        '<a href="shop.html" class="btn btn-outline">Browse The Shop</a>' +
        "</div>";
      if (footer) footer.style.display = "none";
      return;
    }

    if (footer) footer.style.display = "block";

    itemsWrap.innerHTML = entries
      .map(function (e) {
        var item = e.item;
        return (
          '<div class="cart-line">' +
          '<img src="' + item.img + '" alt="' + item.name + '">' +
          '<div class="cart-line-info">' +
          "<h4>" + item.name + "</h4>" +
          '<span class="cart-line-price">' + NAIRA.format(item.price) + " each</span>" +
          '<div class="cart-qty">' +
          '<button type="button" data-action="dec" data-id="' + e.id + '" aria-label="Decrease quantity">-</button>' +
          "<span>" + item.qty + "</span>" +
          '<button type="button" data-action="inc" data-id="' + e.id + '" aria-label="Increase quantity">+</button>' +
          '<button type="button" class="cart-line-remove" data-action="remove" data-id="' + e.id + '">Remove</button>' +
          "</div></div></div>"
        );
      })
      .join("");

    var subtotalEl = document.getElementById("cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = NAIRA.format(cartSubtotal());
  }

  function openCart() {
    var drawer = document.getElementById("cart-drawer");
    var scrim = document.getElementById("cart-scrim");
    if (drawer) drawer.classList.add("open");
    if (scrim) scrim.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    var drawer = document.getElementById("cart-drawer");
    var scrim = document.getElementById("cart-scrim");
    if (drawer) drawer.classList.remove("open");
    if (scrim) scrim.classList.remove("open");
    document.body.style.overflow = "";
  }

  function wireShopPage() {
    var grid = document.getElementById("product-grid");
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));
    var searchInput = document.getElementById("shop-search");
    var sortSelect = document.getElementById("shop-sort");
    var catButtons = Array.prototype.slice.call(document.querySelectorAll(".shop-cat-btn"));
    var activeCat = "all";
    var categoryLabels = {
      cctv: "CCTV & Surveillance",
      solar: "Solar Power",
      inverter: "Inverter & Backup",
      smart: "Smart Home",
    };

    function escapeHtml(value) {
      return String(value == null ? "" : value).replace(/[&<>'"]/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
      });
    }

    function renderProducts(products) {
      grid.innerHTML = products.map(function (product) {
        var badge = product.badge
          ? '<span class="product-badge' + (product.badge === "New" ? " outline" : "") + '">' + escapeHtml(product.badge) + "</span>"
          : "";
        var comparePrice = product.compare_at_price
          ? "<small>" + NAIRA.format(product.compare_at_price) + "</small>"
          : "";
        return (
          '<div class="product-card" data-cat="' + escapeHtml(product.category) + '" data-name="' + escapeHtml(product.name) +
          '" data-search="' + escapeHtml(product.search_terms || product.name) + '" data-price="' + product.price + '">' +
          '<div class="product-media">' + badge + '<img src="' + escapeHtml(product.image_url) + '" alt="' + escapeHtml(product.name) + '" loading="lazy"></div>' +
          '<div class="product-body"><div class="product-cat">' + escapeHtml(categoryLabels[product.category] || product.category) + '</div>' +
          '<h3>' + escapeHtml(product.name) + '</h3><p>' + escapeHtml(product.description) + '</p>' +
          '<div class="product-footer"><div class="product-price">' + NAIRA.format(product.price) + comparePrice + '</div>' +
          '<button type="button" class="add-to-cart" data-id="' + escapeHtml(product.id) + '" data-name="' + escapeHtml(product.name) +
          '" data-price="' + product.price + '" data-img="' + escapeHtml(product.image_url) + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.4"/><circle cx="18" cy="21" r="1.4"/><path d="M2.5 3h2.4l2.7 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21.5 7H6"/></svg> Add</button>' +
          '</div></div></div>'
        );
      }).join("");
      cards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));
      catButtons.forEach(function (button) {
        var category = button.getAttribute("data-cat");
        if (category === "all") {
          button.innerHTML = "All Products <span class=\"count\">(" + products.length + ")</span>";
        } else {
          var count = products.filter(function (product) { return product.category === category; }).length;
          button.innerHTML = button.textContent.replace(/\s*\(\d+\)/, "") + " <span class=\"count\">(" + count + ")</span>";
        }
      });
      applyFilters();
    }

    function loadProducts() {
      if (!window.supabase || !window.ADC_SUPABASE_URL || !window.ADC_SUPABASE_ANON_KEY) return;
      var client = window.supabase.createClient(window.ADC_SUPABASE_URL, window.ADC_SUPABASE_ANON_KEY);
      client.from("products").select("id, name, category, description, search_terms, price, compare_at_price, image_url, badge")
        .eq("is_active", true).order("created_at", { ascending: true })
        .then(function (result) {
          if (result.error || !result.data || result.data.length === 0) return;
          renderProducts(result.data);
        })
        .catch(function (error) {
          console.error("Product loading failed:", error);
        });
    }

    function applyFilters() {
      var q = (searchInput ? searchInput.value : "").trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var matchesCat = activeCat === "all" || card.getAttribute("data-cat") === activeCat;
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var matchesSearch = !q || haystack.indexOf(q) !== -1;
        var show = matchesCat && matchesSearch;
        card.style.display = show ? "" : "none";
        if (show) visibleCount++;
      });

      var emptyState = document.getElementById("shop-empty");
      if (emptyState) emptyState.style.display = visibleCount === 0 ? "block" : "none";

      applySort();
    }

    function applySort() {
      if (!sortSelect) return;
      var value = sortSelect.value;
      if (value === "default") return;
      var visibleCards = cards.filter(function (c) { return c.style.display !== "none"; });
      visibleCards.sort(function (a, b) {
        var priceA = parseInt(a.getAttribute("data-price"), 10) || 0;
        var priceB = parseInt(b.getAttribute("data-price"), 10) || 0;
        return value === "price-asc" ? priceA - priceB : priceB - priceA;
      });
      visibleCards.forEach(function (c) { grid.appendChild(c); });
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (sortSelect) sortSelect.addEventListener("change", applyFilters);
    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        catButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeCat = btn.getAttribute("data-cat");
        applyFilters();
      });
    });

    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      addToCart(
        btn.getAttribute("data-id"),
        btn.getAttribute("data-name"),
        parseInt(btn.getAttribute("data-price"), 10),
        btn.getAttribute("data-img")
      );
      btn.classList.add("in-cart");
      var original = btn.innerHTML;
      btn.innerHTML = "Added";
      setTimeout(function () {
        btn.innerHTML = original;
        btn.classList.remove("in-cart");
      }, 900);
      openCart();
    });

    loadProducts();
  }

  function renderCheckoutSummary() {
    var wrap = document.getElementById("checkout-items");
    if (!wrap) return;
    var entries = cartEntries();

    if (entries.length === 0) {
      wrap.innerHTML = '<p class="form-note">Your cart is empty. <a href="shop.html">Browse the shop</a> to add items.</p>';
    } else {
      wrap.innerHTML = entries
        .map(function (e) {
          return (
            '<div class="checkout-line">' +
            "<span>" + e.item.name + ' <span class="qty">x' + e.item.qty + "</span></span>" +
            "<span>" + NAIRA.format(e.item.qty * e.item.price) + "</span>" +
            "</div>"
          );
        });
    }
    var subtotal = cartSubtotal();
    var total = subtotal;

    setText("checkout-subtotal-value", NAIRA.format(subtotal));
    setText("checkout-total", NAIRA.format(total));
  }
  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function isPaystackConfigured() {
    return (
      window.ADC_PAYSTACK_PUBLIC_KEY &&
      window.ADC_PAYSTACK_PUBLIC_KEY.indexOf("PAYSTACK_PUBLIC_KEY") === -1 &&
      typeof window.PaystackPop !== "undefined"
    );
  }

  function saveOrderToSupabase(order) {
    if (!window.supabase || !window.ADC_SUPABASE_URL || window.ADC_SUPABASE_URL.indexOf("YOUR-PROJECT") !== -1) {
      return Promise.reject(new Error("Supabase is not configured"));
    }
    try {
      var client = window.supabase.createClient(window.ADC_SUPABASE_URL, window.ADC_SUPABASE_ANON_KEY);
      return client.from("orders").insert(order).then(function (result) {
        if (result.error) throw result.error;
        return result;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  function verifyPaidOrder(reference, order) {
    if (!window.supabase || !window.ADC_SUPABASE_URL || !window.ADC_SUPABASE_ANON_KEY) {
      return Promise.reject(new Error("Supabase is not configured"));
    }
    var client = window.supabase.createClient(window.ADC_SUPABASE_URL, window.ADC_SUPABASE_ANON_KEY);
    return client.functions.invoke("verify-paystack", {
      body: { reference: reference, order: order },
    }).then(function (result) {
      if (result.error || !result.data || result.data.ok !== true) {
        throw new Error("Payment could not be verified");
      }
      return result.data;
    });
  }

  function wireCheckoutPage() {
    var form = document.getElementById("checkout-form");
    if (!form) return;

    renderCheckoutSummary();
     var addressField = document.getElementById("co-address-field");
    var pickupNote = document.getElementById("co-pickup-note");
    var addressInput = document.getElementById("co-address");
    var deliveryRadios = document.querySelectorAll('input[name="delivery_method"]');

    function updateDeliveryUI() {
      var checked = document.querySelector('input[name="delivery_method"]:checked');
      var isPickup = checked && checked.value === "Pickup";
      if (addressField) addressField.style.display = isPickup ? "none" : "";
      if (pickupNote) pickupNote.style.display = isPickup ? "" : "none";
      if (addressInput) addressInput.required = !isPickup;

      var deliveryRow = document.getElementById("checkout-delivery-row");
      var deliveryHint = document.getElementById("checkout-delivery-hint");
      if (deliveryRow) deliveryRow.style.display = isPickup ? "none" : "";
      if (deliveryHint) deliveryHint.style.display = isPickup ? "none" : "";

      updatePaystackNote();
    }

    function updatePaystackNote() {
      var note = document.getElementById("co-paystack-delivery-note");
      var checked = document.querySelector('input[name="delivery_method"]:checked');
      var isPickup = checked && checked.value === "Pickup";
      var paymentSelect = document.getElementById("co-payment");
      var isPaystack = paymentSelect && paymentSelect.value === "Pay Now, Card Or Transfer (Paystack)";
      if (note) note.style.display = (isPaystack && !isPickup) ? "" : "none";
    }

    deliveryRadios.forEach(function (radio) {
      radio.addEventListener("change", updateDeliveryUI);
    });
    var paymentSelect = document.getElementById("co-payment");
    if (paymentSelect) paymentSelect.addEventListener("change", updatePaystackNote);
    updateDeliveryUI();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var entries = cartEntries();
      if (entries.length === 0) {
        alert("Your cart is empty. Add a product before checking out.");
        return;
      }

      var fullName = document.getElementById("co-name").value;
      var phone = document.getElementById("co-phone").value;
      var email = document.getElementById("co-email").value;
      var deliveryMethodEl = document.querySelector('input[name="delivery_method"]:checked');
      var deliveryMethod = deliveryMethodEl ? deliveryMethodEl.value : "Delivery";
      var address = deliveryMethod === "Pickup"
        ? "Self-pickup (location to be arranged by phone)"
        : document.getElementById("co-address").value;
      var notes = document.getElementById("co-notes").value;
      var paymentMethod = document.getElementById("co-payment").value;
      var subtotal = cartSubtotal();
      var total = subtotal;
      var itemsForRecord = entries.map(function (e) {
        return { name: e.item.name, qty: e.item.qty, unit_price: e.item.price };
      });

      function placeOrder(status, reference) {
        var order = {
          full_name: fullName,
          phone: phone,
          email: email,
          address: address + (notes ? ". Notes: " + notes : ""),
          items: itemsForRecord,
          total: total,
          payment_reference: reference || null,
          status: status,
          payment_method: paymentMethod,
          delivery_method: deliveryMethod,
        };
        saveOrderToSupabase(order).then(function () {
          if (!window.ADC_sendOrderEmails) return;
          return window.ADC_sendOrderEmails(order).catch(function (error) {
            console.error("Order email notification failed:", error);
          });
        }).then(function () {
          writeCart({});
          showCheckoutStatus(status === "paid" ? "paid" : "placed", reference);
        }).catch(function (error) {
          console.error("Order submission failed:", error);
          var statusMessage = document.getElementById("checkout-status");
          if (statusMessage) {
            statusMessage.textContent = "We could not save your order. Please check the order table and try again.";
            statusMessage.style.color = "#9b1c1c";
          }
        });
      }

      if (paymentMethod === "Pay Now, Card Or Transfer (Paystack)") {
        if (!isPaystackConfigured()) {
          alert("Online payment is not set up yet. Please choose Pay On Delivery or Bank Transfer instead.");
          return;
        }
        var handler = window.PaystackPop.setup({
          key: window.ADC_PAYSTACK_PUBLIC_KEY,
          email: email,
          amount: Math.round(total * 100),
          currency: "NGN",
          channels: ["card", "bank_transfer"],
          metadata: {
            custom_fields: [
              { display_name: "Full Name", variable_name: "full_name", value: fullName },
              { display_name: "Phone", variable_name: "phone", value: phone },
            ],
          },
          callback: function (response) {
            if (!response || response.status !== "success" || !response.reference) {
              alert("Payment could not be confirmed. Please contact us if your account was charged.");
              return;
            }
            var paidOrder = {
              full_name: fullName,
              phone: phone,
              email: email,
              address: address,
              items: itemsForRecord,
              total: total,
              notes: notes,
              payment_method: paymentMethod,
              payment_reference: response.reference,
              status: "paid",
              delivery_method: deliveryMethod,
            };
            verifyPaidOrder(response.reference, paidOrder).then(function () {
              if (!window.ADC_sendOrderEmails) return;
              return window.ADC_sendOrderEmails(paidOrder).catch(function (error) {
                console.error("Order email notification failed:", error);
              });
            }).then(function () {
              writeCart({});
              window.location.href =
                "payment-success.html?status=success&reference=" +
                encodeURIComponent(response.reference);
            }).catch(function () {
              alert("Payment was received, but we could not verify it yet. Please contact us with reference " + response.reference + ".");
            });
          },
          onClose: function () {
          },
        });
        handler.openIframe();
      } else {
        placeOrder("pending", null);
      }
    });
  }

  function showCheckoutStatus(kind, reference) {
    var status = document.getElementById("checkout-status");
    var form = document.getElementById("checkout-form");
    if (!status) return;
    if (kind === "paid") {
      status.innerHTML =
        "Payment received, thank you. Your order reference is <strong>" + reference + "</strong>. " +
        "Our team will call to confirm delivery.";
    } else {
      status.textContent = "Order placed, thank you. Our team will call to confirm payment and delivery.";
    }
    status.style.color = "#0F2350";
    status.style.fontWeight = "600";
    if (form) {
      Array.prototype.forEach.call(form.querySelectorAll("input, textarea, select, button"), function (el) {
        el.disabled = true;
      });
    }
    window.scrollTo({ top: form.offsetTop - 100, behavior: "smooth" });
  }

  function wireShared() {
    var pre = document.getElementById("preloader");
    if (pre) {
      setTimeout(function () { pre.classList.add("done"); }, 350);
      setTimeout(function () { pre.classList.add("done"); }, 2000);
    }

    var hamburger = document.getElementById("hamburger");
    var navMenu = document.getElementById("nav-menu");
    var navScrim = document.getElementById("nav-scrim");
    function toggleNav() {
      if (navMenu) navMenu.classList.toggle("open");
      if (navScrim) navScrim.classList.toggle("open");
    }
    if (hamburger) hamburger.addEventListener("click", toggleNav);
    if (navScrim) navScrim.addEventListener("click", toggleNav);

    var cartToggle = document.getElementById("cart-toggle");
    var cartClose = document.getElementById("cart-close");
    var cartScrim = document.getElementById("cart-scrim");
    if (cartToggle) cartToggle.addEventListener("click", openCart);
    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartScrim) cartScrim.addEventListener("click", closeCart);

    document.addEventListener("click", function (e) {
      var qtyBtn = e.target.closest("[data-action='inc'], [data-action='dec'], [data-action='remove']");
      if (!qtyBtn) return;
      var id = qtyBtn.getAttribute("data-id");
      var action = qtyBtn.getAttribute("data-action");
      var cart = readCart();
      if (!cart[id]) return;
      if (action === "remove") setQty(id, 0);
      else setQty(id, cart[id].qty + (action === "inc" ? 1 : -1));
    });

    var backToTop = document.getElementById("back-to-top");
    if (backToTop) {
      window.addEventListener("scroll", function () {
        backToTop.classList.toggle("show", window.scrollY > 500);
      });
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var yearEl = document.querySelector(".year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    updateCartBadge();
    renderCartDrawer();
  }

  function init() {
    wireShared();
    wireShopPage();
    wireCheckoutPage();
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
