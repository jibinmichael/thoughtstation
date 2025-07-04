// Kawaii Canvas - Pure JavaScript Version
// Main application logic

class KawaiiCanvas {
    constructor() {
        this.showTopToolbar = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupColors();
    }

    setupEventListeners() {
        // Get DOM elements
        const circleButton = document.getElementById('circleButton');
        const circle = document.getElementById('circle');
        const topToolbar = document.getElementById('topToolbar');
        const columns = document.querySelectorAll('.column');

        // Circle button click handler
        if (circleButton) {
            circleButton.addEventListener('click', () => {
                // Remove active class from all columns
                columns.forEach(c => c.classList.remove('active'));
                // Add active class to circle
                circle.classList.add('active');
                
                // Same behavior as other columns
                if (this.showTopToolbar) {
                    // Already open, do quick transition
                    this.quickTransition();
                } else {
                    // Not open, just open it
                    this.openTopToolbar();
                }
                this.randomizeColors();
            });
        }

        // Column click handlers for different behaviors
        columns.forEach(column => {
            column.addEventListener('click', (e) => {
                // Make sure we handle clicks on child elements too
                e.stopPropagation();
                
                // Remove active class from all columns
                columns.forEach(c => c.classList.remove('active'));
                // Add active class to clicked column
                column.classList.add('active');
                
                // If marker column, do nothing (no top toolbar)
                if (column.classList.contains('marker')) {
                    return;
                }
                
                // Check if it's sticky note column - show color picker
                if (column.classList.contains('sticky-note')) {
                    // Show color picker in top toolbar with same behavior as other columns
                    if (this.showTopToolbar) {
                        // Already open, do quick transition
                        this.quickTransition();
                    } else {
                        // Not open, just open it
                        this.openTopToolbar();
                    }
                    this.waitingForStickyNoteColor = true;
                    
                    // Hide paper style circles and separator when selecting sticky note color
                    const paperCircles = document.querySelector('.paper-style-circles');
                    const separator = document.querySelector('.panel-separator');
                    if (paperCircles) paperCircles.style.display = 'none';
                    if (separator) separator.style.display = 'none';
                } 
                // Check if it's washi-tape column (Pomodoro Timer)
                else if (column.classList.contains('washi-tape')) {
                    this.createPomodoroWidget();
                    this.closeTopToolbar();
                }
                // Check if it's columns that should close top toolbar
                else if (column.classList.contains('todo') || 
                    column.classList.contains('sticker') || 
                    column.classList.contains('image')) {
                    this.closeTopToolbar();
                } else {
                    // Only circle columns open top toolbar
                    if (this.showTopToolbar) {
                        // Already open, do quick transition
                        this.quickTransition();
                    } else {
                        // Not open, just open it
                        this.openTopToolbar();
                    }
                    this.randomizeColors();
                }
            });
        });

        // Color circle click handlers
        const colorCircles = document.querySelectorAll('.color-circle');
        colorCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                // Remove selected class from all circles
                colorCircles.forEach(c => c.classList.remove('selected'));
                // Add selected class to clicked circle
                circle.classList.add('selected');
                
                // If waiting for sticky note color, create sticky note with this color
                if (this.waitingForStickyNoteColor) {
                    const selectedColor = window.getComputedStyle(circle).backgroundColor;
                    this.createStickyNote(selectedColor);
                    this.waitingForStickyNoteColor = false;
                    this.closeTopToolbar();
                    
                    // Remove active state from sticky note column
                    const stickyNoteColumn = document.querySelector('.column.sticky-note');
                    if (stickyNoteColumn) {
                        stickyNoteColumn.classList.remove('active');
                    }
                }
                

            });
        });

    }

    openTopToolbar() {
        const topToolbar = document.getElementById('topToolbar');
        const bottomToolbar = document.querySelector('.toolbar-bottom');
        
        if (!topToolbar || !bottomToolbar) return;

        this.showTopToolbar = true;
        topToolbar.style.pointerEvents = 'auto';
        topToolbar.classList.add('active');
        bottomToolbar.classList.add('depth-shadow');


    }

    closeTopToolbar() {
        const topToolbar = document.getElementById('topToolbar');
        const bottomToolbar = document.querySelector('.toolbar-bottom');
        
        if (!topToolbar || !bottomToolbar) return;

        // Start the slide-down animation
        topToolbar.classList.remove('active');
        bottomToolbar.classList.remove('depth-shadow');
        
        // Restore paper circles and separator visibility
        const paperCircles = document.querySelector('.paper-style-circles');
        const separator = document.querySelector('.panel-separator');
        if (paperCircles) paperCircles.style.display = '';
        if (separator) separator.style.display = '';
        
        // Wait for animation to complete before updating state
        setTimeout(() => {
            this.showTopToolbar = false;
            topToolbar.style.pointerEvents = 'none';
        }, 300);


    }

    quickTransition() {
        const topToolbar = document.getElementById('topToolbar');
        
        if (!topToolbar) return;

        // Simple slide out and slide in
        topToolbar.classList.remove('active');
        
        setTimeout(() => {
            topToolbar.classList.add('active');
        }, 150);


    }

    randomizeColors() {
        const colorCircles = document.querySelectorAll('.color-circle');
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
            '#F9E79F', '#ABEBC6', '#FAD7A0', '#AED6F1', '#D5A6BD'
        ];
        
        colorCircles.forEach(circle => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            circle.style.backgroundColor = randomColor;
        });
        

    }

    setupColors() {
        // Initialize default canvas background color
        document.documentElement.style.setProperty('--canvas-bg-color', '#f5f5f5');
    }

    // Utility method to add kawaii animations
    addKawaiiAnimation(element, animationType = 'float') {
        if (!element) return;
        
        element.classList.add(`${animationType}-animation`);
        
        // Remove animation after it completes
        setTimeout(() => {
            element.classList.remove(`${animationType}-animation`);
        }, 3000);
    }



    // ============================================
    // STICKY NOTE FUNCTIONALITY
    // ============================================

    createStickyNote(color = '#FFE66D') {
        const canvas = document.querySelector('.canvas-background');
        
        // Create sticky note element
        const stickyNote = document.createElement('div');
        stickyNote.className = 'sticky-note-element';
        stickyNote.style.backgroundColor = color;
        stickyNote.style.height = '54px'; // Initial height: 22px text + 32px padding
        
        // Position in center of viewport
        const centerX = window.innerWidth / 2 - 90; // Half of 180px width
        const centerY = window.innerHeight / 2 - 27; // Half of 54px height
        
        stickyNote.style.left = `${centerX}px`;
        stickyNote.style.top = `${centerY}px`;
        
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'sticky-note-textarea';
        textarea.placeholder = 'Type your note here...';
        textarea.style.height = '22px'; // Start with single line height
        
        // Add textarea to sticky note
        stickyNote.appendChild(textarea);
        
        // Add to canvas
        canvas.appendChild(stickyNote);
        
        // Focus textarea and add blue border
        setTimeout(() => {
            textarea.focus();
            stickyNote.classList.add('focused');
        }, 100);
        
        // Setup event listeners
        this.setupStickyNoteEvents(stickyNote, textarea);
        

    }

    setupStickyNoteEvents(stickyNote, textarea) {
        // Handle focus/blur for blue border
        textarea.addEventListener('focus', () => {
            stickyNote.classList.add('focused');
        });
        
        textarea.addEventListener('blur', () => {
            stickyNote.classList.remove('focused');
        });
        
        // Handle auto-resize and font adjustment
        textarea.addEventListener('input', () => {
            this.adjustStickyNoteSize(stickyNote, textarea);
        });
        
        // Initial size adjustment after DOM is ready
        requestAnimationFrame(() => {
            this.adjustStickyNoteSize(stickyNote, textarea);
        });
        
        // Handle delete functionality - multiple ways to delete
        textarea.addEventListener('keydown', (e) => {
            // Delete note when Backspace is pressed and textarea is empty
            if (e.key === 'Backspace' && textarea.value.trim() === '') {
                stickyNote.remove();
                e.preventDefault();
            }
            // Or delete with Ctrl/Cmd + D
            else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                stickyNote.remove();
                e.preventDefault();
            }
        });
        
        // Double-click on sticky note (not textarea) to delete
        stickyNote.addEventListener('dblclick', (e) => {
            if (e.target !== textarea) {
                stickyNote.remove();
            }
        });
        
        // Make draggable (only when not editing)
        this.makeDraggable(stickyNote, textarea);
    }

    adjustStickyNoteSize(stickyNote, textarea) {
        // Simple, predictable approach
        const content = textarea.value || '';
        const lines = content.split('\n');
        const longestLine = lines.reduce((max, line) => line.length > max.length ? line : max, '');
        
        // Fixed values we know work
        const charWidth = 8; // Approximate for DM Sans 14px
        const maxCharsPerLine = 18; // 148px width / 8px per char
        
        // Font size adjustment
        if (longestLine.length > maxCharsPerLine) {
            const fontSize = Math.max(10, 14 * (maxCharsPerLine / longestLine.length));
            textarea.style.fontSize = `${fontSize}px`;
        } else {
            textarea.style.fontSize = '14px';
        }
        
        // Get line metrics
        const fontSize = parseFloat(textarea.style.fontSize);
        const lineHeight = fontSize * 1.6; // From CSS line-height: 1.6
        
        // Count visual lines (physical lines + wrapped lines)
        let totalLines = 0;
        lines.forEach(line => {
            if (line.length === 0) {
                totalLines += 1; // Empty line counts as 1
            } else {
                // Calculate wrapped lines
                const wrappedLines = Math.ceil(line.length / maxCharsPerLine);
                totalLines += wrappedLines;
            }
        });
        
        // Minimum 1 line for compact notes
        totalLines = Math.max(1, totalLines);
        
        // Calculate heights
        const textHeight = Math.ceil(totalLines * lineHeight);
        const containerHeight = textHeight + 32; // 16px padding top + bottom
        
        // Apply constraints
        if (containerHeight <= 300) {
            stickyNote.style.height = `${containerHeight}px`;
            textarea.style.height = `${textHeight}px`;
            textarea.style.overflowY = 'hidden';
        } else {
            stickyNote.style.height = '300px';
            textarea.style.height = '268px';
            textarea.style.overflowY = 'auto';
        }
    }

    makeDraggable(stickyNote, textarea) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        
        // Start dragging
        stickyNote.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on textarea
            if (e.target === textarea) {
                return;
            }
            
            isDragging = true;
            offsetX = e.clientX - stickyNote.offsetLeft;
            offsetY = e.clientY - stickyNote.offsetTop;
            
            // Change cursor and bring to front
            stickyNote.style.cursor = 'grabbing';
            stickyNote.style.zIndex = '1000';
            
            e.preventDefault();
        });
        
        // Handle dragging
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            // Keep within viewport bounds
            const maxX = window.innerWidth - stickyNote.offsetWidth;
            const maxY = window.innerHeight - stickyNote.offsetHeight;
            
            stickyNote.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            stickyNote.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        });
        
        // Stop dragging
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                stickyNote.style.cursor = 'move';
                stickyNote.style.zIndex = '10';
            }
        });
    }

    // ============================================
    // POMODORO WIDGET FUNCTIONALITY
    // ============================================

    createPomodoroWidget() {
        console.log('createPomodoroWidget called');
        const canvas = document.querySelector('.canvas-background');
        // Remove any existing widget (but do NOT return)
        const existingWidget = document.querySelector('.pomodoro-widget');
        if (existingWidget) {
            existingWidget.remove();
        }
        
        // Create pomodoro widget element
        const pomodoroWidget = document.createElement('div');
        pomodoroWidget.className = 'pomodoro-widget';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'pomodoro-header';
        
        const title = document.createElement('div');
        title.className = 'pomodoro-title';
        title.textContent = 'Focus Timer';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pomodoro-close-btn';
        closeBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="5" x2="15" y2="15" stroke="#666" stroke-width="1" stroke-linecap="round"/><line x1="15" y1="5" x2="5" y2="15" stroke="#666" stroke-width="1" stroke-linecap="round"/></svg>`;
        closeBtn.addEventListener('click', () => {
            pomodoroWidget.remove();
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Create body
        const body = document.createElement('div');
        body.className = 'pomodoro-body';
        
        // Timer container
        const timerContainer = document.createElement('div');
        timerContainer.className = 'pomodoro-timer-container';
        
        // Timer wrapper for proper positioning
        const timerWrapper = document.createElement('div');
        timerWrapper.style.position = 'relative';
        timerWrapper.style.display = 'inline-block';
        
        // Background LED segments
        const timerBackground = document.createElement('div');
        timerBackground.className = 'pomodoro-timer-background';
        timerBackground.textContent = '88:88';
        
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'pomodoro-timer-display';
        timerDisplay.textContent = '00:00';
        
        timerWrapper.appendChild(timerBackground);
        timerWrapper.appendChild(timerDisplay);
        timerContainer.appendChild(timerWrapper);
        
        // Controls row (only +5 min button) - inside timer container
        const controlsRow = document.createElement('div');
        controlsRow.className = 'pomodoro-timer-controls-row';
        
        // +5 min button
        const add5MinBtn = document.createElement('button');
        add5MinBtn.className = 'pomodoro-add-5min-btn';
        add5MinBtn.textContent = '+5 min';
        controlsRow.appendChild(add5MinBtn);
        
        timerContainer.appendChild(controlsRow);
        body.appendChild(timerContainer);
        
        // Vinyl Player Row
        const vinylRow = document.createElement('div');
        vinylRow.className = 'pomodoro-vinyl-row';
        
        // Vinyl Player
        const vinylPlayer = document.createElement('div');
        vinylPlayer.className = 'vinyl-player';
        
        const album = document.createElement('div');
        album.className = 'album';
        
        const tonearm = document.createElement('div');
        tonearm.className = 'vinyl-tonearm';
        
        vinylPlayer.appendChild(album);
        vinylPlayer.appendChild(tonearm);
        
        vinylRow.appendChild(vinylPlayer);
        body.appendChild(vinylRow);
        
        // Music Controls Row (soundscape circles, centered)
        const musicControls = document.createElement('div');
        musicControls.className = 'pomodoro-music-controls';
        
        // Soundscape Circles Container
        const soundscapeCircles = document.createElement('div');
        soundscapeCircles.className = 'soundscape-circles';
        
        const soundscapes = [
            { name: 'Rain', emoji: '🌧️' },
            { name: 'Forest', emoji: '🌲' },
            { name: 'Ocean', emoji: '🌊' },
            { name: 'Fire', emoji: '🔥' },
            { name: 'Birds', emoji: '🐦' }
        ];
        
        let selectedSoundscape = null;
        
        soundscapes.forEach((sound, index) => {
            const circle = document.createElement('div');
            circle.className = 'soundscape-circle';
            if (index === 0) {
                circle.classList.add('selected');
                selectedSoundscape = circle;
            }
            circle.textContent = sound.emoji;
            
            // Add tooltip
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = sound.name;
            circle.appendChild(tooltip);
            
            circle.addEventListener('click', () => {
                // Remove selected class from all circles
                document.querySelectorAll('.soundscape-circle').forEach(c => c.classList.remove('selected'));
                // Add selected class to clicked circle
                circle.classList.add('selected');
                selectedSoundscape = circle;
            });
            
            soundscapeCircles.appendChild(circle);
        });
        
        // Music Play Button (for music control)
        const musicPlayBtn = document.createElement('button');
        musicPlayBtn.className = 'music-play-btn';
        musicPlayBtn.style.display = 'none'; // Hidden but functional
        musicPlayBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="5,3 13,8 5,13" fill="white"/></svg>`;
        
        musicControls.appendChild(soundscapeCircles);
        musicControls.appendChild(musicPlayBtn);
        body.appendChild(musicControls);
        
        // Focus Timer Controls
        const focusControls = document.createElement('div');
        focusControls.className = 'focus-timer-controls';
        
        // Start button
        const startBtn = document.createElement('button');
        startBtn.className = 'focus-start-btn';
        startBtn.textContent = 'Start Focus Timer';
        
        // Pause button
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'focus-pause-btn';
        pauseBtn.textContent = 'Pause';
        pauseBtn.style.display = 'none';
        
        // Stop button
        const stopBtn = document.createElement('button');
        stopBtn.className = 'focus-stop-btn';
        stopBtn.textContent = 'Stop';
        stopBtn.style.display = 'none';
        
        focusControls.appendChild(startBtn);
        focusControls.appendChild(pauseBtn);
        focusControls.appendChild(stopBtn);
        body.appendChild(focusControls);
        
        // Assemble widget
        pomodoroWidget.appendChild(header);
        pomodoroWidget.appendChild(body);
        
        // Add to canvas
        canvas.appendChild(pomodoroWidget);
        
        // Timer logic
        let timerSeconds = 300; // Default 5 minutes
        let timerInterval = null;
        let isRunning = false;
        let originalTitle = document.title;
        let tickPlayed = false;
        
        // Create audio elements for sounds
        const tickAudio = new Audio('https://www.soundjay.com/misc/sounds/clock-ticking-4.wav');
        const completeAudio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
        tickAudio.volume = 0.3;
        completeAudio.volume = 0.5;
        
        function updateTimerDisplay() {
            const min = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
            const sec = (timerSeconds % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${min}:${sec}`;
            
            // Update browser tab title when timer is running
            if (isRunning) {
                document.title = `${min}:${sec} - Focus Timer`;
                
                // Play tick sound when 10 seconds remaining (only once)
                if (timerSeconds === 10 && !tickPlayed) {
                    tickAudio.play().catch(() => {}); // Ignore audio errors
                    tickPlayed = true;
                }
            } else {
                document.title = originalTitle;
            }
        }
        
        add5MinBtn.addEventListener('click', () => {
            timerSeconds += 300;
            updateTimerDisplay();
        });
        
        // Focus Timer Controls
        startBtn.addEventListener('click', () => {
            if (timerSeconds === 0) return;
            isRunning = true;
            startBtn.style.display = 'none';
            pauseBtn.style.display = '';
            stopBtn.style.display = '';
            vinylPlayer.classList.add('playing'); // Start spinning
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    // Timer completed
                    clearInterval(timerInterval);
                    isRunning = false;
                    completeAudio.play().catch(() => {}); // Play completion sound
                    
                    // Auto-reset to 5 minutes
                    timerSeconds = 300;
                    updateTimerDisplay();
                    
                    // Reset UI
                    startBtn.style.display = '';
                    startBtn.textContent = 'Start Focus Timer';
                    pauseBtn.style.display = 'none';
                    stopBtn.style.display = 'none';
                    vinylPlayer.classList.remove('playing'); // Stop spinning
                    tickPlayed = false; // Reset tick flag
                    document.title = originalTitle; // Reset title
                }
            }, 1000);
        });
        
        pauseBtn.addEventListener('click', () => {
            if (isRunning) {
                isRunning = false;
                clearInterval(timerInterval);
                pauseBtn.textContent = 'Resume';
                vinylPlayer.classList.remove('playing'); // Stop spinning
            } else {
                isRunning = true;
                pauseBtn.textContent = 'Pause';
                vinylPlayer.classList.add('playing'); // Resume spinning
                timerInterval = setInterval(() => {
                    if (timerSeconds > 0) {
                        timerSeconds--;
                        updateTimerDisplay();
                    } else {
                        clearInterval(timerInterval);
                        isRunning = false;
                        startBtn.style.display = '';
                        startBtn.textContent = 'Start Focus Timer';
                        pauseBtn.style.display = 'none';
                        stopBtn.style.display = 'none';
                        vinylPlayer.classList.remove('playing'); // Stop spinning
                        tickPlayed = false; // Reset tick flag
                        document.title = originalTitle; // Reset title
                    }
                }, 1000);
            }
        });
        
        stopBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            timerSeconds = 0;
            updateTimerDisplay();
            isRunning = false;
            startBtn.style.display = '';
            startBtn.textContent = 'Start Focus Timer';
            pauseBtn.style.display = 'none';
            pauseBtn.textContent = 'Pause';
            stopBtn.style.display = 'none';
            vinylPlayer.classList.remove('playing'); // Stop spinning
            tickPlayed = false; // Reset tick flag
            document.title = originalTitle; // Reset title
        });
        
        updateTimerDisplay();
        
        console.log('Pomodoro widget created');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kawaiiCanvas = new KawaiiCanvas();
});

// Add some fun console messages
console.log(`
🌸✨ Welcome to Kawaii Canvas! ✨🌸
     Pure HTML/CSS/JS Version
     
Features:
- Click the circle to toggle top toolbar
- Beautiful kawaii design
- Lightweight and fast
- No dependencies!

Made with 💖 and lots of ☕
`);

// Add keyboard shortcuts for fun
document.addEventListener('keydown', (e) => {
    // Space bar toggles toolbar
    if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        // Same as circle button click
        if (window.kawaiiCanvas.showTopToolbar) {
            window.kawaiiCanvas.quickTransition();
        } else {
            window.kawaiiCanvas.openTopToolbar();
        }
        window.kawaiiCanvas.randomizeColors();
    }
    
    // Escape key hides toolbar
    if (e.code === 'Escape') {
        const topToolbar = document.getElementById('topToolbar');
        const bottomToolbar = document.querySelector('.toolbar-bottom');
        const columns = document.querySelectorAll('.column');
        const circle = document.getElementById('circle');
        
        if (topToolbar && bottomToolbar) {
            topToolbar.classList.remove('active');
            bottomToolbar.classList.remove('depth-shadow');
            // Remove active class from all columns and circle
            columns.forEach(c => c.classList.remove('active'));
            if (circle) circle.classList.remove('active');
            window.kawaiiCanvas.showTopToolbar = false;
        }
    }
});

// Add some easter egg functionality
let clickCount = 0;
document.addEventListener('click', () => {
    clickCount++;
    if (clickCount === 10) {
        window.kawaiiCanvas.showKawaiiMessage('You found an easter egg! 🥚✨');
        clickCount = 0;
    }
});

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KawaiiCanvas;
} 