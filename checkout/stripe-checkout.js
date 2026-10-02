/**
 * AR Webcrafts LLC - Stripe Payment Gateway Integration Client
 * Handles service selection, dynamic pricing, Stripe Elements, and Checkout Sessions.
 */

(function () {
  'use strict';

  let stripe = null;
  let elements = null;
  let cardElement = null;
  let publishableKey = '';
  let activePaymentMethod = 'hosted'; // 'hosted' or 'elements'

  // Service state
  let currentService = {
    id: 'plugin-milestone',
    name: 'Custom WordPress Plugin Milestone',
    amount: 500.00,
    invoiceRef: 'N/A'
  };

  document.addEventListener('DOMContentLoaded', initCheckout);

  async function initCheckout() {
    setupServiceSelection();
    setupPaymentMethodToggle();
    setupFormSubmission();

    // Fetch Stripe configuration from backend serverless API
    try {
      const res = await fetch('/api/config/');
      if (res.ok) {
        const config = await res.json();
        if (config && config.publishableKey) {
          publishableKey = config.publishableKey;
          if (window.Stripe && publishableKey) {
            stripe = window.Stripe(publishableKey);
            console.log('[AR Webcrafts Stripe] Initialized in mode:', config.mode);
          }
        }
      }
    } catch (e) {
      console.warn('[AR Webcrafts Stripe] Config fetch notice (using test/sandbox fallback):', e.message);
    }
  }

  // 1. Service Selection & Custom Amount Calculation
  function setupServiceSelection() {
    const serviceItems = document.querySelectorAll('.ar-service-item');
    const customAmountBox = document.getElementById('ar-custom-box');
    const customAmountInput = document.getElementById('custom-amount-input');
    const customInvoiceInput = document.getElementById('custom-invoice-input');

    serviceItems.forEach((item) => {
      item.addEventListener('click', function (e) {
        // Prevent double trigger if clicking directly on radio input
        const radio = this.querySelector('input[type="radio"]');
        if (e.target !== radio) {
          radio.checked = true;
        }

        serviceItems.forEach((i) => i.classList.remove('active'));
        this.classList.add('active');

        const serviceId = radio.value;
        const serviceName = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));

        if (serviceId === 'custom-invoice') {
          if (customAmountBox) customAmountBox.classList.add('show');
          const customVal = parseFloat(customAmountInput ? customAmountInput.value : 0) || 100.00;
          currentService = {
            id: 'custom-invoice',
            name: 'Custom Client Milestone / Invoice',
            amount: customVal,
            invoiceRef: customInvoiceInput ? customInvoiceInput.value.trim() : 'INV-CUSTOM'
          };
        } else {
          if (customAmountBox) customAmountBox.classList.remove('show');
          currentService = {
            id: serviceId,
            name: serviceName,
            amount: price,
            invoiceRef: 'STD-SERVICE'
          };
        }

        updateSummaryDisplay();
      });
    });

    if (customAmountInput) {
      customAmountInput.addEventListener('input', function () {
        const val = parseFloat(this.value);
        if (!isNaN(val) && val > 0) {
          currentService.amount = val;
          updateSummaryDisplay();
        }
      });
    }

    if (customInvoiceInput) {
      customInvoiceInput.addEventListener('input', function () {
        currentService.invoiceRef = this.value.trim() || 'INV-CUSTOM';
        updateSummaryDisplay();
      });
    }

    // Set initial display
    updateSummaryDisplay();
  }

  // Update order summary card and button texts
  function updateSummaryDisplay() {
    const serviceDisplay = document.getElementById('summary-service-name');
    const subtotalDisplay = document.getElementById('summary-subtotal');
    const totalDisplay = document.getElementById('summary-total-display');
    const btnText = document.getElementById('ar-btn-text');

    const formattedAmount = '$' + currentService.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (serviceDisplay) serviceDisplay.textContent = currentService.name;
    if (subtotalDisplay) subtotalDisplay.textContent = formattedAmount + ' USD';
    if (totalDisplay) totalDisplay.textContent = formattedAmount + ' USD';
    if (btnText) btnText.textContent = `Pay ${formattedAmount} USD Securely via Stripe`;
  }

  // 2. Toggle Between Stripe Hosted vs On-page Card Elements
  function setupPaymentMethodToggle() {
    const toggleBtns = document.querySelectorAll('.ar-method-btn');
    const elementsBox = document.getElementById('ar-elements-box');

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        toggleBtns.forEach((b) => b.classList.remove('active'));
        this.classList.add('active');

        activePaymentMethod = this.getAttribute('data-method');

        if (activePaymentMethod === 'elements') {
          if (elementsBox) elementsBox.classList.add('show');
          mountStripeElements();
        } else {
          if (elementsBox) elementsBox.classList.remove('show');
        }
      });
    });
  }

  // Mount Stripe Elements card field
  function mountStripeElements() {
    if (cardElement || !window.Stripe) return;

    if (!stripe && publishableKey) {
      stripe = window.Stripe(publishableKey);
    }

    if (!stripe) {
      console.warn('[AR Webcrafts Stripe] Elements preview mode. Live key required for card input tokenization.');
      const errBox = document.getElementById('card-errors');
      if (errBox) {
        errBox.textContent = 'Note: Set STRIPE_PUBLISHABLE_KEY in Vercel to activate direct card tokenization, or use the instant Hosted Checkout.';
        errBox.style.color = '#BE8C33';
      }
      return;
    }

    elements = stripe.elements();
    const style = {
      base: {
        color: '#1E293B',
        fontFamily: '"Poppins", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: '#94A3B8'
        }
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444'
      }
    };

    cardElement = elements.create('card', { style: style, hidePostalCode: false });
    cardElement.mount('#card-element');

    cardElement.on('change', function (event) {
      const displayError = document.getElementById('card-errors');
      if (displayError) {
        displayError.textContent = event.error ? event.error.message : '';
      }
    });
  }

  // 3. Form Submission & Payment Dispatch
  function setupFormSubmission() {
    const payForm = document.getElementById('ar-checkout-form');
    if (!payForm) return;

    payForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const phoneInput = document.getElementById('client-phone');
      const invoiceInput = document.getElementById('client-invoice') || document.getElementById('custom-invoice-input');
      const notesInput = document.getElementById('client-notes');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const invoice = invoiceInput ? invoiceInput.value.trim() : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!name) {
        alert('Please enter your full name or company name.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!email || !email.includes('@')) {
        alert('Please provide a valid email address for receipt and developer confirmation.');
        if (emailInput) emailInput.focus();
        return;
      }

      setLoadingState(true);

      const payload = {
        serviceName: currentService.name,
        amount: currentService.amount,
        currency: 'usd',
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        invoiceNumber: invoice || currentService.invoiceRef || 'N/A',
        notes: notes
      };

      try {
        if (activePaymentMethod === 'hosted' || !cardElement) {
          // Stripe Hosted Checkout Flow
          const response = await fetch('/api/create-checkout-session/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to create Stripe Checkout session.');
          }

          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error('No redirect URL returned by checkout service.');
          }
        } else {
          // Embedded Elements Flow
          const intentResponse = await fetch('/api/create-payment-intent/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const intentData = await intentResponse.json();

          if (!intentResponse.ok) {
            throw new Error(intentData.error || 'Failed to initialize payment.');
          }

          if (intentData.mode === 'test_sandbox_ready') {
            // Simulated sandbox success
            window.location.href = `/checkout/receipt/?payment_intent=${intentData.id}&amount=${currentService.amount}&currency=USD&service=${encodeURIComponent(currentService.name)}&customer=${encodeURIComponent(name)}&mode=test_simulated`;
            return;
          }

          const result = await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: name,
                email: email,
                phone: phone || undefined
              }
            }
          });

          if (result.error) {
            const displayError = document.getElementById('card-errors');
            if (displayError) displayError.textContent = result.error.message;
            setLoadingState(false);
          } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            window.location.href = `/checkout/receipt/?payment_intent=${result.paymentIntent.id}&amount=${currentService.amount}&currency=USD&service=${encodeURIComponent(currentService.name)}&customer=${encodeURIComponent(name)}`;
          }
        }
      } catch (err) {
        console.error('[AR Webcrafts Stripe Error]:', err);
        alert(err.message || 'Payment processing error. Please try again.');
        setLoadingState(false);
      }
    });
  }

  function setLoadingState(isLoading) {
    const payBtn = document.getElementById('ar-pay-button');
    const spinner = payBtn ? payBtn.querySelector('.ar-spinner') : null;
    const btnText = document.getElementById('ar-btn-text');
    const lockIcon = payBtn ? payBtn.querySelector('.ar-lock-icon') : null;

    if (!payBtn) return;

    payBtn.disabled = isLoading;
    if (isLoading) {
      if (spinner) spinner.style.display = 'inline-block';
      if (lockIcon) lockIcon.style.display = 'none';
      if (btnText) btnText.textContent = 'Redirecting to Stripe Secure Portal...';
    } else {
      if (spinner) spinner.style.display = 'none';
      if (lockIcon) lockIcon.style.display = 'inline-block';
      updateSummaryDisplay();
    }
  }
})();
