// ADC Systems, Supabase integration
//
// 1. Create a project at https://supabase.com
// 2. Run supabase/schema.sql in your project's SQL editor
// 3. Copy your Project URL and anon public key from Settings > API
// 4. Paste them below in place of the placeholder values
//
// The anon key is safe to expose in this public file. It only grants the
// access described by the Row Level Security policies in schema.sql
// (read active banners/promotions, insert a contact message).

window.ADC_SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
window.ADC_SUPABASE_ANON_KEY = "YOUR-PUBLIC-ANON-KEY";

(function () {
  "use strict";

  var isConfigured =
    window.supabase &&
    window.ADC_SUPABASE_URL &&
    window.ADC_SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 &&
    window.ADC_SUPABASE_ANON_KEY &&
    window.ADC_SUPABASE_ANON_KEY.indexOf("YOUR-PUBLIC-ANON-KEY") === -1;

  if (!isConfigured) return;

  var client = window.supabase.createClient(
    window.ADC_SUPABASE_URL,
    window.ADC_SUPABASE_ANON_KEY
  );

  // Show the latest active site banner, if one exists and hasn't been dismissed this session
  function loadBanner() {
    var nowIso = new Date().toISOString();
    client
      .from("banners")
      .select("id, message, link_url, link_text")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .or("ends_at.is.null,ends_at.gte." + nowIso)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.length) return;
        var b = res.data[0];
        var dismissedKey = "adc-banner-dismissed-" + b.id;
        if (sessionStorage.getItem(dismissedKey)) return;

        var bar = document.createElement("div");
        bar.className = "site-banner";
        var linkHtml = b.link_url
          ? ' <a href="' + b.link_url + '">' + (b.link_text || "Learn more") + "</a>"
          : "";
        bar.innerHTML =
          '<div class="wrap site-banner-inner">' +
          "<span>" + b.message + linkHtml + "</span>" +
          '<button type="button" class="site-banner-close" aria-label="Dismiss">&times;</button>' +
          "</div>";
        document.body.insertBefore(bar, document.body.firstChild);
        bar.querySelector(".site-banner-close").addEventListener("click", function () {
          bar.remove();
          sessionStorage.setItem(dismissedKey, "1");
        });
      })
      .catch(function () {
        /* fail silently, site works fine without a banner */
      });
  }

  // Save contact form submissions into the messages table
  function wireContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function () {
      client
        .from("messages")
        .insert({
          full_name: form.fname.value,
          phone: form.fphone.value,
          email: form.femail.value || null,
          service: form.fservice.value,
          property_location: form.faddress.value || null,
          body: form.fmessage.value || null,
        })
        .then(function () {})
        .catch(function () {
          /* main.js still shows the on-screen confirmation either way */
        });
    });
  }

  loadBanner();
  wireContactForm();
})();
