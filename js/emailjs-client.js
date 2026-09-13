window.ADC_EMAILJS_PUBLIC_KEY = "TgmfORAJIQUowThL9";
window.ADC_EMAILJS_SERVICE_ID = "service_cus5a0j";
window.ADC_EMAILJS_ADMIN_TEMPLATE_ID = "template_nejy8ta";
window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID = "template_tjtshg8";

(function () {
  "use strict";

  var isConfigured =
    window.emailjs &&
    window.ADC_EMAILJS_PUBLIC_KEY.indexOf("YOUR_PUBLIC_KEY") === -1 &&
    window.ADC_EMAILJS_SERVICE_ID.indexOf("YOUR_SERVICE_ID") === -1 &&
    window.ADC_EMAILJS_ADMIN_TEMPLATE_ID.indexOf("YOUR_ADMIN_TEMPLATE_ID") === -1 &&
    window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID.indexOf("YOUR_AUTOREPLY_TEMPLATE_ID") === -1;

  if (!isConfigured) return;

  emailjs.init({ publicKey: window.ADC_EMAILJS_PUBLIC_KEY });

  var form = document.getElementById("contact-form");
  function sendContactEmails() {
    if (!form) return;
    var submittedAt = new Date().toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    var params = {
      full_name: form.fname.value,
      phone: form.fphone.value,
      email: form.femail.value,
      service: form.fservice.value,
      property_location: form.faddress.value,
      message: form.fmessage.value,
      submitted_at: submittedAt,
    };

    emailjs
      .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_ADMIN_TEMPLATE_ID, params)
      .catch(function (err) {
        console.error("EmailJS admin notification failed to send:", err);
      });

    if (params.email) {
      emailjs
        .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID, params)
        .catch(function (err) {
          console.error("EmailJS auto-reply failed to send:", err);
        });
    }
  }

  if (form) form.addEventListener("submit", sendContactEmails);

  window.ADC_sendOrderEmails = function (order) {
    var itemLines = order.items.map(function (item) {
      return item.name + " x" + item.qty + " - NGN " + (item.unit_price * item.qty).toLocaleString("en-NG");
    }).join("\n");
    var params = {
      full_name: order.full_name,
      phone: order.phone,
      email: order.email,
      address: order.address,
      service: "Shop order - " + order.payment_method,
      property_location: order.address,
      message: "Items:\n" + itemLines + "\n\nTotal: NGN " + order.total.toLocaleString("en-NG") +
        "\nPayment status: " + order.status +
        "\nPayment reference: " + (order.payment_reference || "Not applicable"),
      items: order.items,
      total: order.total,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference || "Not applicable",
      status: order.status,
      submitted_at: new Date().toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    };

    return emailjs
      .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_ADMIN_TEMPLATE_ID, params)
      .then(function () {
        if (!params.email) return;
        return emailjs.send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID, params);
      });
  };
})();
