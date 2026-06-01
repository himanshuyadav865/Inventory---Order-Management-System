import React from 'react';

const StatCard = ({ label, value, icon, variant = 'primary' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className={`stat-icon ${variant}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
