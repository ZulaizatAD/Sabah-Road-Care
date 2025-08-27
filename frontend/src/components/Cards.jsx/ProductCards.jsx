import React from 'react';
import './ProductCards.css'; 

const ProductCard = () => {
  return (
    <article className="card">
      <div className="author">
        <div className="image">
          <img src="images/logo.png" alt="Author's logo" />
        </div>
        <div className="name">Lundev</div>
        <div className="subscribe">Subscribe</div>
      </div>
      <div className="image">
        <img src="images/green.png" alt="Product" />
      </div>
      <div className="info">
        <div className="name">Nike Retro Premium</div>
        <div className="price">11.200</div>
      </div>
      <div className="more">
        <div className="buttons">
          <button>🛒</button>
          <button>Buy Now</button>
        </div>
        <div className="options">
          <label htmlFor="product-options">Options</label>
          <ul>
            <li style={{ '--color': '#fe6969' }}></li>
            <li style={{ '--color': '#ffa666' }}></li>
            <li style={{ '--color': '#ffdd66' }}></li>
            <li style={{ '--color': '#323232' }}></li>
          </ul>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;