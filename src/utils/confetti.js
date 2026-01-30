import confetti from 'canvas-confetti';

// Fire confetti celebration
export const fireConfetti = () => {
    // First burst - center
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Second burst - left side
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
    }, 200);

    // Third burst - right side
    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 400);
};

// Fire confetti for task completion
export const fireTaskConfetti = () => {
    confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
    });
};

// Fire confetti for milestone (stage completion)
export const fireMilestoneConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#3b82f6', '#8b5cf6', '#ec4899']
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#3b82f6', '#8b5cf6', '#ec4899']
        });
    }, 250);
};

// Fire confetti for university lock
export const fireUniversityConfetti = () => {
    const colors = ['#10b981', '#059669', '#34d399'];

    confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: colors
    });

    setTimeout(() => {
        confetti({
            particleCount: 50,
            angle: 60,
            spread: 80,
            origin: { x: 0, y: 0.5 },
            colors: colors
        });
        confetti({
            particleCount: 50,
            angle: 120,
            spread: 80,
            origin: { x: 1, y: 0.5 },
            colors: colors
        });
    }, 300);
};

// Fire realistic confetti (for big achievements)
export const fireRealisticConfetti = () => {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
        confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
        });
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
};
