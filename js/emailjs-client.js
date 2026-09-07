// ADC Systems, EmailJS integration
//
// This sends two emails whenever the contact form is submitted:
//   1. A notification to your team with the enquiry details
//   2. An automatic reply to the customer confirming it was received
//
// SETUP
// 1. Create a free account at https://www.emailjs.com
// 2. Under Email Services, add a service (e.g. Gmail) and note its Service ID
// 3. Under Email Templates, create TWO templates using the ready-made HTML in
//    the emailjs-templates folder:
//      emailjs-templates/admin-notification.html, paste into your first template
//      emailjs-templates/auto-reply.html, paste into your second template
//    Each template file has its own setup notes at the top as an HTML comment,
//    including which "To Email" address to set for that template.
// 4. Note the Template ID for each of the two templates
// 5. Under Account, General, copy your Public Key
// 6. Paste all four values below in place of the placeholders

window.ADC_EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
window.ADC_EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
window.ADC_EMAILJS_ADMIN_TEMPLATE_ID = "YOUR_ADMIN_TEMPLATE_ID";
window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID = "YOUR_AUTOREPLY_TEMPLATE_ID";

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
  if (!form) return;

  form.addEventListener("submit", function () {
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

    // 1. Notify the ADC Systems team
    emailjs
      .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_ADMIN_TEMPLATE_ID, params)
      .catch(function (err) {
        console.error("EmailJS admin notification failed to send:", err);
      });

    // 2. Auto-reply to the customer, only if they gave an email address
    if (params.email) {
      emailjs
        .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_AUTOREPLY_TEMPLATE_ID, params)
        .catch(function (err) {
          console.error("EmailJS auto-reply failed to send:", err);
        });
    }
    /* main.js still shows the on-screen confirmation either way */
  });
})();
