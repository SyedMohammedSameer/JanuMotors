
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
}

const Card: React.FC<CardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex items-center">
      <div className="bg-primary-100 dark:bg-primary-900/50 rounded-full p-3 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        {change && (
          <p className={`text-xs ${changeColor}`}>
            {change} vs last month
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;
