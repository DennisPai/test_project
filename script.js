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
let selectedPieces = [[], [], []]; // 為每個十字圖形準備一個陣列
let remainingPieces = [];
let currentPatternIndex = 0; // 當前正在填充的圖形索引

function createCrossPattern(index) {
    const selectionArea = document.createElement('div');
    selectionArea.className = 'selection-area';
    selectionArea.dataset.patternIndex = index;

    // 創建5個槽位
    for (let i = 1; i <= 5; i++) {
        const slot = document.createElement('div');
        slot.id = `slot-${i}-pattern-${index}`;
        slot.className = 'selection-slot';
        selectionArea.appendChild(slot);
    }

    return selectionArea;
}

function updateCrossPatterns() {
    const container = document.getElementById('crossPatternsContainer');
    container.innerHTML = '';
    const count = parseInt(document.getElementById('hexagramCount').value);
    
    for (let i = 0; i < count; i++) {
        container.appendChild(createCrossPattern(i));
    }
    updateSelectionArea();
}

function initializeChessBoard() {
    const chessBoard = document.getElementById('chessBoard');
    chessBoard.innerHTML = '';
    remainingPieces = JSON.parse(JSON.stringify(chessPieces));
    selectedPieces = Array(3).fill().map(() => []); // 重置所有圖形的選擇
    currentPatternIndex = 0;

    chessPieces.forEach((piece, index) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = `chess-piece ${piece.color}-piece`;
        pieceElement.textContent = piece.name;
        pieceElement.dataset.index = index;
        pieceElement.onclick = () => selectPiece(index);
        chessBoard.appendChild(pieceElement);
    });

    updateCrossPatterns();
}

function selectPiece(index) {
    const piece = remainingPieces[index];
    const hexagramCount = parseInt(document.getElementById('hexagramCount').value);

    if (piece && piece.limit > 0) {
        // 找到當前應該填充的圖形
        while (currentPatternIndex < hexagramCount && selectedPieces[currentPatternIndex].length >= 5) {
            currentPatternIndex++;
        }

        if (currentPatternIndex < hexagramCount) {
            selectedPieces[currentPatternIndex].push({...piece});
            updateSelectionArea();
            piece.limit--;
            if (piece.limit === 0) {
                document.querySelector(`.chess-piece[data-index="${index}"]`).style.visibility = 'hidden';
            }
        }
    }
}

function updateSelectionArea() {
    const hexagramCount = parseInt(document.getElementById('hexagramCount').value);
    
    for (let patternIndex = 0; patternIndex < hexagramCount; patternIndex++) {
        const pattern = selectedPieces[patternIndex];
        for (let slot = 1; slot <= 5; slot++) {
            const slotElement = document.getElementById(`slot-${slot}-pattern-${patternIndex}`);
            if (slotElement) {
                if (pattern[slot - 1]) {
                    slotElement.textContent = pattern[slot - 1].name;
                    slotElement.className = `selection-slot ${pattern[slot - 1].color}-piece`;
                } else {
                    slotElement.textContent = '';
                    slotElement.className = 'selection-slot';
                }
            }
        }
    }
}

function resetSelection() {
    selectedPieces = Array(3).fill().map(() => []);
    currentPatternIndex = 0;
    initializeChessBoard();
}

function undoLastSelection() {
    // 從最後一個有選擇的圖形開始撤銷
    for (let i = 2; i >= 0; i--) {
        if (selectedPieces[i].length > 0) {
            const lastPiece = selectedPieces[i].pop();
            const index = chessPieces.findIndex(p => p.name === lastPiece.name && p.color === lastPiece.color);
            remainingPieces[index].limit++;
            document.querySelector(`.chess-piece[data-index="${index}"]`).style.visibility = 'visible';
            
            // 更新當前圖形索引
            if (i === currentPatternIndex && selectedPieces[i].length === 4) {
                // 如果撤銷的是當前圖形的最後一個位置，不需要改變currentPatternIndex
            } else {
                currentPatternIndex = Math.min(i, currentPatternIndex);
            }
            break;
        }
    }
    updateSelectionArea();
}

function saveAsImage() {
    const canvas = document.getElementById('captureCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const hexagramCount = parseInt(document.getElementById('hexagramCount').value);
    
    // 調整canvas大小以適應多個圖形
    const scale = 10;
    const singleWidth = 500;
    const height = 500;
    canvas.width = singleWidth * hexagramCount * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    
    // 設置canvas背景
    ctx.fillStyle = '#D2D2D2';
    ctx.fillRect(0, 0, singleWidth * hexagramCount, height);
    
    // 為每個圖形定義位置
    const patterns = [];
    for (let i = 0; i < hexagramCount; i++) {
        patterns.push([
            {x: 250 + (i * singleWidth), y: 300},  // 中
            {x: 130 + (i * singleWidth), y: 300},  // 左
            {x: 370 + (i * singleWidth), y: 300},  // 右
            {x: 250 + (i * singleWidth), y: 180},  // 上
            {x: 250 + (i * singleWidth), y: 420}   // 下
        ]);
    }
    
    // 繪製每個圖形
    for (let patternIndex = 0; patternIndex < hexagramCount; patternIndex++) {
        const pattern = selectedPieces[patternIndex];
        pattern.forEach((piece, slotIndex) => {
            if (piece) {
                const {x, y} = patterns[patternIndex][slotIndex];
                
                // 繪製圓形背景
                ctx.beginPath();
                ctx.arc(x, y, 45, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.strokeStyle = piece.color;
                ctx.lineWidth = 3;
                ctx.stroke();

                // 繪製文字
                ctx.font = 'bold 50px "Microsoft YaHei", "微軟正黑體", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = piece.color;
                ctx.fillText(piece.name, x, y + 3);
            }
        });
    }

    // 獲取並繪製輸入的文字
    const inputText = document.getElementById('textInput').value.trim();
    if (inputText) {
        ctx.font = 'bold 35px "Microsoft YaHei", "微軟正黑體", sans-serif';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // 文字換行處理
        const maxWidth = 450 * hexagramCount; // 根據圖形數量調整最大寬度
        const lineHeight = 50;
        const words = inputText.split('');
        let line = '';
        let y = 25;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, (singleWidth * hexagramCount) / 2, y);
                line = words[n];
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, (singleWidth * hexagramCount) / 2, y);
    }

    // 根據設備類型選擇適當的下載方法
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = inputText ? `${inputText}.png` : '象棋選擇.png';
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    } else {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = inputText ? `${inputText}.png` : '象棋選擇.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('創建或下載圖片時出錯:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeChessBoard();
    
    document.getElementById('resetBtn').onclick = resetSelection;
    document.getElementById('undoBtn').onclick = undoLastSelection;
    document.getElementById('hexagramCount').onchange = function() {
        resetSelection();
    };
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.onclick = saveAsImage;
    }
    
    document.addEventListener('keydown', (event) => {
        const index = keyMapping.indexOf(event.key.toUpperCase());
        if (index !== -1) {
            selectPiece(index);
        }
    });
});
