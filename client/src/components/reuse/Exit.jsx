import React from 'react';

const Exit = ({handleClick, icon}) => {
  return (
    <div onClick={handleClick} style={{cursor: 'pointer'}}>{icon}</div>
  )
};
export default Exit;