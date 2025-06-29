// scanner.js - Версия с ручным выбором задней камеры

document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        document.getElementById('status-text').innerHTML = '<h1>Ошибка: Пожалуйста, откройте это окно внутри Telegram.</h1>';
        return;
    }
    
    tg.expand();
    const chatId = tg.initDataUnsafe.user.id;

    // Элементы интерфейса
    const loadingIndicator = document.getElementById('loading-indicator');
    const statusText = document.getElementById('status-text');
    const cancelButton = document.getElementById('cancel-button');

    cancelButton.addEventListener('click', () => tg.close());

    // Создаем объект сканера, но пока не запускаем его
    const html5QrCode = new Html5Qrcode("qr-reader");

    function onScanSuccess(decodedText, decodedResult) {
        // Немедленно останавливаем сканер
        html5QrCode.stop().catch(err => console.error("Не удалось остановить камеру.", err));
        
        statusText.textContent = 'Код получен! Отправляю...';
        
        // !!! ВАЖНО: Убедитесь, что здесь актуальный адрес от вашего туннеля !!!
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

    const qrCodeErrorCallback = (errorMessage) => {
        // Можно игнорировать
    };
    
    // --- НОВАЯ ЛОГИКА ВЫБОРА КАМЕРЫ ---
    Html5Qrcode.getCameras().then(devices => {
        console.log("Найденные камеры:", devices);
        if (devices && devices.length) {
            let cameraId = devices[0].id; // По умолчанию берем первую камеру
            
            // Пытаемся найти заднюю камеру по слову "back" в названии
            const rearCamera = devices.find(device => device.label.toLowerCase().includes('back'));
            if (rearCamera) {
                cameraId = rearCamera.id;
                console.log("Найдена задняя камера по названию:", rearCamera.label);
            } else if (devices.length > 1) {
                // Если не нашли по названию, но камер больше одной, берем последнюю
                // (чаще всего это и есть задняя)
                cameraId = devices[devices.length - 1].id;
                console.log("Задняя камера не найдена по названию, выбираем последнюю в списке.");
            }

            // Конфигурация сканера
            const config = { 
                fps: 10, 
                qrbox: { width: 250, height: 150 } 
            };

            // Запускаем сканер с ПРЯМЫМ УКАЗАНИЕМ ID КАМЕРЫ
            html5QrCode.start(
                cameraId,         // ID камеры
                config,           // Конфигурация
                onScanSuccess,    // Callback при успехе
                qrCodeErrorCallback // Callback при ошибке
            ).then(() => {
                loadingIndicator.style.display = 'none';
                statusText.textContent = 'Наведите камеру на штрих-код';
                console.log("Сканер запущен с камерой ID:", cameraId);
            }).catch(err => {
                console.error(`Не удалось запустить сканер: ${err}`);
                statusText.innerHTML = `<b>Ошибка камеры:</b><br>${err}`;
                loadingIndicator.style.display = 'none';
            });
        } else {
            console.error("Камеры не найдены.");
            statusText.textContent = "На этом устройстве не найдено камер.";
            loadingIndicator.style.display = 'none';
        }
    }).catch(err => {
        console.error("Ошибка при получении списка камер:", err);
        statusText.innerHTML = `<b>Ошибка доступа к камерам:</b><br>${err}`;
        loadingIndicator.style.display = 'none';
    });
});