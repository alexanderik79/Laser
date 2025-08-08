<?php
// api/send-telegram.php

// Включаем отладку (убери в продакшене)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Устанавливаем заголовки
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Убери в продакшене

// Читаем .env
$env = @parse_ini_file(__DIR__ . '/.env');
if ($env === false) {
    // Если .env не найден, используем хардкод для тестирования
    $telegramBotToken = "7670576657:AAGWnzzovQNQ4pOmoT8q2cD0IM9uC4Q-4iI";
    $telegramChatId = "979696456";
} else {
    $telegramBotToken = $env['TELEGRAM_BOT_TOKEN'] ?? null;
    $telegramChatId = $env['TELEGRAM_CHAT_ID'] ?? null;
}

// Проверяем наличие токенов
if (!$telegramBotToken || !$telegramChatId) {
    http_response_code(500);
    echo json_encode(['error' => 'Missing Telegram configuration']);
    exit;
}

// Получаем данные из POST
$data = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$service = $data['service'] ?? '';
$comment = $data['comment'] ?? 'None';

// Валидация
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

// Формируем сообщение
$message = "New Booking:\nName: $name\nPhone: $phone\nService: $service\nComment: $comment";

// Отправка в Telegram
$url = "https://api.telegram.org/bot$telegramBotToken/sendMessage";
$response = file_get_contents($url, false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
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

$telegramResult = json_decode($response, true);
if (!$telegramResult['ok']) {
    http_response_code(500);
    echo json_encode(['error' => 'Telegram API error: ' . ($telegramResult['description'] ?? 'Unknown')]);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true]);
?>