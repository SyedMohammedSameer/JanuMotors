import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
  gradient?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType,
  gradient = false,
  onClick 
}) => {
  const changeColor = changeType === 'positive' 
    ? 'text-green-400' 
    : changeType === 'negative' 
    ? 'text-red-400' 
    : 'text-primary-500';

  const cardClasses = onClick 
    ? 'cursor-pointer transform hover:scale-105 active:scale-95' 
    : '';

  return (
    <div 
      className={`card-luxury p-6 transition-all duration-300 group ${cardClasses}`}
      onClick={onClick}
    >
      {/* Background Gradient Overlay */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        gradient 
          ? 'bg-gradient-to-br from-primary-500/10 via-transparent to-accent/10' 
          : 'bg-gradient-to-br from-primary-500/5 via-transparent to-transparent'
      }`}></div>
      
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-4 rounded-2xl transition-all duration-300 group-hover:scale-110
            ${gradient 
              ? 'bg-gradient-gold shadow-gold' 
              : 'bg-primary-500/10 border border-primary-500/20'
            }
          `}>
            <div className={`
              w-8 h-8 transition-colors duration-300
              ${gradient ? 'text-black' : 'text-primary-500 group-hover:text-primary-400'}
            `}>
              {icon}
            </div>
          </div>

          {/* Change Indicator */}
          {change && (
            <div className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold
              ${changeType === 'positive' ? 'bg-green-500/10 text-green-400' : 
                changeType === 'negative' ? 'bg-red-500/10 text-red-400' : 
                'bg-primary-500/10 text-primary-500'}
            `}>
              <svg 
                className={`w-3 h-3 ${
                  changeType === 'positive' ? 'rotate-0' : 
                  changeType === 'negative' ? 'rotate-180' : 'rotate-45'
                }`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>{change}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="mb-3">
          <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider leading-none">
            {title}
          </h3>
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className={`
            text-3xl font-bold transition-all duration-300
            ${gradient 
              ? 'text-gradient' 
              : 'text-white group-hover:text-primary-400'
            }
          `}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Additional Info */}
        {change && (
          <div className="flex items-center justify-between text-xs">
            <span className={`${changeColor} font-medium`}>
              {change} vs last month
            </span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    gradient ? 'bg-primary-500' : 'bg-primary-500/30 group-hover:bg-primary-500'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Border Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl border border-primary-500/0 group-hover:border-primary-500/30 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default Card;