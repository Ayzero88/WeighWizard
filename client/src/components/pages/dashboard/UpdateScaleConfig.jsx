import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import BtnSpinner from '../../reuse/BtnSpinner';
import { BaseUrl } from '../../reuse/BaseUrl';
import Btn from '../../reuse/Btn';
import ScaleFields from './ScaleFields';
import { emptyScaleParams, mapScaleParams, buildScalePayload, scaleFormError } from './scaleParams';


const UpdateScaleConfig = ({showAlert, showConfirmAlert}) => {

    // One entry per scale shown: Scale 1 always, plus every other enabled scale
    const [scales, setScales] = useState([]);
    const [activeGate, setActiveGate] = useState('GATE_1');

    const handleInputChange = (scaleId) => (e) => {
        const { name, value } = e.target;
        setScales(prev => prev.map(s => s.scaleId === scaleId ? { ...s, params: { ...s.params, [name]: value } } : s));
    };

    const setLoadingFor = (scaleId, value) => {
        setScales(prev => prev.map(s => s.scaleId === scaleId ? { ...s, loading: value } : s));
    };

    const updateGate = async (scale) => {
        if (!scale.id) {
            showAlert("No scale configuration entered to update.", "error");
            return;
        }

        const payload = buildScalePayload(scale.params);
        const problem = scaleFormError(payload);
        if (problem) {
            showAlert(problem, "error");
            return;
        }

        try {
            setLoadingFor(scale.scaleId, true);
            const response = await axios.put(`${BaseUrl}/scale/${scale.id}`, payload);

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
            setLoadingFor(scale.scaleId, false);
        }
    };

    const confirmUpdate = (e, scale) => {
        e.preventDefault();
        showConfirmAlert("Update Scale Parameters?", "info", () => updateGate(scale));
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
                    params: mapScaleParams(c),
                    loading: false,
                })));
            })
            .catch(err => console.error(err));
    }, []);

    // With only one scale, the title drops the number and no tabs show (same as before)
    const multiScale = scales.length > 1;
    const active = scales.find(s => s.scaleId === activeGate) || scales[0];

    return (
        <div className='db-wrap scale-configuration'>
            {multiScale && (
                <div className='gate-tabs' style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    {scales.map(s => (
                        <button key={s.scaleId} type="button" onClick={() => setActiveGate(s.scaleId)} disabled={activeGate === s.scaleId}>
                            Scale {s.scaleId.replace('GATE_', '')}
                        </button>
                    ))}
                </div>
            )}
            {active && (
                <div className="gate-1">
                    <h2><FaArrowUp color='gray' /> Update Scale {multiScale ? active.scaleId.replace('GATE_', '') : ''} Params</h2>
                    <form>
                        <ScaleFields params={active.params} onChange={handleInputChange(active.scaleId)} />
                        <Btn btnName={active.loading ? <BtnSpinner /> : "Update Parameter"} handleClick={(e) => confirmUpdate(e, active)} p="0.8rem" fs="1rem" pr="1rem" col="#fff" bgc="#b08d57" gp="0.5rem" wt="100%" bd="none" bdr="5px" />
                    </form>
                </div>
            )}

        </div>
    );
}

export default UpdateScaleConfig
