import React from 'react';
import { FaHome, FaLaptop, FaTshirt, FaHeart, FaAppleAlt } from 'react-icons/fa';
import './styles.css';

const icons = {
  home_kitchen: <FaHome size={48} color="#5caf90" />,
  electronics: <FaLaptop size={48} color="#5caf90" />,
  clothing: <FaTshirt size={48} color="#5caf90" />,
  health_beauty: <FaHeart size={48} color="#5caf90" />,
  food: <FaAppleAlt size={48} color="#5caf90" />,
};

const bgColors = {
  home_kitchen: 'linear-gradient(135deg, #f9edff 0%, #fff 100%)',
  electronics: 'linear-gradient(135deg, #edfff7 0%, #fff 100%)',
  clothing: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)',
  health_beauty: 'linear-gradient(135deg, #fff0f0 0%, #fff 100%)',
  food: 'linear-gradient(135deg, #f0fff0 0%, #fff 100%)',
};

const CategoryCard = ({
  category = 'home_kitchen',
  title = 'Home & Kitchen',
  count = 0,
  discount = 0,
}) => {
  return (
    <div
      className="category-card-custom"
      style={{
        background: bgColors[category] || bgColors.home_kitchen,
        borderRadius: 14,
        boxShadow: '0 2px 12px 0 rgba(44,62,80,.06)',
        padding: 24,
        minWidth: 220,
        minHeight: 180,
        position: 'relative',
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
      }}
    >
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <span style={{ background: '#5caf90', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 14, padding: '2px 10px' }}>{discount}%</span>
      </div>
      <div className="d-flex flex-column align-items-center justify-content-center" style={{marginTop: 8}}>
        {icons[category]}
        <div style={{ fontWeight: 700, fontSize: 20, marginTop: 10, color: '#222' }}>{title}</div>
        <div style={{ color: '#8b9ca7', fontSize: 15, marginTop: 4 }}>{count} Items</div>
      </div>
    </div>
  );
};

export default CategoryCard;
