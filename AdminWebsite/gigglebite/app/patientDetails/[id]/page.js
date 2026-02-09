'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import "./stylePatientDetails.css";

export default function PatientDetails({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { data: pData } = await supabase
                .from('users')
                .select('*')
                .eq('id', id)
                .single();

            const { data: dData } = await supabase
                .from('users')
                .select('id, name')
                .eq('role', 'doctor');

            setPatient(pData);
            setDoctors(dData || []);
            setLoading(false);
        }
        loadData();
    }, [id]);

    async function assignDoctor(formData) {
        const selectedDoctorId = formData.get('selectedDoctor');
        const updateValue = selectedDoctorId === 'none' ? 'Dr. Smit' : selectedDoctorId;

        const { error } = await supabase
            .from('users')
            .update({ assigned_doc: updateValue })
            .eq('id', id);

        if (error) {
            alert("Error: " + error.message);
        } else {
            router.refresh();
            window.location.reload(); 
        }
    }

    if (loading) return <div className="loading">Loading...</div>;
    if (!patient) return <div className="error">Patient not found!</div>;

    const assignedId = patient.assigned_doc;
    const isAssigned = assignedId && assignedId !== 'Dr. Smit';
    const currentDoctor = isAssigned ? doctors.find(d => d.id === assignedId) : null;
    const riskClass = patient.risk_level === 'High' ? 'risk-high' : 'risk-normal';

    return (
        <div id="main">
            <nav className="top-nav">
                <button className="back-btn" onClick={() => router.push('/')}>← Back to Dashboard</button>
            </nav>

            <header className="patient-header">
                <div>
                    <h1 className="patient-name">{patient.name}</h1>
                    <span className="patient-id">ID: {patient.id.slice(0, 8)}...</span>
                </div>
                <div className={`status-badge ${riskClass}`}>
                    {patient.risk_level || 'Unknown Risk'}
                </div>
            </header>

            <div className="details-grid">
                <div className="card info-card">
                    <h3>Medical Status</h3>
                    <div className="info-row">
                        <label>Condition</label>
                        <p>{patient.condition || 'General Checkup'}</p>
                    </div>
                    <div className="info-row">
                        <label>Current Status</label>
                        <p>{patient.status || 'Active'}</p>
                    </div>
                    <div className="info-row">
                        <label>Trend</label>
                        <p>{patient.trend || 'Stable'}</p>
                    </div>
                </div>

                <div className="card action-card">
                    <h3>Doctor Assignment</h3>
                    <div className="current-assignment">
                        <label>Currently Assigned To:</label>
                        <p className="doc-name">{currentDoctor ? currentDoctor.name : 'No Doctor Assigned'}</p>
                    </div>

                    <form action={assignDoctor} className="assign-form">
                        <label htmlFor="doctorsList">Change Assignment</label>
                        <div className="select-wrapper">
                            <select id="doctorsList" name="selectedDoctor" defaultValue={isAssigned ? assignedId : 'none'}>
                                <option value="none">-- No Doctor (Unassign) --</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <input type="submit" value="Update" className="submit-btn" />
                    </form>
                </div>
            </div>
        </div>
    );
}