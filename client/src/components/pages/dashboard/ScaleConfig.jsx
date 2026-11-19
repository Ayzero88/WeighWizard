import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaLink } from 'react-icons/fa';
import { BaseUrl } from '../../reuse/BaseUrl';
import BtnSpinner from '../../reuse/BtnSpinner';
import Btn from '../../reuse/Btn';
import ScaleFields from './ScaleFields';
import { emptyScaleParams, mapScaleParams, buildScalePayload, scaleFormError } from './scaleParams';


const ScaleConfig = ({showAlert}) => {

  const [statusForLine1, setStatusForLine1] = useState("");
  const [statusForLine2, setStatusForLine2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [scaleParamsForLine1, setScaleParamsForLine1] = useState(emptyScaleParams);
  const [scaleParamsForLine2, setScaleParamsForLine2] = useState(emptyScaleParams);

  const [paramIdLine1, setParamIdLine1] = useState(null);
  const [paramIdLine2, setParamIdLine2] = useState(null);

  const handleInputChangeLine1 = (e) => {
    const { name, value } = e.target;
    setScaleParamsForLine1(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChangeLine2 = (e) => {
    const { name, value } = e.target;
    setScaleParamsForLine2(prev => ({ ...prev, [name]: value }));
  };

  // Generic save, parameterized by which gate is being saved
  const saveConfig = async (e, { paramId, params, setLoading, setStatus }) => {
    e.preventDefault();

    if (!paramId) {
      showAlert('Scale settings have not loaded yet.', 'error');
      return;
    }

    const payload = buildScalePayload(params);
    const problem = scaleFormError(payload);
    if (problem) {
      showAlert(problem, 'error');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${BaseUrl}/scale/${paramId}`, payload);
      showAlert('Scale parameters saved!', 'success');
      setStatus('saved');
    } catch (err) {
      console.error(err);
      showAlert('Failed to save scale parameters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save
  const handleSetLine1 = (e) => saveConfig(e, {
    paramId: paramIdLine1,
    params: scaleParamsForLine1,
    setLoading: setIsLoading,
    setStatus: setStatusForLine1
  });

  const handleSetLine2 = (e) => saveConfig(e, {
    paramId: paramIdLine2,
    params: scaleParamsForLine2,
    setLoading: setIsLoading2,
    setStatus: setStatusForLine2
  });

  const scaleNumberOne = scaleParamsForLine2.enabled ? "1" : "";

  useEffect(() => {
    axios.get(`${BaseUrl}/scale`)
      .then(res => {
        const configs = res.data ?? [];

        const gate1 = configs.find(c => c.scaleId === 'GATE_1');
        if (gate1) {
          setParamIdLine1(gate1.id);
          setScaleParamsForLine1(mapScaleParams(gate1));
          setStatusForLine1('saved');
        } else {
          setStatusForLine1('not saved');
        }

        const gate2 = configs.find(c => c.scaleId === 'GATE_2');
        if (gate2) {
          setParamIdLine2(gate2.id);
          setScaleParamsForLine2({ ...mapScaleParams(gate2), enabled: gate2.enabled });
          setStatusForLine2('saved');
        } else {
          setStatusForLine2('not saved');
        }
      })
      .catch(err => console.error(err));
  }, []);


  return (
    <div className='db-wrap scale-configuration'>
      <div className='gate-1'>
        <div className='gate-1-title'>
          <FaLink size={20} color={statusForLine1 === 'saved' ? 'lightgreen' : 'gray'} />
          <h2>{statusForLine1 === 'saved' ? `Scale ${scaleNumberOne} Config Saved` : `Set Scale ${scaleNumberOne} Configuration`}</h2>
        </div>

        <form>
          <ScaleFields params={scaleParamsForLine1} onChange={handleInputChangeLine1} />
          {(statusForLine1 !== 'saved') && <Btn btnName={isLoading ? <BtnSpinner /> : "Save"} handleClick={handleSetLine1} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />}
        </form>
      </div>

      {scaleParamsForLine2.enabled &&
        <div className='gate-2'>
          <div className='gate-2-title'>
            <FaLink size={20} color={statusForLine2 === 'saved' ? 'lightgreen' : 'gray'} />
            <h2>{statusForLine2 === 'saved' ? 'Scale 2 Config Saved' : 'Set Scale 2 Configuration'}</h2>
          </div>

          <form>
            <ScaleFields params={scaleParamsForLine2} onChange={handleInputChangeLine2} />
            {(statusForLine2 !== 'saved') && <Btn btnName={isLoading2 ? <BtnSpinner /> : "Save"} handleClick={handleSetLine2} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />}
          </form>
        </div>}

    </div>
  )
}

export default ScaleConfig;