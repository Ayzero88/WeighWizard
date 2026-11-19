import React from 'react';
const Btn = ({btnName, disabled, p, pt, pb, pl, pr, bd, bgc, col, gp, wt, bdr, fs, m, icon, handleClick}) => {

    const style = {
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: pl,
        paddingRight: pr,
        border: bd,
        padding: p,
        margin: m,
        backgroundColor: bgc,
        color: col,
        display: 'flex',
        gap: gp,
        width: wt,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: bdr,
        fontSize: fs,
        cursor: 'pointer',
        disabled: disabled,
    };

  return (
    <button className='btn' style={style} onClick={handleClick}> {icon} {btnName}</button>
  )
};

export default Btn;