// scanner.js - Финальная версия с улучшенным интерфейсом и выбором камеры

document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.getElementById('status-text').innerHTML = '<h1>Ошибка: Пожалуйста, откройте это окно внутри Telegram.</h1>';
        return;
    }
    
    tg.expand();
    const chatId = tg.initDataUnsafe.user.id;
    let html5QrcodeScanner; 

    // Элементы интерфейса
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusText = document.getElementById('status-text');
    const cancelButton = document.getElementById('cancel-button');

    cancelButton.addEventListener('click', () => tg.close());

    function onScanSuccess(decodedText, decodedResult) {
        // Немедленно останавливаем сканер
        html5QrcodeScanner.clear().catch(error => console.error("Не удалось остановить сканер.", error));
        
        statusText.textContent = 'Код получен! Отправляю...';
        
        // !!! ВАЖНО: Убедитесь, что здесь актуальный адрес от вашего туннеля (localtunnel или ngrok) !!!
           const webhookUrl = 'https://16c3-188-163-12-90.ngrok-free.app/barcode'; 
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: decodedText, chatId: chatId })
        })
        .then(response => {
            if (!response.ok) throw new Error('Сервер ответил ошибкой');
            return response.json();
        })
        .then(data => {
            console.log('Отправка успешна:', data);
            tg.HapticFeedback.notificationOccurred('success');
            tg.close();
        })
        .catch(error => {
            console.error('Ошибка отправки:', error);
            tg.showAlert(`Не удалось отправить данные боту: ${error.message}`);
        });
    }

    function onScanFailure(error) {
        // Можно игнорировать
    }

    // Создаем объект сканера
    html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", 
        { 
            fps: 10, 
            qrbox: { width: 250, height: 150 },
            // --- РЕШЕНИЕ ПРОБЛЕМЫ №1 и №2 ---
            // Указываем, что хотим использовать заднюю камеру ('environment')
            facingMode: "environment" 
        }, 
        false
    );
    
    // Запускаем сканер и обрабатываем интерфейс
    html5QrcodeScanner.render(onScanSuccess, onScanFailure)
        .then(() => {
            // Камера успешно запущена
            loadingIndicator.style.display = 'none';
            statusText.textContent = 'Наведите камеру на штрих-код';
        })
        .catch(err => {
            // Ошибка при запуске камеры
            console.error(`Не удалось запустить сканер: ${err}`);
            statusText.innerHTML = `<b>Ошибка камеры:</b><br>${err}<br><br>Пожалуйста, убедитесь, что вы дали разрешение на использование камеры.`;
            loadingIndicator.style.display = 'none';
        });
});