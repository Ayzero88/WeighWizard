import React from 'react';



const Logo = ({fs, imgWt}) => {
  return (
    <div style={{display: 'flex', gap: '0.3rem', alignItems: 'center', justifyContent: 'center'}}>
        <h1 style={{fontSize: fs, color: "#fff"}}>Weigh<span style={{backgroundColor: 'burlywood', padding: '0 0.5rem', borderRadius: '5px', fontStyle: 'italic'}}>Wiz</span></h1>
        <img width={imgWt} src={require('../asset/images/wizwand.png')} alt="wand"/>
    </div>
  )
}

export default Logo;