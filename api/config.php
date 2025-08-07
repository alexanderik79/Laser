<?php
// api/config.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Для локального тестирования, убери в продакшене

// Читаем .env
$env = parse_ini_file('.env');
if (!$env) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load .env']);
    exit;
}

echo json_encode([
    'telegramBotToken' => $env['TELEGRAM_BOT_TOKEN'],
    'telegramChatId' => $env['TELEGRAM_CHAT_ID']
]);
?>