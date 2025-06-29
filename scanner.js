// scanner.js - Финальная рабочая версия

document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.body.innerHTML = '<h1>Ошибка: Пожалуйста, откройте это окно внутри Telegram.</h1>';
        return;
    }
    
    tg.expand();

    const chatId = tg.initDataUnsafe.user.id;

    function onScanSuccess(decodedText, decodedResult) {
        // !!! ВАЖНО: Перед загрузкой на GitHub, здесь должен быть актуальный адрес от ngrok !!!
        const webhookUrl = 'https://ВАШ-АКТУАЛЬНЫЙ-NGROK-АДРЕС.ngrok-free.app/barcode'; 
        
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
            tg.close();
        })
        .catch(error => {
            console.error('Ошибка отправки:', error);
            tg.showAlert(`Не удалось отправить данные боту: ${error.message}`);
        });
    }

    function onScanFailure(error) { /* Игнорируем ошибки, когда камера не находит код */ }

    let html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 150 }}, false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
});