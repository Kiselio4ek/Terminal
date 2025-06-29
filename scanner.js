// scanner.js - ВЕРСИЯ С ПРЯМЫМ FETCH-ЗАПРОСОМ

document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    // Проверяем, что все данные доступны
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.body.innerHTML = '<h1>Ошибка: Не удалось получить данные пользователя. Откройте в Telegram.</h1>';
        return;
    }
    
    console.log('Telegram Web App API готово.');
    tg.expand();

    const chatId = tg.initDataUnsafe.user.id;
    console.log('Chat ID пользователя:', chatId);

    function onScanSuccess(decodedText, decodedResult) {
        console.log(`Код отсканирован: ${decodedText}`);
        
        // --- ОБХОДНОЙ ПУТЬ ---
        // Вместо tg.sendData() делаем прямой запрос к нашему боту
        const webhookUrl = 'https://d7c9-188-163-12-90.ngrok-free.app/barcode'; // Мы заменим это вручную при тесте
        
        console.log(`Отправляю POST-запрос на ${webhookUrl}`);
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                barcode: decodedText,
                chatId: chatId // Отправляем ID чата, чтобы бот знал, кому отвечать
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Ответ от сервера:', data);
            // Закрываем приложение только после успешной отправки
            tg.close();
        })
        .catch(error => {
            console.error('Ошибка при отправке fetch-запроса:', error);
            tg.showAlert(`Не удалось отправить данные боту: ${error.message}`);
        });
    }

    // ... остальной код сканера без изменений ...
    function onScanFailure(error) {}
    let html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 150 }}, false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    console.log('Сканер запущен в режиме прямого запроса.');
});