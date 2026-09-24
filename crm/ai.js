// ai.js

let OPENAI_API_KEY = localStorage.getItem('saved_openai_key');

document.addEventListener('DOMContentLoaded', () => {
    const dictateBtn = document.getElementById('dictateBtn');
    const voiceStatus = document.getElementById('voiceStatus');

    // Настройка Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        dictateBtn.style.display = 'none';
        voiceStatus.textContent = 'Ваш браузер не поддерживает голосовой ввод.';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU'; 
    recognition.continuous = true; 
    recognition.interimResults = true; 

    let isRecording = false;
    let finalTranscript = ''; 

    // Обработчик кнопки
    dictateBtn.addEventListener('click', () => {
        // ПРОВЕРКА КЛЮЧА ПРИ НАЖАТИИ
        if (!OPENAI_API_KEY) {
            const userInput = prompt('Пожалуйста, введите ваш API ключ от OpenAI (начинается с sk-...):');
            if (userInput && userInput.trim() !== '') {
                OPENAI_API_KEY = userInput.trim();
                localStorage.setItem('saved_openai_key', OPENAI_API_KEY);
                alert('Ключ успешно сохранен в памяти телефона!');
            } else {
                alert('Без ключа голосовой ИИ не сможет работать.');
                return;
            }
        }

        if (!isRecording) {
            finalTranscript = '';
            recognition.start();
        } else {
            recognition.stop();
        }
    });

    recognition.onstart = () => {
        isRecording = true;
        dictateBtn.classList.add('recording');
        dictateBtn.textContent = '⏹ Завершить диктовку';
        voiceStatus.textContent = 'Слушаю... (можете делать паузы)';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        voiceStatus.textContent = 'Распознано: ' + finalTranscript + interimTranscript;
    };

    recognition.onend = async () => {
        isRecording = false;
        dictateBtn.classList.remove('recording');
        dictateBtn.textContent = '🎙';
        
        if (finalTranscript.trim() === '') {
            voiceStatus.textContent = 'Ничего не услышал. Попробуйте еще раз.';
            return;
        }

        voiceStatus.textContent = 'Отправляю в OpenAI: "' + finalTranscript.trim() + '"...';
        await processWithOpenAI(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
        isRecording = false;
        dictateBtn.classList.remove('recording');
        dictateBtn.textContent = '🎤 Надиктовать ИИ';
        if (event.error !== 'no-speech') {
            voiceStatus.textContent = 'Ошибка микрофона: ' + event.error;
        }
    };

    async function processWithOpenAI(text) {
        const today = new Date().toISOString().split('T')[0];
        const systemPrompt = `Ты помощник администратора кабинета. Проанализируй текст и верни ТОЛЬКО JSON формат без лишних символов и без маркдауна (без \`\`\`json).
Текущая дата для понимания слов "сегодня", "завтра": ${today}.

Структура JSON:
{
  "clientName": "Имя клиента и название процедуры (кратко)",
  "date": "Дата в формате YYYY-MM-DD",
  "startTime": "Время в формате HH:MM",
  "duration": число (длительность в минутах, если не сказано, ставь 60),
  "description": "Пожелания, зоны, особенности (если нет - пустая строка)"
}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', 
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: text }
                    ],
                    temperature: 0.1, 
                    response_format: { type: "json_object" } 
                })
            });

            if (!response.ok) {
                // Если ключ оказался нерабочим (например, удалили или закончились деньги)
                if (response.status === 401) {
                    localStorage.removeItem('saved_openai_key'); // Удаляем нерабочий ключ
                    OPENAI_API_KEY = null;
                    voiceStatus.textContent = 'Ошибка авторизации. Ключ сброшен. Нажмите на микрофон, чтобы ввести новый.';
                    return;
                }
                const errorData = await response.json();
                voiceStatus.textContent = 'Ошибка доступа: ' + (errorData.error?.message || 'Неизвестная ошибка');
                return;
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            fillFormWithAiData(JSON.parse(aiText)); 

        } catch (error) {
            voiceStatus.textContent = 'Не удалось извлечь данные. Заполните вручную.';
        }
    }

    function fillFormWithAiData(parsedData) {
        if (parsedData.clientName) document.getElementById('clientName').value = parsedData.clientName;
        if (parsedData.date) document.getElementById('date').value = parsedData.date;
        if (parsedData.startTime) document.getElementById('startTime').value = parsedData.startTime;
        if (parsedData.duration) document.getElementById('duration').value = parsedData.duration;
        if (parsedData.description) document.getElementById('description').value = parsedData.description;

        voiceStatus.textContent = '✨ Форма успешно заполнена!';
        setTimeout(() => {
            if(voiceStatus.textContent === '✨ Форма успешно заполнена!') {
                voiceStatus.textContent = '';
            }
        }, 4000);
    }
});