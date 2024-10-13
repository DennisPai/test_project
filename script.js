    // 創建下載連結或直接顯示圖片
    canvas.toBlob(function(blob) {
        if (blob) {
            const url = URL.createObjectURL(blob);
            const isAndroid = /Android/i.test(navigator.userAgent);
            const fileName = document.getElementById('textInput').value.trim() || '象棋選擇';
            
            if (isAndroid) {
                // 對於Android設備，創建一個隱藏的下載鏈接並觸發點擊
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.png`;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                // 對於iOS設備，在新標籤頁中打開圖片
                window.open(url, '_blank');
            } else {
                // 對於桌面設備，使用常規下載方法
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.png`;
                link.click();
            }
            
            // 清理創建的URL對象
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } else {
            console.error('無法創建Blob對象');
        }
    }, 'image/png');
}
