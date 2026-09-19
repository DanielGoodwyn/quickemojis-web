// App state
let isPage2Active = false;
let toastTimeout = null;

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const emojiGrid = document.getElementById('emoji-grid');
const scrubberArea = document.getElementById('scrubber-area');
const toast = document.getElementById('toast');
const toastEmoji = document.getElementById('toast-emoji');
const page2 = document.getElementById('page2');
const randomCircle = document.getElementById('random-circle');
const randomEmojiEl = document.getElementById('random-emoji');

// Initialize Grid
function initGrid() {
  const fragment = document.createDocumentFragment();
  emojiData.forEach(item => {
    const el = document.createElement('div');
    el.className = 'emoji-item';
    el.textContent = item.emoji;
    
    // Tap event
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent swipe logic if needed
      
      // Copy to clipboard
      navigator.clipboard.writeText(item.emoji).catch(err => console.error('Failed to copy', err));
      
      showToast(item.emoji);
      speak(item.name);
    });
    
    fragment.appendChild(el);
  });
  emojiGrid.appendChild(fragment);
}

// Text to Speech
function speak(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Optional: tweak voice settings here
    window.speechSynthesis.speak(utterance);
  }
}

// Toast
function showToast(emoji) {
  toastEmoji.textContent = emoji;
  toast.classList.add('show');
  
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1500);
}

// Scrubber Logic (Percentage based scroll on black area)
let isScrubbing = false;

function handleScrub(y) {
  const height = window.innerHeight;
  // clamp y between 0 and height
  const clampedY = Math.max(0, Math.min(y, height));
  const percentage = clampedY / height;
  
  const maxScroll = gridContainer.scrollHeight - gridContainer.clientHeight;
  gridContainer.scrollTop = maxScroll * percentage;
}

scrubberArea.addEventListener('touchstart', (e) => {
  // Only scrub if touching the black area (not the white grid container)
  if (e.target === scrubberArea) {
    isScrubbing = true;
    handleScrub(e.touches[0].clientY);
    e.preventDefault(); // prevent default scroll
  }
}, { passive: false });

scrubberArea.addEventListener('touchmove', (e) => {
  if (isScrubbing) {
    handleScrub(e.touches[0].clientY);
    e.preventDefault();
  }
}, { passive: false });

scrubberArea.addEventListener('touchend', () => {
  isScrubbing = false;
});

// Also support mouse drag for testing on desktop
scrubberArea.addEventListener('mousedown', (e) => {
  if (e.target === scrubberArea) {
    isScrubbing = true;
    handleScrub(e.clientY);
  }
});
window.addEventListener('mousemove', (e) => {
  if (isScrubbing) handleScrub(e.clientY);
});
window.addEventListener('mouseup', () => {
  isScrubbing = false;
});


// Swipe Gestures
let swipeStartX = 0;
let swipeEndX = 0;

function handleSwipeStart(x) {
  swipeStartX = x;
}

function handleSwipeEnd(x) {
  swipeEndX = x;
  const SWIPE_THRESHOLD = window.innerWidth * 0.1;
  if (swipeEndX < swipeStartX - SWIPE_THRESHOLD) {
    // Swipe Left -> Go to Page 2
    if (!isPage2Active) {
      document.body.classList.add('page2-active');
      isPage2Active = true;
      randomizePage2();
    }
  }
  if (swipeEndX > swipeStartX + SWIPE_THRESHOLD) {
    // Swipe Right -> Go to Page 1
    if (isPage2Active) {
      document.body.classList.remove('page2-active');
      isPage2Active = false;
      window.speechSynthesis.cancel(); // Stop speaking when leaving
    }
  }
}

// Touch events for swipe
document.addEventListener('touchstart', e => {
  handleSwipeStart(e.changedTouches[0].screenX);
}, { passive: true });

document.addEventListener('touchend', e => {
  handleSwipeEnd(e.changedTouches[0].screenX);
}, { passive: true });

// Mouse events for swipe
let isSwipeMouseDown = false;
document.addEventListener('mousedown', e => {
  isSwipeMouseDown = true;
  handleSwipeStart(e.screenX);
});
document.addEventListener('mouseup', e => {
  if (isSwipeMouseDown) {
    handleSwipeEnd(e.screenX);
    isSwipeMouseDown = false;
  }
});

// Keyboard navigation for desktop testing
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    if (!isPage2Active) {
      document.body.classList.add('page2-active');
      isPage2Active = true;
      randomizePage2();
    }
  } else if (e.key === 'ArrowLeft') {
    if (isPage2Active) {
      document.body.classList.remove('page2-active');
      isPage2Active = false;
      window.speechSynthesis.cancel();
    }
  }
});

// Page 2 Logic
function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 30;
  const lightness = 40 + Math.random() * 20;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function randomizePage2() {
  // Background
  page2.style.backgroundColor = getRandomColor();
  
  // Circle
  const w = window.innerWidth;
  const h = window.innerHeight;
  const minSize = 100;
  const maxSize = Math.min(w, h) * 0.8;
  const size = minSize + Math.random() * (maxSize - minSize);
  
  const maxX = w - size;
  const maxY = h - size;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  
  randomCircle.style.width = `${size}px`;
  randomCircle.style.height = `${size}px`;
  randomCircle.style.left = `${x}px`;
  randomCircle.style.top = `${y}px`;
  randomCircle.style.backgroundColor = getRandomColor();
  
  // Emoji
  const randomItem = emojiData[Math.floor(Math.random() * emojiData.length)];
  randomEmojiEl.textContent = randomItem.emoji;
  randomEmojiEl.style.fontSize = `${size * 0.6}px`; // scale to fit
  
  // Speak
  speak(randomItem.name);
}

// Ensure circle doesn't get lost on window resize or orientation change
window.addEventListener('resize', () => {
  if (isPage2Active) {
    randomizePage2();
  }
});

randomCircle.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent swipe inference
  randomizePage2();
});

// Init
initGrid();
