import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import BtnSpinner from '../../reuse/BtnSpinner';
import { BaseUrl } from '../../reuse/BaseUrl';
import Btn from '../../reuse/Btn';
import ScaleFields from './ScaleFields';
import { emptyScaleParams, mapScaleParams, buildScalePayload, scaleFormError } from './scaleParams';


const UpdateScaleConfig = ({showAlert, showConfirmAlert}) => {

    const [scaleParamsLine1, setScaleParamsLine1] = useState(emptyScaleParams);
    const [scaleParamsLine2, setScaleParamsLine2] = useState(emptyScaleParams);

    const [paramIdLine1, setParamIdLine1] = useState(null);
    const [paramIdLine2, setParamIdLine2] = useState(null);

    const [gate2Enabled, setGate2Enabled] = useState(false);
    const [activeGate, setActiveGate] = useState('GATE_1');

    const [isLoading, setIsLoading] = useState(false);
    const [isLoading2, setIsLoading2] = useState(false);

    const handleInputChangeLine1 = (e) => {
        const { name, value } = e.target;
        setScaleParamsLine1(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChangeLine2 = (e) => {
        const { name, value } = e.target;
        setScaleParamsLine2(prev => ({ ...prev, [name]: value }));
    };

    const updateGate = async (paramId, params, setLoading) => {
        if (!paramId) {
            showAlert("No scale configuration entered to update.", "error");
            return;
        }

        const payload = buildScalePayload(params);
        const problem = scaleFormError(payload);
        if (problem) {
            showAlert(problem, "error");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${BaseUrl}/scale/${paramId}`, payload);

            if (response.data.status === "unchanged") {
                showAlert("No changes made.", "info");
            } else {
                showAlert("Scale parameters updated!", "success");
            }
        } catch (error) {
            console.error("Failed to update scale params", error);
            if (error.response) {
                showAlert(
                    `Update failed: ${error.response.status} - ${
                        error.response.data?.message || "Unable to update scale configuration"
                    }`,
                    "error"
                );
            } else {
                showAlert("Failed to update scale parameters. Check database connection.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLine1 = (e) => {
        e.preventDefault();
        updateGate(paramIdLine1, scaleParamsLine1, setIsLoading);
    };

    const handleUpdateLine2 = (e) => {
        e.preventDefault();
        updateGate(paramIdLine2, scaleParamsLine2, setIsLoading2);
    };

    const confirmUpdateLine1 = (e) => {
        e.preventDefault();
        showConfirmAlert("Update Scale Parameters?", "info", () => handleUpdateLine1(e));
    };

    const confirmUpdateLine2 = (e) => {
        e.preventDefault();
        showConfirmAlert("Update Scale Parameters?", "info", () => handleUpdateLine2(e));
    };

    const scaleNumberOne = gate2Enabled ? "1" : "";

    useEffect(() => {
        axios.get(`${BaseUrl}/scale`)
            .then(res => {
                const configs = res.data ?? [];

                const gate1 = configs.find(c => c.scaleId === 'GATE_1');
                if (gate1) {
                    setParamIdLine1(gate1.id);
                    setScaleParamsLine1(mapScaleParams(gate1));
                }

                const gate2 = configs.find(c => c.scaleId === 'GATE_2');
                if (gate2 && gate2.enabled) {
                    setGate2Enabled(true);
                    setParamIdLine2(gate2.id);
                    setScaleParamsLine2(mapScaleParams(gate2));
                }
            })
            .catch(err => console.error(err));
    }, []);


    return (
        <div className='db-wrap scale-configuration'>
            {(gate2Enabled &&
                <div className='gate-tabs' style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button type="button" onClick={() => setActiveGate('GATE_1')} disabled={activeGate === 'GATE_1'}>
                        Scale 1
                    </button>
                    <button type="button" onClick={() => setActiveGate('GATE_2')} disabled={activeGate === 'GATE_2'}>
                        Scale 2
                    </button>
                </div>
            )}
            {activeGate === 'GATE_1' && (
                <div className="gate-1">
                    <h2><FaArrowUp color='gray' /> Update Scale {scaleNumberOne} Params</h2>
                    <form>
                        <ScaleFields params={scaleParamsLine1} onChange={handleInputChangeLine1} />
                        <Btn btnName={isLoading ? <BtnSpinner /> : "Update Parameter"} handleClick={confirmUpdateLine1} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />
                    </form>
                </div>)}
            {activeGate === 'GATE_2' && gate2Enabled && (
                <div className="gate-2">
                    <h2><FaArrowUp color='gray' /> Update Scale 2 Params</h2>
                    <form>
                        <ScaleFields params={scaleParamsLine2} onChange={handleInputChangeLine2} />
                        <Btn btnName={isLoading2 ? <BtnSpinner /> : "Update Parameter"} handleClick={confirmUpdateLine2} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />
                    </form>
                </div>
            )}

        </div>
    );
}

export default UpdateScaleConfig