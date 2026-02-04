// Sound Service for MythicBot
// Manages game sound effects based on user settings

class SoundService {
    constructor() {
        // Use Web Audio API for better control
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;

        // Sound definitions using oscillator-based synthesis (no external files needed)
        this.soundConfigs = {
            diceRoll: { type: 'dice', duration: 0.3 },
            critical: { type: 'success', duration: 0.5 },
            fumble: { type: 'fail', duration: 0.4 },
            message: { type: 'blip', duration: 0.1 },
            click: { type: 'click', duration: 0.05 },
            levelUp: { type: 'fanfare', duration: 0.8 }
        };
    }

    init() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Generate synthetic sounds using Web Audio API
    play(soundName) {
        if (!this.enabled || !this.audioContext) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const config = this.soundConfigs[soundName];
        if (!config) return;

        try {
            switch (config.type) {
                case 'dice':
                    this.playDiceSound();
                    break;
                case 'success':
                    this.playSuccessSound();
                    break;
                case 'fail':
                    this.playFailSound();
                    break;
                case 'blip':
                    this.playBlipSound();
                    break;
                case 'click':
                    this.playClickSound();
                    break;
                case 'fanfare':
                    this.playFanfareSound();
                    break;
            }
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    // Dice roll - multiple quick clicks
    playDiceSound() {
        const now = this.audioContext.currentTime;
        for (let i = 0; i < 5; i++) {
            this.playTone(200 + Math.random() * 400, now + i * 0.05, 0.04, 'square');
        }
    }

    // Success/Critical hit - ascending tones
    playSuccessSound() {
        const now = this.audioContext.currentTime;
        this.playTone(400, now, 0.15, 'sine');
        this.playTone(500, now + 0.1, 0.15, 'sine');
        this.playTone(600, now + 0.2, 0.2, 'sine');
    }

    // Fail/Fumble - descending tones
    playFailSound() {
        const now = this.audioContext.currentTime;
        this.playTone(400, now, 0.15, 'sine');
        this.playTone(300, now + 0.1, 0.15, 'sine');
        this.playTone(200, now + 0.2, 0.2, 'sine');
    }

    // Message notification blip
    playBlipSound() {
        this.playTone(800, this.audioContext.currentTime, 0.08, 'sine');
    }

    // UI click sound
    playClickSound() {
        this.playTone(600, this.audioContext.currentTime, 0.03, 'square');
    }

    // Level up fanfare
    playFanfareSound() {
        const now = this.audioContext.currentTime;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            this.playTone(freq, now + i * 0.15, 0.2, 'sine');
        });
    }

    // Core tone generator
    playTone(frequency, startTime, duration, waveType = 'sine') {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = waveType;
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.1);
    }
}

// Singleton instance
const soundService = new SoundService();

export default soundService;
