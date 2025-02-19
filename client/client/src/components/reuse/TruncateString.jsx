import React from 'react'

const TruncateString = ({str, maxLength}) => {

  
        return str.length > maxLength ? str.substring(0, maxLength - 3) + "..." : str;

};

export default TruncateString;