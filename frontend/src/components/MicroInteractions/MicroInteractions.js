// ============================================================================
// マイクロインタラクションコンポーネント
// ボタンクリックやホバー時のアニメーション効果を提供
// ============================================================================

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './MicroInteractions.css';

/**
 * リップル効果コンポーネント
 * ボタンクリック時の波紋エフェクト
 */
export const RippleEffect = ({ children, color = 'rgba(255, 255, 255, 0.6)', ...props }) => {
  const [ripples, setRipples] = useState([]);

  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // リップルを一定時間後に削除
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div 
      className="ripple-container" 
      onMouseDown={createRipple}
      {...props}
    >
      {children}
      <div className="ripples">
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              backgroundColor: color
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * フローティングアクションボタン
 * アニメーション付きのアクションボタン
 */
export const FloatingActionButton = ({ 
  icon, 
  onClick, 
  variant = 'primary',
  size = 'medium',
  animate = true,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  return (
    <RippleEffect>
      <button
        className={`fab fab-${variant} fab-${size} ${animate ? 'fab-animate' : ''} ${isPressed ? 'fab-pressed' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        {...props}
      >
        <span className="fab-icon">{icon}</span>
      </button>
    </RippleEffect>
  );
};

/**
 * アニメーションカード
 * ホバー時にアニメーションするカード
 */
export const AnimatedCard = ({ 
  children, 
  hover = true, 
  tilt = false,
  glow = false,
  ...props 
}) => {
  return (
    <div 
      className={`animated-card ${hover ? 'card-hover' : ''} ${tilt ? 'card-tilt' : ''} ${glow ? 'card-glow' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * パルスアニメーション
 * 要素を脈動させるアニメーション
 */
export const PulseAnimation = ({ 
  children, 
  intensity = 'medium',
  color = 'var(--color-primary-500)',
  ...props 
}) => {
  return (
    <div 
      className={`pulse-animation pulse-${intensity}`}
      style={{
        '--pulse-color': color
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ローディングドット
 * 3つのドットがアニメーションするローディング表示
 */
export const LoadingDots = ({ size = 'medium', color = 'var(--color-primary-500)' }) => {
  return (
    <div className={`loading-dots loading-dots-${size}`}>
      <div 
        className="dot" 
        style={{ backgroundColor: color }}
      />
      <div 
        className="dot" 
        style={{ backgroundColor: color }}
      />
      <div 
        className="dot" 
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

/**
 * スライドイントランジション
 * 要素がスライドインするアニメーション
 */
export const SlideInTransition = ({ 
  children, 
  direction = 'up',
  delay = 0,
  duration = 300,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`slide-transition slide-${direction} ${isVisible ? 'slide-in' : ''}`}
      style={{
        '--transition-duration': `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * バウンスボタン
 * クリック時にバウンスするボタン
 */
export const BounceButton = ({ children, onClick, ...props }) => {
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = (event) => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 300);
    
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button 
      className={`bounce-button ${isBouncing ? 'bouncing' : ''}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * プログレスリング
 * 円形のプログレス表示
 */
export const ProgressRing = ({ 
  progress = 0, 
  size = 60, 
  strokeWidth = 4,
  color = 'var(--color-primary-500)',
  backgroundColor = 'var(--color-border-primary)'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring">
      <svg width={size} height={size} className="progress-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="progress-circle"
        />
      </svg>
      <div className="progress-text">{Math.round(progress)}%</div>
    </div>
  );
};

// PropTypesの定義
RippleEffect.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string
};

FloatingActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  animate: PropTypes.bool
};

AnimatedCard.propTypes = {
  children: PropTypes.node.isRequired,
  hover: PropTypes.bool,
  tilt: PropTypes.bool,
  glow: PropTypes.bool
};

PulseAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  intensity: PropTypes.oneOf(['low', 'medium', 'high']),
  color: PropTypes.string
};

LoadingDots.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.string
};

SlideInTransition.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  delay: PropTypes.number,
  duration: PropTypes.number
};

BounceButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

ProgressRing.propTypes = {
  progress: PropTypes.number,
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  color: PropTypes.string,
  backgroundColor: PropTypes.string
};