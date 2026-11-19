import React from 'react'
import { FiUser } from 'react-icons/fi'

const OperatorOnDuty = ({user}) => {

    const isOnline = user ? "green" : "gray";
  return (
    <div>
        <FiUser size={20} color= {isOnline}/> {user}
    </div>
  )
}

export default OperatorOnDuty
