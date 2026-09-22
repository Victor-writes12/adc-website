(function () {
  "use strict";

  var DEPOSIT_AMOUNT = 25000;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (!window.ADCPortal) return;

    var msg = document.getElementById("formMsg");
    var payButton = document.getElementById("payDepositBtn");
    function showMsg(text, type) {
      msg.textContent = text;
      msg.className = "form-msg is-visible " + type;
    }

    document.getElementById("magicLinkForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("email").value.trim();
      if (!window.ADCPortal.isGmail(email)) {
        showMsg("Please enter a valid Gmail address.", "error");
        return;
      }
      if (!window.ADC_PAYSTACK_PUBLIC_KEY || window.ADC_PAYSTACK_PUBLIC_KEY.indexOf("PAYSTACK_PUBLIC_KEY") !== -1 || typeof window.PaystackPop === "undefined") {
        showMsg("Online payment is not configured yet. Please contact us on WhatsApp to arrange payment.", "error");
        return;
      }
      payButton.disabled = true;
      payButton.textContent = "Opening secure payment...";
      var handler = window.PaystackPop.setup({
        key: window.ADC_PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: DEPOSIT_AMOUNT * 100,
        currency: "NGN",
        channels: ["card", "bank_transfer"],
        callback: function (response) {
          if (!response || response.status !== "success" || !response.reference) {
            payButton.disabled = false;
            payButton.textContent = "Pay NGN 75,000 and continue";
            showMsg("Payment could not be confirmed. Please try again or contact us on WhatsApp.", "error");
            return;
          }
          showMsg("Confirming your payment...", "success");
          var client = window.supabase.createClient(window.ADC_SUPABASE_URL, window.ADC_SUPABASE_ANON_KEY);
          client.functions.invoke("verify-training-payment", {
            body: { reference: response.reference, email: email },
          }).then(function (result) {
            if (result.error || !result.data || result.data.ok !== true) throw new Error("Payment verification failed");
            return window.ADCPortal.sendMagicLink(email, "complete-profile.html");
          }).then(function (res) {
            if (res.error) throw res.error;
            payButton.textContent = "Payment confirmed";
            showMsg("Payment confirmed. Check your inbox for the secure account link.", "success");
          }).catch(function (err) {
            payButton.disabled = false;
            payButton.textContent = "Pay NGN 75,000 and continue";
            showMsg(err.message || "Payment was received but could not be verified. Contact us with your reference.", "error");
          });
        },
        onClose: function () {
          payButton.disabled = false;
          payButton.textContent = "Pay NGN 75,000 and continue";
        },
      });
      handler.openIframe();
    });
  });
})();
