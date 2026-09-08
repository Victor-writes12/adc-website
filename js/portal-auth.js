// ADC Systems Training Portal — shared auth helpers
//
// Depends on:
//  - window.ADC_SUPABASE_URL / window.ADC_SUPABASE_ANON_KEY (already set in js/supabase-client.js)
//  - the @supabase/supabase-js CDN script tag
//
// This file does NOT modify js/supabase-client.js. It creates its own
// Supabase client using the same project URL/key so nothing you already
// have needs to change.

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  if (!window.ADC_SUPABASE_URL || !window.supabase) {
    console.error("ADC Portal: Supabase is not configured. Check js/supabase-client.js and the CDN script tag.");
    return;
  }

  var portalClient = window.supabase.createClient(
    window.ADC_SUPABASE_URL,
    window.ADC_SUPABASE_ANON_KEY
  );

  window.ADCPortal = {
    client: portalClient,

    // Returns the current session (or null)
    getSession: function () {
      return portalClient.auth.getSession().then(function (res) {
        return (res && res.data && res.data.session) || null;
      });
    },

    // Sign in / sign up with Google
    signInWithGoogle: function (redirectPath) {
      var redirectTo = window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + redirectPath;
      return portalClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo }
      });
    },

    // Sign in / sign up with a magic link sent to a Gmail address
    sendMagicLink: function (email, redirectPath) {
      var redirectTo = window.location.origin + window.location.pathname.replace(/[^/]+$/, "") + redirectPath;
      return portalClient.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: redirectTo }
      });
    },

    signOut: function () {
      return portalClient.auth.signOut();
    },

    // Fetch the student profile row for the logged-in user (or null)
    getStudentProfile: function (authUserId) {
      return portalClient
        .from("students")
        .select("*")
        .eq("auth_user_id", authUserId)
        .maybeSingle()
        .then(function (res) {
          if (res.error) throw res.error;
          return res.data;
        });
    },

    // Require a logged-in session. Redirects to login.html if missing.
    // Returns a promise that resolves with the session.
    requireSession: function () {
      return this.getSession().then(function (session) {
        if (!session) {
          window.location.href = "login.html";
          return Promise.reject(new Error("no session"));
        }
        return session;
      });
    },

    isGmail: function (email) {
      return /^[^\s@]+@gmail\.com$/i.test(String(email || "").trim());
    }
  };

  ready(function () {
    var yearEls = document.querySelectorAll("#year");
    yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
