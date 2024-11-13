export interface IParticle {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  speed: number;
  orbitAngle: number; // Angle of the orbit
  orbitSpeed: number; // Speed of the orbit
}

export interface IParticleProps {
  particles: IParticle[];
  numParticles: number;
}

export const particleEffect = (ts: number, ctx: CanvasRenderingContext2D, propertybag: IParticleProps) => {
  const { particles, numParticles } = propertybag;

  // Create particles if necessary
  while (particles.length < numParticles) {
    const x = Math.random() * ctx.canvas.width;
    const y = Math.random() * ctx.canvas.height;
    const z = Math.random() * 100; // Example z-coordinate
    const radius = 5 + Math.random() * 10;
    const color = `hsl(0, 0%, ${Math.random() * 100}%)`;
    const speed = 1 + Math.random() * 3;
    const offset = Math.random() * Math.PI * 2; // Random offset for the sine wave

    particles.push({ x, y, z, radius, color, speed,
      orbitAngle: Math.random() * Math.PI * 2, 
      orbitSpeed: (Math.random() - 0.5) * 0.1 
     });
  }

  // Update and draw each particle
  particles.forEach(particle => {

 particle.x += particle.speed * Math.cos(particle.orbitAngle); // Move in orbit
  particle.y += particle.speed * Math.sin(particle.orbitAngle); // Move in orbit
  particle.orbitAngle += particle.orbitSpeed; // Update orbit angle

    // Wrap around the screen
    if (particle.x > ctx.canvas.width + particle.radius) {
      particle.x = -particle.radius;
    }

    // Calculate size based on z-coordinate (perspective effect)
    const size = particle.radius / (1 + particle.z * 0.01); 

    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10; 
    ctx.shadowOffsetX = 5; 
    ctx.shadowOffsetY = 5; 
  
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  
    // Reset shadow properties (optional, to avoid affecting other elements)
    ctx.shadowColor = "transparent"; 
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  });
};

export const particleProps: IParticleProps = {
  particles: [],
  numParticles: 50, // Number of particles
};

