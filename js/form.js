// // src/js/form.js
// function showModal(message) {
//   const modal = document.getElementById('modal');
//   const modalMessage = document.getElementById('modal-message');
//   const modalClose = document.getElementById('modal-close');

//   modalMessage.textContent = message;
//   // Вместо modal.style.display = 'flex'
//   modal.classList.add('is-visible');

//   // Добавляем обработчик события для закрытия модалки
//   // Используем .removeEventListener для предотвращения дублирования
//   function closeModal() {
//     modal.classList.remove('is-visible');
//     modalClose.removeEventListener('click', closeModal);
//   }

//   modalClose.addEventListener('click', closeModal);

//   // Также закрываем модалку при клике вне её
//   modal.addEventListener('click', (event) => {
//     if (event.target === modal) {
//       closeModal();
//     }
//   });
// }

// export function initForm() {
//   const form = document.getElementById('booking-form');
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData(form);
//     const name = formData.get('name').trim();
//     const phone = formData.get('phone').trim();
//     const service = formData.get('service');
//     const comment = formData.get('comment') || '';

//     // Валидация имени
//     if (!name.match(/^[A-Za-z\s]{2,}$/)) {
//       showModal(i18next.t('booking.form.error_name'));
//       return;
//     }

//     // Валидация телефона
//     if (!phone.match(/^\+?\d{9,15}$/)) {
//       showModal(i18next.t('booking.form.error_phone'));
//       return;
//     }

//     // Формируем сообщение для Telegram
//     const message = `New Booking:\nName: ${name}\nPhone: ${phone}\nService: ${i18next.t(`booking.form.services.${service}`)}\nComment: ${comment || 'None'}`;
//     const telegramBotToken = '7670576657:AAGWnzzovQNQ4pOmoT8q2cD0IM9uC4Q-4iI';
//     const telegramChatId = '979696456';

//     try {
//       // Отправка в Telegram
//       const telegramResponse = await fetch(
//         `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             chat_id: telegramChatId,
//             text: message,
//           }),
//         }
//       );

//       if (!telegramResponse.ok) throw new Error('Telegram API error');

//       showModal(i18next.t('booking.form.success'));
//       form.reset();
//     } catch (error) {
//       console.error('Error:', error);
//       showModal(i18next.t('booking.form.error'));
//     }
//   });
// }





// src/js/form.js
function showModal(message) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');
  const modalClose = document.getElementById('modal-close');

  modalMessage.textContent = message;
  modal.classList.add('is-visible');

  function closeModal() {
    modal.classList.remove('is-visible');
    modalClose.removeEventListener('click', closeModal);
  }

  modalClose.addEventListener('click', closeModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

export function initForm() {
  const form = document.getElementById('booking-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const phone = formData.get('phone').trim();
    const service = formData.get('service');
    const comment = formData.get('comment') || '';

    // Валидация имени
    if (!name.match(/^[A-Za-z\s]{2,}$/)) {
      showModal(i18next.t('booking.form.error_name'));
      return;
    }

    // Валидация телефона
    if (!phone.match(/^\+?\d{9,15}$/)) {
      showModal(i18next.t('booking.form.error_phone'));
      return;
    }

    // Отправка на сервер
    try {
      const response = await fetch('/api/send-telegram.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          service: i18next.t(`booking.form.services.${service}`),
          comment,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Server error');
      }

      showModal(i18next.t('booking.form.success'));
      form.reset();
    } catch (error) {
      console.error('Error:', error);
      showModal(i18next.t('booking.form.error'));
    }
  });
}