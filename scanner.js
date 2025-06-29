// scanner.js с логами

document.addEventListener("DOMContentLoaded", function() {
    // Проверяем, доступен ли объект Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log('Telegram Web App API готово.');
        tg.expand(); 

        function onScanSuccess(decodedText, decodedResult) {
            console.log('--- СКАН УСПЕШЕН ---');
            console.log('Распознанный текст:', decodedText);
            
            try {
                // --- ГЛАВНЫЙ ЛОГ ---
                // Проверяем, что мы сейчас будем отправлять данные
                console.log('Вызываю tg.sendData() для отправки данных боту...');
                tg.sendData(decodedText);
                console.log('Команда tg.sendData() была вызвана успешно.');
                
                // Вибрация и закрытие - это хорошо, но главное - отправка
                if (tg.HapticFeedback) {
                    tg.HapticFeedback.notificationOccurred('success');
                }
                tg.close();

            } catch (e) {
                console.error('!!! ОШИБКА при вызове tg.sendData() или tg.close() !!!', e);
                // Если произошла ошибка, можно показать ее пользователю
                tg.showAlert(`Произошла ошибка при отправке данных: ${e.message}`);
            }
        }

        function onScanFailure(error) {
            // Эта функция вызывается, но мы можем ее игнорировать, чтобы не засорять консоль
            // console.warn(`Code scan error = ${error}`);
        }

        let html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10,
                qrbox: { width: 250, height: 150 }
            },
            /* verbose= */ false
        );
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        console.log('Сканер QR-кодов запущен.');

    } else {
        console.error('ОШИБКА: Объект window.Telegram.WebApp не найден. Убедитесь, что приложение открыто в клиенте Telegram.');
        document.body.innerHTML = '<h1>Ошибка: Откройте это приложение внутри Telegram.</h1>';
    }
});