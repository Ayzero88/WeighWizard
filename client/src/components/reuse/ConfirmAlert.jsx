import { FaBowlingBall, FaCircle, FaTimes } from 'react-icons/fa';
import ayzeroxa from '../asset/images/ayzeroxa.png';
import Btn from './Btn';

const ConfirmAlert = ({
  message,
  type = 'warning',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  const alertType =
    type === 'success' ? 'green' :
    type === 'error' ? 'red' :
    type === 'warning' ? 'orange' :
    type === 'info' ? 'blue' : 'gray';

  return (
    <div className="overlay">
      <div className="alert-content" role="dialog" aria-modal="true">
        <div className="exit-alert">
          <FaTimes onClick={onCancel} color="gray" />
        </div>

        <div className="logo-wrap">
          <img src={ayzeroxa} alt="WeighWiz" />
        </div>

        <h3>
          <FaCircle color={alertType} /> {message}
        </h3>

        <div className="alert-actions" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <Btn btnName={cancelText} handleClick={onCancel} p="0.5rem" fs="0.8rem" col="#fff" bgc="#E53E3E"  wt="100%" bd = "none" bdr = "5px"/>
            <Btn btnName={confirmText} handleClick={onConfirm} p="0.5rem" fs="0.8rem"  col="#fff" bgc="#059669" wt="100%" bd = "none" bdr = "5px"/>

        </div>
      </div>
    </div>
  );
};

export default ConfirmAlert;