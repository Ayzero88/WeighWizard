export const emptyScaleParams = {
  port: '', baudRate: '', databits: '', stopbits: '', parity: '', flowControl: '',
  connectionType: 'SERIAL', host: '', tcpPort: ''
};

// saved settings from the backend -> form values
export const mapScaleParams = (cfg) => ({
  port: cfg.port ?? '',
  baudRate: cfg.baudRate ?? '',
  databits: cfg.databits ?? '',
  stopbits: cfg.stopbits ?? '',
  parity: cfg.parity ?? '',
  flowControl: cfg.flowControl ?? '',
  connectionType: cfg.connectionType || 'SERIAL',
  host: cfg.host ?? '',
  tcpPort: cfg.tcpPort ?? ''
});

// form values -> what the backend expects
export const buildScalePayload = (p) => ({
  port: p.port,
  baudRate: p.baudRate,
  databits: p.databits,
  stopbits: p.stopbits,
  parity: p.parity,
  flowControl: p.flowControl,
  connectionType: p.connectionType || 'SERIAL',
  host: (p.host || '').trim(),
  tcpPort: p.tcpPort === '' || p.tcpPort == null ? null : Number(p.tcpPort)
});

// returns a message if the form is not valid, otherwise ''
export const scaleFormError = (payload) => {
  if (payload.host && !/^[A-Za-z0-9.\-]{1,253}$/.test(payload.host)) {
    return 'Enter a valid IP address or host name.';
  }
  if (payload.connectionType === 'TCP') {
    if (!payload.host) return "Enter the indicator's IP address.";
    if (!payload.tcpPort || payload.tcpPort < 1 || payload.tcpPort > 65535) {
      return 'Enter a port between 1 and 65535.';
    }
  } else if (!String(payload.port ?? '').trim()) {
    return 'Enter the COM port.';
  }
  return '';
};