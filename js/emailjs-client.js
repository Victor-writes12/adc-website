// ADC Systems, EmailJS integration
//
// 1. Create a free account at https://www.emailjs.com
// 2. Under Email Services, add a service (e.g. Gmail) and note its Service ID
// 3. Under Email Templates, create a template and note its Template ID.
//    Use these variable names in your template so they match what is sent below:
//    {{full_name}} {{phone}} {{email}} {{service}} {{property_location}} {{message}}
// 4. Under Account, General, copy your Public Key
// 5. Paste all three values below in place of the three placeholders

window.ADC_EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
window.ADC_EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
window.ADC_EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

(function () {
  "use strict";

  var isConfigured =
    window.emailjs &&
    window.ADC_EMAILJS_PUBLIC_KEY.indexOf("YOUR_PUBLIC_KEY") === -1 &&
    window.ADC_EMAILJS_SERVICE_ID.indexOf("YOUR_SERVICE_ID") === -1 &&
    window.ADC_EMAILJS_TEMPLATE_ID.indexOf("YOUR_TEMPLATE_ID") === -1;

  if (!isConfigured) return;

  emailjs.init({ publicKey: window.ADC_EMAILJS_PUBLIC_KEY });

  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function () {
    var params = {
      full_name: form.fname.value,
      phone: form.fphone.value,
      email: form.femail.value,
      service: form.fservice.value,
      property_location: form.faddress.value,
      message: form.fmessage.value,
    };

    emailjs
      .send(window.ADC_EMAILJS_SERVICE_ID, window.ADC_EMAILJS_TEMPLATE_ID, params)
      .catch(function (err) {
        console.error("EmailJS failed to send:", err);
        /* main.js still shows the on-screen confirmation either way */
      });
  });
})();
