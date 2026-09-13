// ADC Training Portal — login page logic
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (!window.ADCPortal) return;

    // If already signed in, skip straight to the dashboard flow
    window.ADCPortal.getSession().then(function (session) {
      if (session) window.location.href = "complete-profile.html";
    });

    var msg = document.getElementById("formMsg");
    function showMsg(text, type) {
      msg.textContent = text;
      msg.className = "form-msg is-visible " + type;
    }

    document.getElementById("passwordForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("passwordEmail").value.trim();
      var password = document.getElementById("password").value;
      if (!window.ADCPortal.isGmail(email) || password.length < 8) {
        showMsg("Enter your Gmail address and a password of at least 8 characters.", "error");
        return;
      }
      window.ADCPortal.signInWithPassword(email, password).then(function (res) {
        if (res.error) throw res.error;
        window.location.href = "dashboard.html";
      }).catch(function (err) {
        showMsg(err.message || "Could not sign in with your password.", "error");
      });
    });

    document.getElementById("googleSignIn").addEventListener("click", function () {
      window.ADCPortal.signInWithGoogle("complete-profile.html").catch(function (err) {
        showMsg(err.message || "Could not start Google sign-in.", "error");
      });
    });

    document.getElementById("magicLinkForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      if (!window.ADCPortal.isGmail(email)) {
        showMsg("Please enter a valid Gmail address.", "error");
        return;
      }
      window.ADCPortal.sendMagicLink(email, "set-password.html")
        .then(function (res) {
          if (res.error) throw res.error;
          showMsg("Check your inbox! We sent a sign-in link to " + email + ".", "success");
        })
        .catch(function (err) {
          showMsg(err.message || "Could not send the sign-in link.", "error");
        });
    });
  });
})();
