import React, { useState } from 'react';
import '../styles/GeneratedImage.css';

const GeneratedImage = ({ imageUrl }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="generated-image">
      {!imageError ? (
        <img 
          src={imageUrl} 
          alt="Generated fashion design" 
          onError={handleImageError}
        />
      ) : (
        <div className="image-error">
          <p>Image could not be loaded</p>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage; 