import {
  CompositeEntity,
  ICompositeEntityProps,
} from '../../../src/Engine/CompositeEntity';

export interface IPart {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  force: number;
  angle: number;
  distance: number;
  friction: number;
  ease: number;
}

export interface IParticleTextEffectProps {
  text: string;
  fontSize: number;
  maxTextWidth: number;
  gap: number;
  particleHitRadius: number;
  particles: IPart[];

}

export const particleTextEffect = (
  ts: number,
  ctx: CanvasRenderingContext2D,
  propertybag: IParticleTextEffectProps,
  entity: CompositeEntity<ICompositeEntityProps<any>>
) => {
  const { particleHitRadius,text, fontSize, maxTextWidth, gap, particles } = propertybag;

  ctx.font = `${fontSize}px Bangers`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 5;
  ctx.letterSpacing = "10px";
  ctx.imageSmoothingEnabled = false;
  
  const linesArray = [];
  const words = text.split(' ');
  let line = '';
  let lineCounter = 0;

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxTextWidth) {
      linesArray[lineCounter] = line;
      line = words[i] + ' ';
      lineCounter++;
    } else {
      line = testLine;
    }
  }

  linesArray[lineCounter] = line;
  const lineHeight = fontSize * 1.2;
  const textHeight = lineHeight * lineCounter;
  const textX = ctx.canvas.width / 2;
  const textY = ctx.canvas.height / 2 - textHeight / 2;

  linesArray.forEach((el, index) => {
    ctx.fillText(el, textX, textY + (index * lineHeight));
    ctx.strokeText(el, textX, textY + (index * lineHeight));
  });

  // Convert text to particles
  if (particles.length === 0) { // Only convert to particles once
    const pixels = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    for (let y = 0; y < ctx.canvas.height; y += gap) {
      for (let x = 0; x < ctx.canvas.width; x += gap) {
        const index = (y * ctx.canvas.width + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha > 0) {
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const color = 'rgb(' + red + ',' + green + ',' + blue + ')';          
          particles.push({
            x:Math.random() * ctx.canvas.width, y:Math.random() * ctx.canvas.height, originX: x, originY: y, size: gap, color, vx: 0, vy: 0, force: 0,
            angle: 0, distance: 0, friction: Math.random() * 0.6 + 0.15, ease: Math.random() * 0.1 + 0.005
          });
        }
      }
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const ballBlockCoods = entity.findBlock<{ x: number, y: number }>("ballBlock") ;
  
  // Update and draw particles
  particles.forEach(particle => {
    const dx = ballBlockCoods!.props.x - particle.x;
    const dy = ballBlockCoods!.props.y - particle.y; 
    const distance = dx * dx + dy * dy;
    const force = -particleHitRadius / distance;
    if (distance < particleHitRadius) {
      particle.angle = Math.atan2(dy, dx);
      particle.vx += force * Math.cos(particle.angle);
      particle.vy += force * Math.sin(particle.angle);
    }
    particle.x += (particle.vx *= particle.friction) + (particle.originX - particle.x) * particle.ease;
    particle.y += (particle.vy *= particle.friction) + (particle.originY - particle.y) * particle.ease;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
};

