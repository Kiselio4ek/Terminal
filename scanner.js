// Ждем, пока документ и Telegram Web App будут готовы
document.addEventListener("DOMContentLoaded", function() {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Разворачиваем приложение на весь экран

    // Функция, которая вызывается при успешном сканировании
    function onScanSuccess(decodedText, decodedResult) {
        // decodedText содержит распознанный штрих-код
        console.log(`Code scanned = ${decodedText}`);

        // Отправляем данные нашему боту
        tg.sendData(decodedText);
        
        // (Опционально) Можно показать вибрацию
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }

        // Закрываем окно сканера
        tg.close();
    }

    // Настраиваем сканер
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader", // ID нашего div из HTML
        { 
            fps: 10, // Кадров в секунду для сканирования
            qrbox: { width: 250, height: 150 } // Размер рамки сканирования
        },
        /* verbose= */ false
    );

    // Запускаем сканер
    html5QrcodeScanner.render(onScanSuccess);
});