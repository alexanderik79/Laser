// src/js/form.js

// Функция показа модального окна
function showModal(message) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const modalClose = document.getElementById('modal-close');

  if (!modal || !modalMessage || !modalClose) return;

  modalMessage.textContent = message;
  modal.classList.add('is-visible');

  // Закрытие по кнопке
  const closeHandler = () => {
    modal.classList.remove('is-visible');
    modalClose.removeEventListener('click', closeHandler);
  };
  modalClose.addEventListener('click', closeHandler);

  // Закрытие при клике вне модалки
  const outsideClickHandler = (e) => {
    if (e.target === modal) {
      closeHandler();
      modal.removeEventListener('click', outsideClickHandler);
    }
  };
  modal.addEventListener('click', outsideClickHandler);
}

// Основная функция инициализации формы
export function initForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name')?.trim();
    const phone = formData.get('phone')?.trim();
    const service = formData.get('service') || 'Not selected';
    const comment = formData.get('comment')?.trim() || 'None';

    // === ВАЛИДАЦИЯ ===
    if (!name || name.length < 2 || !/^[A-Za-z\s]+$/.test(name)) {
      showModal('Please enter a valid name (letters only).');
      return;
    }

    if (!phone || !/^\+?\d{9,15}$/.test(phone)) {
      showModal('Please enter a valid phone number (9–15 digits).');
      return;
    }

    if (!service || service === 'Not selected') {
      showModal('Please select a service.');
      return;
    }

    // === Сообщение для Telegram ===
    const message = `*New Booking:*
            ------------------------------
            *Name:* ${name}
            *Phone:* ${phone}
            *Message:*
            ${comment || 'None'}
        `;
    const telegramBotToken = '8016220686:AAEe8gtXFBfmqJBK9U1uahJeiG0noNCGy60';
    const telegramChatId = '-1002978004505';

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      );

      if (!response.ok) throw new Error('Telegram error');

      // УСПЕХ
      showModal('Your message has been sent successfully!');
      form.reset(); // ОЧИЩАЕМ ФОРМУ

    } catch (error) {
      console.error('Send error:', error);
      showModal('Failed to send. Please try again or contact via WhatsApp.');
    }
  });
}