import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaLink } from 'react-icons/fa';
import { BaseUrl } from '../../reuse/BaseUrl';
import BtnSpinner from '../../reuse/BtnSpinner';
import Btn from '../../reuse/Btn';
import ScaleFields from './ScaleFields';
import { emptyScaleParams, mapScaleParams, buildScalePayload, scaleFormError } from './scaleParams';


const ScaleConfig = ({showAlert}) => {

  // One entry per scale shown: Scale 1 always, plus every other enabled scale
  const [scales, setScales] = useState([]);

  const handleInputChange = (scaleId) => (e) => {
    const { name, value } = e.target;
    setScales(prev => prev.map(s => s.scaleId === scaleId ? { ...s, params: { ...s.params, [name]: value } } : s));
  };

  const setScaleField = (scaleId, field, value) => {
    setScales(prev => prev.map(s => s.scaleId === scaleId ? { ...s, [field]: value } : s));
  };

  // Save one scale's settings
  const saveConfig = async (e, scale) => {
    e.preventDefault();

    if (!scale.id) {
      showAlert('Scale settings have not loaded yet.', 'error');
      return;
    }

    const payload = buildScalePayload(scale.params);
    const problem = scaleFormError(payload);
    if (problem) {
      showAlert(problem, 'error');
      return;
    }

    try {
      setScaleField(scale.scaleId, 'loading', true);
      await axios.put(`${BaseUrl}/scale/${scale.id}`, payload);
      showAlert('Scale parameters saved!', 'success');
      setScaleField(scale.scaleId, 'status', 'saved');
    } catch (err) {
      console.error(err);
      showAlert('Failed to save scale parameters.', 'error');
    } finally {
      setScaleField(scale.scaleId, 'loading', false);
    }
  };

  useEffect(() => {
    axios.get(`${BaseUrl}/scale`)
      .then(res => {
        const configs = (res.data ?? [])
          .filter(c => c.scaleId === 'GATE_1' || c.enabled)
          .sort((a, b) => a.scaleId.localeCompare(b.scaleId));
        setScales(configs.map(c => ({
          scaleId: c.scaleId,
          id: c.id,
          params: { ...mapScaleParams(c), enabled: c.enabled },
          status: 'saved',
          loading: false,
        })));
      })
      .catch(err => console.error(err));
  }, []);

  // With only one scale, titles drop the number (same as before)
  const multiScale = scales.length > 1;

  return (
    <div className='db-wrap scale-configuration'>
      {scales.map((scale) => {
        const label = multiScale ? scale.scaleId.replace('GATE_', '') : '';
        return (
          <div className='gate-1' key={scale.scaleId}>
            <div className='gate-1-title'>
              <FaLink size={20} color={scale.status === 'saved' ? 'lightgreen' : 'gray'} />
              <h2>{scale.status === 'saved' ? `Scale ${label} Config Saved` : `Set Scale ${label} Configuration`}</h2>
            </div>

            <form>
              <ScaleFields params={scale.params} onChange={handleInputChange(scale.scaleId)} />
              {(scale.status !== 'saved') && <Btn btnName={scale.loading ? <BtnSpinner /> : "Save"} handleClick={(e) => saveConfig(e, scale)} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />}
            </form>
          </div>
        );
      })}
    </div>
  )
}

export default ScaleConfig;
