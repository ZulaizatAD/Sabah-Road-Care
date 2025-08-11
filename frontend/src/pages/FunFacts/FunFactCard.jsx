import React from "react";
import "./FunFactCard.css";

const FunFactCard = ({ fact, onClick }) => {
  return (
    <div className="funfact-card" onClick={() => onClick(fact)}>
      <h3 className="funfact-card-title">{fact.title}</h3>
    </div>
  );
};

export default FunFactCard;