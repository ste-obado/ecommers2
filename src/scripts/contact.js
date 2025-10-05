import { submitInquiry, trackAnalytics } from '../config/supabase.js';

trackAnalytics('page_view');

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

mobileMenuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';
  formMessage.innerHTML = '';

  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    message: document.getElementById('message').value.trim()
  };

  try {
    await submitInquiry(formData);
    trackAnalytics('inquiry_submit', null, { email: formData.email });

    formMessage.innerHTML = '<div class="success-message">Thank you! Your message has been sent successfully. We\'ll get back to you soon.</div>';
    contactForm.reset();
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    formMessage.innerHTML = '<div class="error-message">Failed to send message. Please try again.</div>';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});