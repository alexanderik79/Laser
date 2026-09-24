// app.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm');
    const masterSelect = document.getElementById('masterName');

    // 1. СОХРАНЕНИЕ МАСТЕРА В LOCALSTORAGE
    // При открытии формы проверяем, выбирал ли этот телефон мастера ранее
    const savedMaster = localStorage.getItem('selectedMaster');
    if (savedMaster) {
        masterSelect.value = savedMaster;
    }
    // Если мастер изменил свое имя в списке, запоминаем новый выбор
    masterSelect.addEventListener('change', (e) => {
        localStorage.setItem('selectedMaster', e.target.value);
    });

    // 2. ГЕНЕРАЦИЯ ССЫЛКИ ДЛЯ GOOGLE КАЛЕНДАРЯ И ОТПРАВКА
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const clientName = document.getElementById('clientName').value;
        const masterName = document.getElementById('masterName').value;
        const date = document.getElementById('date').value; 
        const startTime = document.getElementById('startTime').value; 
        const duration = parseInt(document.getElementById('duration').value, 10);
        const description = document.getElementById('description').value;

        // Заголовок события
        const eventTitle = `${clientName} (${masterName})`;
        
        // Расчет времени окончания процедуры
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        // Функция форматирования времени под требования Google
        const formatForGoogleLocal = (dateObj) => {
            const pad = (n) => n.toString().padStart(2, '0');
            return `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}T${pad(dateObj.getHours())}${pad(dateObj.getMinutes())}00`;
        };

        const googleStart = formatForGoogleLocal(startDateTime);
        const googleEnd = formatForGoogleLocal(endDateTime);

        // Формирование красивого описания для карточки в календаре
        let fullDescription = `Бронь кабинета.\nМастер: ${masterName}`;
        if (description.trim() !== '') {
            fullDescription += `\n\nОсобливості процедури:\n${description}`;
        }

        // Сборка финального URL-адреса
        const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        const titleParam = `&text=${encodeURIComponent(eventTitle)}`;
        const datesParam = `&dates=${googleStart}/${googleEnd}`;
        const detailsParam = `&details=${encodeURIComponent(fullDescription)}`;

        const finalUrl = baseUrl + titleParam + datesParam + detailsParam;

        // Открытие вкладки с готовым событием в приложении Календаря
        window.open(finalUrl, '_blank');

        // 3. ОЧИСТКА ФОРМЫ ДЛЯ СЛЕДУЮЩЕГО КЛИЕНТА
        // Стираем индивидуальные данные, чтобы они не попали к следующему клиенту
        document.getElementById('clientName').value = '';
        document.getElementById('startTime').value = '';
        document.getElementById('description').value = '';
        document.getElementById('duration').value = '60'; // Сбрасываем время на стандартное
        
        // Поля "masterName" и "date" мы не трогаем, так как мастер тот же, 
        // и часто клиентов записывают подряд на один и тот же день.
    });
});