import logoImg from '../../assets/logo.png';

const Logo = ({ className = "h-8", containerClassName = "" }) => {
  return (
    <div className={`flex items-center ${containerClassName}`}>
      <img 
        src={logoImg} 
        alt="Royal Air Maroc" 
        className={`object-contain block w-auto ${className}`}
        style={{ 
          filter: 'none', 
          opacity: 1,
          visibility: 'visible',
          display: 'block'
        }}
        onError={(e) => {
          console.error("Logo failed to load at path:", logoImg);
          e.target.src = 'https://via.placeholder.com/150?text=RAM+LOGO'; // Fallback
        }}
      />
    </div>
  );
};

export default Logo;