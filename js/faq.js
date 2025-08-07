// src/js/faq.js

export function initFaq() {
  const faqItems = document.querySelectorAll('.faq__item h3');

  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const parentItem = item.parentNode;
      const answer = item.nextElementSibling;
      
      // Переключаем класс 'active'
      parentItem.classList.toggle('active');

      // Динамически управляем высотой для плавной анимации
      if (parentItem.classList.contains('active')) {
        // Если класс 'active' добавлен, устанавливаем высоту, равную scrollHeight
        // Это позволяет CSS плавно анимировать до этой высоты
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        // Если класс 'active' убран, сбрасываем maxHeight
        answer.style.maxHeight = null;
      }
    });
  });
}