import React from 'react';


const Spinner = ({bdr, ht, bg, message}) => {
  return (
    
        <div className="spinners-overlay" style={{borderRadius: bdr, height: ht, background: bg}}>
            <div className="spinners"></div>
            <p>{message}</p>
        </div>
    
  );
};

export default Spinner;
