// scanner.js - Финальная рабочая версия с исправлением множественных отправок

document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.body.innerHTML = '<h1>Ошибка: Пожалуйста, откройте это окно внутри Telegram.</h1>';
        return;
    }
    
    tg.expand();

    const chatId = tg.initDataUnsafe.user.id;

    // --- ФУНКЦИЯ БЫЛА ИЗМЕНЕНА ---
    function onScanSuccess(decodedText, decodedResult) {
        
        // --- РЕШЕНИЕ ПРОБЛЕМЫ МНОЖЕСТВЕННЫХ ОТПРАВОК ---
        // Немедленно останавливаем сканер, чтобы он не отправлял повторные запросы.
        // Это самая важная строчка, которую мы добавили.
        html5QrcodeScanner.clear().catch(error => {
            console.error("Не удалось остановить сканер.", error);
        });
        // --- КОНЕЦ РЕШЕНИЯ ---

        console.log(`Код отсканирован: ${decodedText}. Отправляю запрос...`);

        const webhookUrl = 'https://16c3-188-163-12-90.ngrok-free.app/barcode'; 
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barcode: decodedText,
                chatId: chatId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Сервер ответил ошибкой');
            }
            return response.json();
        })
        .then(data => {
            console.log('Отправка успешна:', data);
            // Закрываем окно только после успешной отправки
            tg.close();
        })
        .catch(error => {
            console.error('Ошибка отправки:', error);
            tg.showAlert(`Не удалось отправить данные боту: ${error.message}`);
        });
    }

    function onScanFailure(error) { /* Игнорируем ошибки, когда камера не находит код */ }

    // Важно: создаем объект сканера здесь, чтобы он был доступен в onScanSuccess
    let html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 150 }}, false);
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});