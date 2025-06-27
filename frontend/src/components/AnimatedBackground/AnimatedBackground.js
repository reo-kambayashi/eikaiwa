// ============================================================================
// アニメーション背景コンポーネント
// パーティクルとフローティング要素で動的な背景を生成
// ============================================================================

import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import './AnimatedBackground.css';

/**
 * アニメーション背景コンポーネント
 * @param {Object} props - コンポーネントプロパティ
 * @param {string} props.variant - 背景のバリアント ('particles'|'floating'|'waves')
 * @param {number} props.intensity - アニメーションの強度 (0.1-1.0)
 * @param {boolean} props.reducedMotion - モーション軽減フラグ
 */
const AnimatedBackground = ({
  variant = 'particles',
  intensity = 0.5,
  reducedMotion = false
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // パーティクル設定
  const config = useMemo(() => ({
    particles: {
      count: Math.floor(30 * intensity),
      speed: 0.2 * intensity,
      size: { min: 1, max: 3 },
      opacity: { min: 0.1, max: 0.4 }
    },
    floating: {
      count: Math.floor(15 * intensity),
      speed: 0.1 * intensity,
      size: { min: 20, max: 60 },
      opacity: { min: 0.05, max: 0.15 }
    },
    waves: {
      amplitude: 30 * intensity,
      frequency: 0.02 * intensity,
      speed: 0.005 * intensity
    }
  }), [intensity]);

  // パーティクルクラス
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * config.particles.speed;
      this.vy = (Math.random() - 0.5) * config.particles.speed;
      this.size = config.particles.size.min + 
                  Math.random() * (config.particles.size.max - config.particles.size.min);
      this.opacity = config.particles.opacity.min + 
                     Math.random() * (config.particles.opacity.max - config.particles.opacity.min);
      this.hue = Math.random() * 360;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // 画面外に出たら反対側から再登場
      if (this.x < 0) this.x = this.canvas.width;
      if (this.x > this.canvas.width) this.x = 0;
      if (this.y < 0) this.y = this.canvas.height;
      if (this.y > this.canvas.height) this.y = 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = `hsl(${this.hue}, 60%, 70%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // フローティング要素クラス
  class FloatingElement {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * config.floating.speed;
      this.vy = (Math.random() - 0.5) * config.floating.speed;
      this.size = config.floating.size.min + 
                  Math.random() * (config.floating.size.max - config.floating.size.min);
      this.opacity = config.floating.opacity.min + 
                     Math.random() * (config.floating.opacity.max - config.floating.opacity.min);
      this.rotation = 0;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.hue = 220 + Math.random() * 60; // 青系
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      // 画面外処理
      if (this.x < -this.size) this.x = this.canvas.width + this.size;
      if (this.x > this.canvas.width + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = this.canvas.height + this.size;
      if (this.y > this.canvas.height + this.size) this.y = -this.size;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // 六角形を描画
      ctx.fillStyle = `hsl(${this.hue}, 50%, 60%)`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // キャンバスサイズ調整
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  // パーティクル初期化
  const initializeParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = [];
    const count = variant === 'floating' ? config.floating.count : config.particles.count;
    const ParticleClass = variant === 'floating' ? FloatingElement : Particle;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push(new ParticleClass(canvas));
    }
  };

  // 波のアニメーション
  const drawWaves = (ctx, time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { amplitude, frequency, speed } = config.waves;
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    // 複数の波を描画
    for (let layer = 0; layer < 3; layer++) {
      ctx.save();
      ctx.globalAlpha = 0.1 - layer * 0.02;
      
      const offset = time * speed * (layer + 1);
      const waveHeight = height * 0.7 + layer * 50;
      
      ctx.fillStyle = `hsl(${220 + layer * 20}, 60%, 70%)`;
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x <= width; x += 2) {
        const y = waveHeight + 
                  Math.sin((x * frequency) + offset) * amplitude +
                  Math.sin((x * frequency * 2) + offset * 1.5) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  // アニメーションループ
  const animate = (time) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // キャンバスクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (reducedMotion) return;

    if (variant === 'waves') {
      drawWaves(ctx, time);
    } else {
      // パーティクル更新・描画
      particlesRef.current.forEach(particle => {
        particle.update();
        particle.draw(ctx);
      });
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  // 初期化とクリーンアップ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();
    initializeParticles();
    
    if (!reducedMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      resizeCanvas();
      initializeParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, intensity, reducedMotion]);

  return (
    <div className={`animated-background ${variant}`} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="background-canvas"
        style={{
          opacity: reducedMotion ? 0.2 : 1
        }}
      />
    </div>
  );
};

// PropTypesの定義
AnimatedBackground.propTypes = {
  variant: PropTypes.oneOf(['particles', 'floating', 'waves']),
  intensity: PropTypes.number,
  reducedMotion: PropTypes.bool
};

export default AnimatedBackground;