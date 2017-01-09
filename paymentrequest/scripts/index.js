window.onload = function() {
  var staticShipping = document.getElementById('static-shipping-sample'),
    dynamicShipping = document.getElementById('dynamic-shipping-sample'),
    noShipping = document.getElementById('no-shipping-sample'),
    requestContact = document.getElementById('request-contact-sample'),
    staticShippingBtn = document.getElementById('static-shipping'),
    dynamicShippingBtn = document.getElementById('dynamic-shipping'),
    noShippingBtn = document.getElementById('no-shipping'),
    requestContactBtn = document.getElementById('request-contact-info')
    notSupportedMessage = document.getElementById('not-supported')

  //Loading the same code into the HTML
  staticShipping.innerHTML = Global.startPaymentRequestStaticShipping.toString();
  dynamicShipping.innerHTML = Global.startPaymentRequestDynamicShipping.toString();
  noShipping.innerHTML = Global.startPaymentRequestDigitalMerchandise.toString();
  requestContact.innerHTML = Global.startPaymentRequestWithContactInfo.toString();

  //attaching event listeners
  staticShippingBtn.addEventListener('click', Global.startPaymentRequestStaticShipping);
  dynamicShippingBtn.addEventListener('click',Global.startPaymentRequestDynamicShipping);
  noShippingBtn.addEventListener('click', Global.startPaymentRequestDigitalMerchandise);
  requestContactBtn.addEventListener('click', Global.startPaymentRequestWithContactInfo);

  //Hide demo buttons if the browser doesn't support the Payment Request API
  if (!('PaymentRequest' in window)) {
    notSupportedMessage.innerHTML = 'This browser does not support web payments. You should try the Microsoft Edge browser!';
    forEach('button', function(button){
      button.disabled = true
    })
  }

  //Expand or contract code displayer
  forEach('.top-bar', function(div) {
    div.addEventListener('click', function(event) {
      var expander = event.target.parentElement.querySelector('.expander')
      var text = expander.classList.contains('expand') ? 'See the code' : 'Hide the code'
      event.target.innerHTML = text
      expander.classList.toggle('expand')
    })
  });

  //highlighting samples
  forEach('pre code', function(div) {
    hljs.highlightBlock(div);
  });

  function forEach(selector, iteratee) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), iteratee);
  }

}
