// ADC Training Portal — complete-profile page logic
(function () {
  "use strict";

  var STATES = [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe",
    "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
    "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
    "Taraba","Yobe","Zamfara"
  ];

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (!window.ADCPortal) return;

    var stateSelect = document.getElementById("state");
    STATES.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      stateSelect.appendChild(opt);
    });

    var msg = document.getElementById("formMsg");
    function showMsg(text, type) {
      msg.textContent = text;
      msg.className = "form-msg is-visible " + type;
    }

    document.getElementById("logoutLink").addEventListener("click", function (e) {
      e.preventDefault();
      window.ADCPortal.signOut().then(function () { window.location.href = "login.html"; });
    });

    window.ADCPortal.requireSession().then(function (session) {
      var user = session.user;
      document.getElementById("email").value = user.email || "";

      // If a profile already exists, skip straight to the dashboard
      return window.ADCPortal.getStudentProfile(user.id).then(function (profile) {
        if (profile) {
          window.location.href = "dashboard.html";
          return;
        }

        // Pre-fill name from Google profile if available
        var meta = user.user_metadata || {};
        if (meta.full_name || meta.name) {
          document.getElementById("fullName").value = meta.full_name || meta.name;
        }

        document.getElementById("profileForm").addEventListener("submit", function (e) {
          e.preventDefault();
          var submitBtn = document.getElementById("submitBtn");
          submitBtn.disabled = true;
          submitBtn.textContent = "Creating your profile...";

          var payload = {
            auth_user_id: user.id,
            full_name: document.getElementById("fullName").value.trim(),
            date_of_birth: document.getElementById("dob").value,
            state_of_origin: document.getElementById("state").value,
            nin: document.getElementById("nin").value.trim() || null,
            referral_source: document.getElementById("referral").value,
            email: user.email
          };

          window.ADCPortal.client
            .from("students")
            .insert(payload)
            .select()
            .single()
            .then(function (res) {
              if (res.error) throw res.error;
              showMsg("Profile created! Redirecting to your dashboard...", "success");
              setTimeout(function () { window.location.href = "dashboard.html"; }, 900);
            })
            .catch(function (err) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Create my student profile";
              showMsg(err.message || "Could not save your profile. Please try again.", "error");
            });
        });
      });
    }).catch(function () { /* requireSession already redirected to login */ });
  });
})();
