/* =========================================
   1. 변수 선언 및 이미지 요소 가져오기
   ========================================= */
const infoIcon = document.getElementById('sub-img-1');          
const infoImage = document.getElementById('sub-img-4');         
const dragItem = document.getElementById('sub-img-3');          
const fireBody = document.getElementById('sub-img-2');          
const ignitedSrc = document.getElementById('sub-img-5').src;    
const finishFireSrc = document.getElementById('sub-img-7').src; 

const mainCake = document.getElementById('first-cake');         
const cakeFire = document.getElementById('sub-img-6');          
const wishImage = document.getElementById('sub-img-8');         

const videoElement = document.getElementById('webcam');
const wishingImage = document.getElementById('sub-img-9');        
const letterBImage = document.getElementById('sub-img-10');       
const happyBirthdayImage = document.getElementById('sub-img-12');  
const cakeFinishImage = document.getElementById('sub-img-13');     
const imageB = document.getElementById('sub-img-14');              
const img0206 = document.getElementById('sub-img-15');

/* =========================================
   2. 상태 제어 변수들
   ========================================= */
let isDragging = false; 
let isIgnited = false;       
let isCakeIgnited = false;   
let isFinishFire = false;    

let currentX, currentY, initialX, initialY;
let xOffset = 0, yOffset = 0;         

let rubFriction = 0; 
const requiredFriction = 600; 

let shakeCount = 0;          
let lastDirectionX = 0;      
const requiredShakes = 6;    

let isWishingDone = false; 
let isMainScreen3Active = false; 
let isBlownOut = false;          

/* =========================================
   3. 기본 클릭 및 드래그 인터랙션 로직
   ========================================= */

infoIcon.addEventListener('click', () => {
  if (infoImage.style.display === 'block') {
    infoImage.style.display = 'none';
    img0206.style.display = 'none';    
  } else {
    infoImage.style.display = 'block';
    img0206.style.display = 'block';   
  }
});

letterBImage.addEventListener('click', (e) => {
  if (letterBImage.classList.contains('show')) {
    e.stopPropagation(); 
    imageB.classList.add('show');
    document.body.classList.add('blurred'); 
  }
});

document.addEventListener('click', () => {
  if (imageB.classList.contains('show')) {
    imageB.classList.remove('show');
    document.body.classList.remove('blurred'); 
  }
});

document.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

function dragStart(e) {
  initialX = e.clientX - xOffset;
  initialY = e.clientY - yOffset;

  if (e.target === dragItem) {
    isDragging = true;
    dragItem.classList.add('dragging'); 
  }
}

function drag(e) {
  if (isDragging) {
    e.preventDefault(); 
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, dragItem);

    if (!isIgnited) {
      if (checkCollision(dragItem, fireBody)) {
        let movement = Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY);
        rubFriction += movement;

        if (rubFriction > requiredFriction) {
          isIgnited = true; 
          dragItem.src = ignitedSrc; 
          dragItem.style.width = "150px"; 
        }
      } else {
        rubFriction = 0;
      }
    } 
    else if (!isCakeIgnited) {
      if (checkCollision(dragItem, mainCake, 150)) {
        isCakeIgnited = true; 
        mainCake.style.display = 'none';
        cakeFire.style.display = 'block';
        wishImage.classList.add('show'); 
      }
    }
    else if (!isFinishFire) {
      let currentDirectionX = Math.sign(e.movementX);

      if (Math.abs(e.movementX) > 5) {
        if (lastDirectionX !== 0 && currentDirectionX !== lastDirectionX) {
          shakeCount++; 

          if (shakeCount >= requiredShakes) {
            isFinishFire = true; 
            dragItem.src = finishFireSrc; 
            dragItem.style.width = "115px"; 
          }
        }
        lastDirectionX = currentDirectionX; 
      }
    }
  }
}

function dragEnd(e) {
  isDragging = false;
  dragItem.classList.remove('dragging'); 
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`;
}

function checkCollision(el1, el2, margin = 0) {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();

  return !(
    rect1.top > (rect2.bottom - margin) ||
    rect1.right < (rect2.left + margin) ||
    rect1.bottom < (rect2.top + margin) ||
    rect1.left > (rect2.right - margin)
  );
}

/* =========================================
   4. MediaPipe AI 제스처 인식 설정 및 이벤트
   ========================================= */

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 2,              
  modelComplexity: 1,
  minDetectionConfidence: 0.6, 
  minTrackingConfidence: 0.6
});

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults((results) => {
  if (!wishImage.classList.contains('show') || isWishingDone) return;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
    const hand1 = results.multiHandLandmarks[0];
    const hand2 = results.multiHandLandmarks[1];

    const dx = hand1[0].x - hand2[0].x;
    const dy = hand1[0].y - hand2[0].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.15) {
      isWishingDone = true; 
      wishImage.classList.remove('show'); 
      
      setTimeout(() => {
        wishingImage.classList.add('show'); 
        
        setTimeout(() => {
          wishingImage.classList.remove('show'); 
          
          setTimeout(() => {
            // 💡 11번(bigFireImage) 코드가 정상적으로 삭제되었습니다.
            happyBirthdayImage.classList.add('show');  
            isMainScreen3Active = true; 
          }, 1000); 

        }, 4000); 

      }, 800); 
    }
  }
});

faceMesh.onResults((results) => {
  if (!isMainScreen3Active || isBlownOut) return;

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];

    const lipLeft = landmarks[61];
    const lipRight = landmarks[291];
    const eyeLeft = landmarks[33];
    const eyeRight = landmarks[263];

    const lipWidth = Math.sqrt(Math.pow(lipLeft.x - lipRight.x, 2) + Math.pow(lipLeft.y - lipRight.y, 2));
    const faceWidth = Math.sqrt(Math.pow(eyeLeft.x - eyeRight.x, 2) + Math.pow(eyeLeft.y - eyeRight.y, 2));
    const lipRatio = lipWidth / faceWidth;

    if (lipRatio < 0.28) { 
      isBlownOut = true; 
      cakeFire.style.display = 'none';       
      cakeFinishImage.classList.add('show'); 
      letterBImage.classList.add('show'); 
    }
  }
});

/* =========================================
   5. 웹캠 구동 및 프레임 전송 시작
   ========================================= */
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
    await faceMesh.send({image: videoElement}); 
  },
  width: 640,
  height: 480
});

camera.start();