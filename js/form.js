// src/js/form.js
export function initForm() {
  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Инициализация EmailJS (замените 'YOUR_USER_ID')
    emailjs.init('YOUR_USER_ID');

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      name: formData.get('name'),
      phone: formData.get('phone'),
      service: formData.get('service'),
      comment: formData.get('comment') || '',
    })
    .then(() => {
      alert(i18next.t('booking.form.success')); // Сообщение из переводов
      form.reset();
    })
    .catch((error) => {
      console.error('EmailJS error:', error);
      alert(i18next.t('booking.form.error'));
    });
  });
}