import React from 'react';

const hint = { fontSize: '0.85rem', color: 'gray', margin: '0 0 0.5rem' };

const ScaleFields = ({ params, onChange }) => {
  const type = params.connectionType || 'SERIAL';

  return (
    <>
      <select name='connectionType' value={type} onChange={onChange}>
        <option value='SERIAL'>Serial (COM port)</option>
        <option value='TCP'>Ethernet (network)</option>
        <option value='BLUETOOTH'>Bluetooth</option>
      </select>

      {type === 'TCP' ? (
        <>
          <p style={hint}>The scale needs its own IP address. The app connects to it.</p>
          <input type='text' name='host' onChange={onChange} value={params.host ?? ''} placeholder='IP address (e.g. 192.168.1.50)' autoComplete='off' />
          <input type='number' name='tcpPort' onChange={onChange} value={params.tcpPort ?? ''} placeholder='Port (e.g. 4001)' autoComplete='off' />
        </>
      ) : (
        <>
          {type === 'BLUETOOTH' && (
            <p style={hint}>Pair the scale in Windows first, then enter its outgoing Bluetooth COM port.</p>
          )}
          <input type='text' name='port' onChange={onChange} value={params.port ?? ''} placeholder='Port' autoComplete='off' />
          <input type='number' name='baudRate' onChange={onChange} value={params.baudRate ?? ''} placeholder='Baud Rate' autoComplete='off' />
          <input type='number' name='databits' onChange={onChange} value={params.databits ? parseInt(params.databits) : ''} placeholder='Databits' autoComplete='off' />
          <input type='number' name='stopbits' onChange={onChange} value={params.stopbits ? parseInt(params.stopbits) : ''} placeholder='Stopbits' autoComplete='off' />
          <input type='text' name='parity' onChange={onChange} value={params.parity ?? ''} placeholder='Parity' autoComplete='off' />
          <input type='text' name='flowControl' onChange={onChange} value={params.flowControl ?? ''} placeholder='Flow Control' autoComplete='off' />
        </>
      )}
    </>
  );
};

export default ScaleFields;