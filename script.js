const chessPieces = [
    {name: '帥', limit: 1, color: 'red'}, {name: '仕', limit: 2, color: 'red'}, 
    {name: '相', limit: 2, color: 'red'}, {name: '俥', limit: 2, color: 'red'}, 
    {name: '傌', limit: 2, color: 'red'}, {name: '炮', limit: 2, color: 'red'}, 
    {name: '兵', limit: 5, color: 'red'},
    {name: '將', limit: 1, color: 'black'}, {name: '士', limit: 2, color: 'black'}, 
    {name: '象', limit: 2, color: 'black'}, {name: '車', limit: 2, color: 'black'}, 
    {name: '馬', limit: 2, color: 'black'}, {name: '包', limit: 2, color: 'black'}, 
    {name: '卒', limit: 5, color: 'black'}
];

const keyMapping = 'QWERTYUASDFGHJ';
let selectedPieces = [];
let remainingPieces = [];

function initializeChessBoard() {
    const chessBoard = document.getElementById('chessBoard');
    chessBoard.innerHTML = '';
    remainingPieces = JSON.parse(JSON.stringify(chessPieces));
    chessPieces.forEach((piece, index) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = `chess-piece ${piece.color}-piece`;
        pieceElement.textContent = piece.name;
        pieceElement.dataset.index = index;
        pieceElement.onclick = () => selectPiece(index);
        chessBoard.appendChild(pieceElement);
    });
}

function selectPiece(index) {
    const piece = remainingPieces[index];
    if (piece && piece.limit > 0 && selectedPieces.length < 5) {
        selectedPieces.push({...piece});
        updateSelectionArea();
        piece.limit--;
        if (piece.limit === 0) {
            document.querySelector(`.chess-piece[data-index="${index}"]`).style.visibility = 'hidden';
        }
    }
}

function updateSelectionArea() {
    const slots = [1, 2, 3, 4, 5];
    slots.forEach((slot, index) => {
        const slotElement = document.getElementById(`slot-${slot}`);
        if (selectedPieces[index]) {
            slotElement.textContent = selectedPieces[index].name;
            slotElement.className = `selection-slot ${selectedPieces[index].color}-piece`;
        } else {
            slotElement.textContent = '';
            slotElement.className = 'selection-slot';
        }
    });
}

function resetSelection() {
    selectedPieces = [];
    initializeChessBoard();
    updateSelectionArea();
}

function undoLastSelection() {
    if (selectedPieces.length > 0) {
        const lastPiece = selectedPieces.pop();
        const index = chessPieces.findIndex(p => p.name === lastPiece.name && p.color === lastPiece.color);
        remainingPieces[index].limit++;
        document.querySelector(`.chess-piece[data-index="${index}"]`).style.visibility = 'visible';
        updateSelectionArea();
    }
}

function saveAsImage() {
    console.log('開始保存圖片');
    const canvas = document.getElementById('captureCanvas');
    if (!canvas) {
        console.error('未找到canvas元素');
        return;
    }
    const ctx = canvas.getContext('2d');

    // 保持高解析度
    const scale = window.devicePixelRatio || 1;
    const canvasSize = Math.min(500, window.innerWidth - 40);
    canvas.width = canvasSize * scale;
    canvas.height = canvasSize * scale;
    ctx.scale(scale, scale);

    // 設置canvas背景
    ctx.fillStyle = '#D2D2D2';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 調整圓形位置以增加間距
    const positions = [
        {x: canvasSize/2, y: canvasSize*0.6},  // 中
        {x: canvasSize*0.26, y: canvasSize*0.6},  // 左
        {x: canvasSize*0.74, y: canvasSize*0.6},  // 右
        {x: canvasSize/2, y: canvasSize*0.36},  // 上
        {x: canvasSize/2, y: canvasSize*0.84}   // 下
    ];

    // 繪製棋子
    const slots = [1, 2, 3, 4, 5];
    const circleRadius = canvasSize * 0.09;
    slots.forEach((slot, index) => {
        const slotElement = document.getElementById(`slot-${slot}`);
        if (slotElement && slotElement.textContent) {
            const {x, y} = positions[index];
            const isRed = slotElement.classList.contains('red-piece');
            
            // 繪製圓形背景
            ctx.beginPath();
            ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle = isRed ? 'red' : 'black';
            ctx.lineWidth = 3;
            ctx.stroke();

            // 繪製文字
            ctx.font = `bold ${canvasSize*0.1}px "Microsoft YaHei", "微軟正黑體", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = isRed ? 'red' : 'black';
            
            ctx.fillText(slotElement.textContent, x, y+3);
        }
    });

    // 獲取輸入的文字
    const inputText = document.getElementById('textInput').value.trim();

    // 繪製輸入的文字
    if (inputText) {
        ctx.font = `bold ${canvasSize*0.07}px "Microsoft YaHei", "微軟正黑體", sans-serif`;
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // 文字換行處理
    // 文字換行處理
        const maxWidth = canvasSize * 0.9;
        const lineHeight = canvasSize * 0.1;
        const words = inputText.split('');
        let line = '';
        let y = canvasSize * 0.05;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, canvasSize / 2, y);
                line = words[n];
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvasSize / 2, y);
    }

    // 創建下載連結或直接顯示圖片
    try {
        const dataUrl = canvas.toDataURL('image/png');
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // 移動設備：直接在新標籤頁中打開圖片
            window.open(dataUrl, '_blank');
        } else {
            // 桌面設備：創建下載連結
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = inputText ? `${inputText}.png` : '象棋選擇.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        console.log('圖片已成功創建並觸發下載或顯示');
    } catch (error) {
        console.error('創建或下載圖片時出錯:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeChessBoard();
    
    document.getElementById('resetBtn').onclick = resetSelection;
    document.getElementById('undoBtn').onclick = undoLastSelection;
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.onclick = function() {
            console.log('保存按鈕被點擊');
            saveAsImage();
        };
    } else {
        console.error('未找到保存按鈕');
    }
    
    document.addEventListener('keydown', (event) => {
        const index = keyMapping.indexOf(event.key.toUpperCase());
        if (index !== -1) {
            selectPiece(index);
        }
    });

    // 添加觸摸事件支持
    const chessBoard = document.getElementById('chessBoard');
    if (chessBoard) {
        chessBoard.addEventListener('touchstart', function(e) {
            e.preventDefault(); // 防止觸摸事件的默認行為
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('chess-piece')) {
                const index = parseInt(element.dataset.index);
                selectPiece(index);
            }
        }, false);
    }
});
