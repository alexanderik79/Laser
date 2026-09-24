// ai.js

let OPENAI_API_KEY = localStorage.getItem('saved_openai_key');

document.addEventListener('DOMContentLoaded', () => {
    const dictateBtn = document.getElementById('dictateBtn');
    const voiceStatus = document.getElementById('voiceStatus');

    // Налаштування Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        dictateBtn.style.display = 'none';
        voiceStatus.textContent = 'Ваш браузер не підтримує голосове введення.';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA'; // Змінено на українську мову розпізнавання
    recognition.continuous = true; 
    recognition.interimResults = true; 

    let isRecording = false;
    let finalTranscript = ''; 

    // Обробник кнопки
    dictateBtn.addEventListener('click', () => {
        // ПЕРЕВІРКА КЛЮЧА ПРИ НАТИСКАННІ
        if (!OPENAI_API_KEY) {
            const userInput = prompt('Будь ласка, введіть ваш API ключ від OpenAI (починається з sk-...):');
            if (userInput && userInput.trim() !== '') {
                OPENAI_API_KEY = userInput.trim();
                localStorage.setItem('saved_openai_key', OPENAI_API_KEY);
                alert('Ключ успішно збережено в пам\'яті телефону!');
            } else {
                alert('Без ключа голосовий ШІ не зможе працювати.');
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
        dictateBtn.textContent = '⏹';
        voiceStatus.textContent = 'Слухаю... (можете робити паузи)';
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
        // Відключено виведення тексту під час диктування, щоб інтерфейс не стрибав
        // voiceStatus.textContent = 'Розпізнано: ' + finalTranscript + interimTranscript;
    };

    recognition.onend = async () => {
        isRecording = false;
        dictateBtn.classList.remove('recording');
        dictateBtn.textContent = '🎙';
        
        if (finalTranscript.trim() === '') {
            voiceStatus.textContent = 'Нічого не почув. Спробуйте ще раз.';
            return;
        }

        voiceStatus.textContent = 'Аналізую запит... ✨';
        await processWithOpenAI(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
        isRecording = false;
        dictateBtn.classList.remove('recording');
        dictateBtn.textContent = '🎤';
        if (event.error !== 'no-speech') {
            voiceStatus.textContent = 'Помилка мікрофона: ' + event.error;
        }
    };

    async function processWithOpenAI(text) {
        const today = new Date().toISOString().split('T')[0];
        
        // Системний промпт перекладено українською для кращого контексту
        const systemPrompt = `Ти помічник адміністратора кабінету. Проаналізуй текст і поверни ТІЛЬКИ JSON формат без зайвих символів і без маркдауну (без \`\`\`json).
Поточна дата для розуміння слів "сьогодні", "завтра": ${today}.

Структура JSON:
{
  "clientName": "Ім'я клієнта та назва процедури (коротко)",
  "date": "Дата у форматі YYYY-MM-DD",
  "startTime": "Час у форматі HH:MM",
  "duration": число (тривалість у хвилинах, якщо не сказано, став 60),
  "description": "Побажання, зони, особливості (якщо немає - порожній рядок)"
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
                // Якщо ключ виявився неробочим
                if (response.status === 401) {
                    localStorage.removeItem('saved_openai_key');
                    OPENAI_API_KEY = null;
                    voiceStatus.textContent = 'Помилка авторизації. Ключ скинуто. Натисніть на мікрофон, щоб ввести новий.';
                    return;
                }
                const errorData = await response.json();
                voiceStatus.textContent = 'Помилка доступу: ' + (errorData.error?.message || 'Невідома помилка');
                return;
            }

            const data = await response.json();
            let aiText = data.choices[0].message.content;
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            fillFormWithAiData(JSON.parse(aiText)); 

        } catch (error) {
            voiceStatus.textContent = 'Не вдалося отримати дані. Заповніть вручну.';
        }
    }

    function fillFormWithAiData(parsedData) {
        if (parsedData.clientName) document.getElementById('clientName').value = parsedData.clientName;
        if (parsedData.date) document.getElementById('date').value = parsedData.date;
        if (parsedData.startTime) document.getElementById('startTime').value = parsedData.startTime;
        if (parsedData.duration) document.getElementById('duration').value = parsedData.duration;
        if (parsedData.description) document.getElementById('description').value = parsedData.description;

        voiceStatus.textContent = '✨ Форму успішно заповнено!';
        setTimeout(() => {
            if(voiceStatus.textContent === '✨ Форму успішно заповнено!') {
                voiceStatus.textContent = '';
            }
        }, 4000);
    }
});