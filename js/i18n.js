// src/js/i18n.js
export function initI18n() {
  // Используем глобальные объекты i18next и i18nextBrowserLanguageDetector
  const i18nextInstance = window.i18next;
  const languageDetector = window.i18nextBrowserLanguageDetector;

  i18nextInstance
    .use(languageDetector)
    .init(
      {
        fallbackLng: 'en',
        supportedLngs: ['en', 'nl', 'uk', 'pl', 'ru'],
        resources: {}, // Пустой объект, переводы загружаются через fetch
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      },
      (err, t) => {
        if (err) return console.error('i18next error:', err);
        updateContent(t);
      }
    );

  // Загрузка переводов
  Promise.all([
    fetch('../locales/en.json').then((res) => res.json()),
    fetch('../locales/nl.json').then((res) => res.json()),
    fetch('../locales/uk.json').then((res) => res.json()),
    fetch('../locales/pl.json').then((res) => res.json()),
    fetch('../locales/ru.json').then((res) => res.json()),
  ])
    .then(([en, nl, uk, pl, ru]) => {
      i18nextInstance.addResourceBundle('en', 'translation', en);
      i18nextInstance.addResourceBundle('nl', 'translation', nl);
      i18nextInstance.addResourceBundle('uk', 'translation', uk);
      i18nextInstance.addResourceBundle('pl', 'translation', pl);
      i18nextInstance.addResourceBundle('ru', 'translation', ru);
      updateContent(i18nextInstance.t);
    })
    .catch((err) => console.error('Error loading translations:', err));

  // Обработчик переключателя языка
  document.getElementById('language-switcher').addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    i18nextInstance.changeLanguage(selectedLang, (err, t) => {
      if (err) return console.error('Language change error:', err);
      updateContent(t);
    });
  });
}

function updateContent(t) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n][placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    element.placeholder = t(key);
  });
}