import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useSwipeControls } from "@/hooks/useSwipeControls";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BRICK_COLORS,
  POWERUP_SIZE,
  POWERUP_COLORS,
  BALL_SPEED,
} from "@/lib/constants";
import { LEVELS } from "@/lib/levelData";
import type { PowerUpType } from "@/types/game";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying, isPaused, paddleWidth, ballStuck, setPaddleX, releaseBall } = useGameStore();
  const { paddlePosition, isTouching } = useSwipeControls(GAME_WIDTH, paddleWidth);

  useEffect(() => {
    setPaddleX(paddlePosition);
  }, [paddlePosition, setPaddleX]);

  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!isPlaying || isPaused || !canvasRef.current) return;
    let animationId: number;

    const gameLoop = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const currentBalls = useGameStore.getState().balls;
      const stuck = useGameStore.getState().ballStuck;
      const newBalls = currentBalls.map((ball) => {
        if (stuck && ball.id === "ball-0") {
          const px = useGameStore.getState().paddleX;
          return { ...ball, x: px, y: GAME_HEIGHT - PADDLE_HEIGHT - 50 };
        }
        let { x, y, vx, vy, isMega } = ball;
        const speed = useGameStore.getState().ballSpeed;
        const mult = (speed / BALL_SPEED) * delta;
        x += vx * mult;
        y += vy * mult;
        if (x - BALL_RADIUS <= 0) { x = BALL_RADIUS; vx = Math.abs(vx); }
        if (x + BALL_RADIUS >= GAME_WIDTH) { x = GAME_WIDTH - BALL_RADIUS; vx = -Math.abs(vx); }
        if (y - BALL_RADIUS <= 0) { y = BALL_RADIUS; vy = Math.abs(vy); }
        const py = GAME_HEIGHT - PADDLE_HEIGHT - 10;
        const px = useGameStore.getState().paddleX;
        const pw = useGameStore.getState().paddleWidth;
        if (y + BALL_RADIUS >= py && y - BALL_RADIUS <= py + PADDLE_HEIGHT && x >= px - pw / 2 && x <= px + pw / 2) {
          if (useGameStore.getState().catchMode && !useGameStore.getState().ballStuck) {
            useGameStore.setState({ ballStuck: true });
            return { ...ball, x: px, y: py - BALL_RADIUS, vx: 0, vy: 0 };
          }
          const hitPos = (x - (px - pw / 2)) / pw;
          const angle = (hitPos - 0.5) * 2.2;
          const sp = isMega ? speed * 1.2 : speed;
          vx = Math.sin(angle) * sp * 0.4;
          vy = -Math.cos(angle) * sp * 0.5;
          y = py - BALL_RADIUS - 2;
          if ("vibrate" in navigator) navigator.vibrate(15);
        }
        if (y > GAME_HEIGHT + 50) return null;
        return { ...ball, x, y, vx, vy };
      });

      const validBalls = newBalls.filter((b): b is NonNullable<typeof b> => b !== null);
      if (validBalls.length === 0) {
        useGameStore.getState().loseLife();
        if (useGameStore.getState().lives <= 0) {
          useGameStore.setState({ isPlaying: false, gameOver: true });
          return;
        }
        useGameStore.setState({
          balls: [{ x: GAME_WIDTH / 2, y: GAME_HEIGHT - PADDLE_HEIGHT - 50, vx: 0, vy: -BALL_SPEED, radius: BALL_RADIUS, isMega: false, id: "ball-0" }],
          ballStuck: true,
        });
      } else {
        useGameStore.setState({ balls: validBalls });
      }

      const stateBricks = useGameStore.getState().bricks;
      let newBricks = [...stateBricks];
      const updatedBalls = [...validBalls];

      validBalls.forEach((ball, bi) => {
        newBricks = newBricks.filter((brick) => {
          const { x: bx, y: by, width: bw, height: bh } = brick;
          const ballLeft = ball.x - ball.radius;
          const ballRight = ball.x + ball.radius;
          const ballTop = ball.y - ball.radius;
          const ballBottom = ball.y + ball.radius;
          if (ballRight >= bx && ballLeft <= bx + bw && ballBottom >= by && ballTop <= by + bh) {
            if (brick.type === 9 && !ball.isMega) return true;
            useGameStore.getState().addScore(brick.points);
            brick.hits++;
            if (brick.hits >= brick.hitsRequired) {
              for (let i = 0; i < 8; i++) {
                useGameStore.getState().addParticle({
                  x: brick.x + bw / 2, y: brick.y + bh / 2,
                  vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
                  life: 1, color: BRICK_COLORS[brick.type] || "#fff", size: 4,
                });
              }
              if (Math.random() < 0.2) {
                const types: PowerUpType[] = ["enlarge", "laser", "slow", "catch", "disruption"];
                const type = types[Math.floor(Math.random() * types.length)];
                useGameStore.getState().setPowerUps((p) => [...p, {
                  x: brick.x + bw / 2 - POWERUP_SIZE / 2, y: brick.y, type, width: POWERUP_SIZE, height: POWERUP_SIZE,
                  id: `pu-${Date.now()}-${Math.random()}`,
                }]);
              }
              return false;
            }
            const b = updatedBalls[bi];
            if (b) {
              const nx = b.x < bx ? -1 : b.x > bx + bw ? 1 : 0;
              const ny = b.y < by ? -1 : b.y > by + bh ? 1 : 0;
              b.vx = nx !== 0 ? -b.vx : b.vx;
              b.vy = ny !== 0 ? -b.vy : b.vy;
            }
            return true;
          }
          return true;
        });
      });
      useGameStore.setState({ bricks: newBricks, balls: updatedBalls });

      const statePowerUps = useGameStore.getState().powerUps;
      const pady = GAME_HEIGHT - PADDLE_HEIGHT - 10;
      const padx = useGameStore.getState().paddleX;
      const padw = useGameStore.getState().paddleWidth;
      const newPowerUps = statePowerUps.map((p) => ({ ...p, y: p.y + 2 })).filter((p) => {
        if (p.y > GAME_HEIGHT) return false;
        if (p.y + p.height >= pady && p.y <= pady + PADDLE_HEIGHT && p.x + p.width >= padx - padw / 2 && p.x <= padx + padw / 2) {
          useGameStore.getState().addScore(1000);
          useGameStore.getState().applyPowerUp(p.type);
          if ("vibrate" in navigator) navigator.vibrate(20);
          return false;
        }
        return true;
      });
      useGameStore.setState({ powerUps: newPowerUps });

      if (newBricks.length === 0) {
        useGameStore.getState().addScore(1000);
        useGameStore.getState().nextLevel();
        if (useGameStore.getState().level > LEVELS.length) useGameStore.setState({ isPlaying: false });
      }

      const stateParticles = useGameStore.getState().particles;
      useGameStore.setState({
        particles: stateParticles.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02 })).filter((p) => p.life > 0),
      });

      animationId = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.strokeStyle = "rgba(0, 255, 242, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < GAME_WIDTH; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, GAME_HEIGHT); ctx.stroke(); }
      for (let i = 0; i < GAME_HEIGHT; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(GAME_WIDTH, i); ctx.stroke(); }

      useGameStore.getState().bricks.forEach((brick) => {
        const color = BRICK_COLORS[brick.type] || "#fff";
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = brick.type === 9 ? 8 : 4;
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        ctx.shadowBlur = 0;
      });

      useGameStore.getState().powerUps.forEach((p) => {
        ctx.fillStyle = POWERUP_COLORS[p.type] || "#fff";
        ctx.shadowColor = POWERUP_COLORS[p.type];
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.shadowBlur = 0;
      });

      useGameStore.getState().particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const px = useGameStore.getState().paddleX;
      const pw = useGameStore.getState().paddleWidth;
      const gradient = ctx.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0);
      gradient.addColorStop(0, "#ff00aa");
      gradient.addColorStop(0.5, "#00fff2");
      gradient.addColorStop(1, "#ff00aa");
      ctx.fillStyle = gradient;
      ctx.shadowColor = "#00fff2";
      ctx.shadowBlur = isTouching ? 20 : 10;
      ctx.beginPath();
      ctx.roundRect(px - pw / 2, GAME_HEIGHT - PADDLE_HEIGHT - 10, pw, PADDLE_HEIGHT, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      useGameStore.getState().balls.forEach((ball) => {
        ctx.fillStyle = ball.isMega ? "#8b5cf6" : "#00fff2";
        ctx.shadowColor = "#00fff2";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const interval = setInterval(render, 1000 / 60);
    return () => clearInterval(interval);
  }, [isTouching]);

  if (!isPlaying) return null;

  return (
    <div id="game-canvas-wrapper" className="game-container touch-none select-none relative mx-auto" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="block rounded-lg" style={{ touchAction: "none" }} onClick={() => ballStuck && releaseBall()} />
      {ballStuck && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg" onClick={() => useGameStore.getState().releaseBall()}>
          <p className="text-cyan-400 font-bold text-lg">Tap to launch</p>
        </div>
      )}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
          <p className="text-white font-bold text-2xl">PAUSED</p>
        </div>
      )}
    </div>
  );
}
