<?php
// api/send-telegram.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Для локального тестирования, убери в продакшене

// Читаем .env
$env = parse_ini_file('.env');
if (!$env) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load .env']);
    exit;
}

// Получаем данные из POST
$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$service = $data['service'] ?? '';
$comment = $data['comment'] ?? 'None';

// Валидация (повторяем клиентскую валидацию на сервере)
if (!preg_match('/^[A-Za-z\s]{2,}$/', $name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid name']);
    exit;
}
if (!preg_match('/^\+?\d{9,15}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid phone']);
    exit;
}

// Формируем сообщение для Telegram
$message = "New Booking:\nName: $name\nPhone: $phone\nService: $service\nComment: $comment";

// Отправка в Telegram
// $telegramBotToken = $env['TELEGRAM_BOT_TOKEN'];
// $telegramChatId = $env['TELEGRAM_CHAT_ID'];

$telegramBotToken = '7670576657:AAGWnzzovQNQ4pOmoT8q2cD0IM9uC4Q-4iI';
$telegramChatId = '979696456';

$url = "https://api.telegram.org/bot$telegramBotToken/sendMessage";

$response = file_get_contents($url, false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode([
            'chat_id' => $telegramChatId,
            'text' => $message,
        ]),
    ],
]));

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Telegram API error']);
    exit;
}

echo json_encode(['success' => true]);
?>