// Simple confetti function
window.confetti = function(options) {
  options = options || {};
  
  // Defaults
  const count = options.particleCount || 150;
  const spread = options.spread || 70;
  const originY = options.origin?.y || 0.7;
  const colors = options.colors || ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  // Create canvas element if it doesn't exist
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
  }

  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  
  // Particle class
  class Particle {
    constructor() {
      this.x = canvas.width * 0.5;
      this.y = canvas.height * originY;
      this.size = Math.random() * 10 + 5;
      this.speedX = Math.random() * spread - spread/2;
      this.speedY = Math.random() * -10 - 10;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = 1;
      this.gravity = 0.5;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 10 - 5;
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.opacity -= 0.01;
      this.rotation += this.rotationSpeed;
    }
    
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      ctx.restore();
    }
  }
  
  // Create particles
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, index) => {
      particle.update();
      particle.draw();
      
      if (particle.opacity <= 0) {
        particles.splice(index, 1);
      }
    });
    
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      // Clean up when animation is done
      document.body.removeChild(canvas);
    }
  }
  
  // Start animation
  animate();
  
  // Play success sound if available
  try {
    const audio = new Audio('/sounds/success.mp3');
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(e => console.log('No se pudo reproducir el sonido', e));
    }
  } catch (e) {
    console.log('Sonido no disponible');
  }
};
