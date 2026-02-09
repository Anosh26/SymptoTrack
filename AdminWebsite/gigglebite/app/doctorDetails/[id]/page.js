'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import "./styleDoctorDetails.css";

export default function DoctorDetails({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [patients, setPatients] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const { data: dData } = await supabase
                .from('users')
                .select(`
                    *,
                    doctor_profiles (specialization, department)
                `)
                .eq('id', id)
                .single();

            const { data: pData } = await supabase
                .from('users')
                .select('id, name, status, risk_level')
                .eq('assigned_doc', id);

            setPatients(pData || []);
            setDoctor(dData);
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (!doctor) return <div className="error">Doctor not found!</div>;

    const specialization = doctor.doctor_profiles?.[0]?.specialization || 'General Practitioner';
    const department = doctor.doctor_profiles?.[0]?.department || 'General';

    return (
        <div id="main">
            <nav className="top-nav">
                <button className="back-btn" onClick={() => router.push('/')}>← Back to Dashboard</button>
            </nav>

            <div className="doc-header-card">
                <div className="avatar-placeholder">{doctor.name.charAt(0)}</div>
                <div className="doc-info">
                    <h1>{doctor.name}</h1>
                    <p className="spec">{specialization} • {department}</p>
                </div>
            </div>

            <div className="content-section">
                <h3>Assigned Patients <span className="badge-count">{patients.length}</span></h3>
                
                {patients.length > 0 ? (
                    <ul className="patient-list">
                        {patients.map((p) => (
                            <li key={p.id}>
                                <Link href={`/patientDetails/${p.id}`} className="patient-link">
                                    <span className="p-name">{p.name}</span>
                                    <div className="p-meta">
                                        <span className={`status-dot ${p.risk_level === 'High' ? 'red' : 'green'}`}></span>
                                        {p.status || 'Active'}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-state">
                        <p>No patients currently assigned.</p>
                    </div>
                )}
            </div>
        </div>
    )
}