'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import "./styleHome.css";

export default function Home() {
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePatientFilter, setActivePatientFilter] = useState('all');
    const [activeDoctorFilter, setActiveDoctorFilter] = useState('all');

    useEffect(() => {
        fetchAllData();
    }, []);

    async function fetchAllData() {
        setLoading(true);

        const { data: pData } = await supabase
            .from('users')
            .select('id, name, role, status, risk_level, assigned_doc')
            .eq('role', 'patient');

        const { data: dData } = await supabase
            .from('users')
            .select(`
                id, name, role, assigned_doc,
                doctor_profiles (specialization, department)
            `)
            .eq('role', 'doctor');

        setPatients(pData || []);
        setDoctors(dData || []);
        setLoading(false);
    }

    // Helper to check assignment
    const isAssigned = (p) => p.assigned_doc && p.assigned_doc !== 'Dr. Smit' && p.assigned_doc !== null;

    // Filter Logic
    const filteredPatients = patients.filter(p => {
        const assigned = isAssigned(p);
        if (activePatientFilter === 'assigned') return assigned;
        if (activePatientFilter === 'not-assigned') return !assigned;
        return true;
    });

    const filteredDoctors = doctors.filter(d => {
        const hasPatients = patients.some(p => p.assigned_doc === d.id);
        if (activeDoctorFilter === 'assigned') return hasPatients;
        if (activeDoctorFilter === 'not-assigned') return !hasPatients;
        return true;
    });

    // Stats Calculation
    const highRiskCount = patients.filter(p => p.risk_level === 'High').length;
    const availableDocs = doctors.length - doctors.filter(d => patients.some(p => p.assigned_doc === d.id)).length;

    if (loading) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div id="main">
            <header className="dashboard-header">
                <div>
                    <h1>Medical Dashboard</h1>
                    <p>Overview of hospital assignments and status.</p>
                </div>
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-val">{patients.length}</span>
                        <span className="stat-label">Total Patients</span>
                    </div>
                    <div className="stat-card urgent">
                        <span className="stat-val">{highRiskCount}</span>
                        <span className="stat-label">High Risk</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-val">{doctors.length}</span>
                        <span className="stat-label">Doctors</span>
                    </div>
                </div>
            </header>

            <div id="bothColumns">
                {/* Patients Column */}
                <div className="panel" id="patients">
                    <div className="panel-header">
                        <h2>Patients</h2>
                        <span className="count-badge">{filteredPatients.length}</span>
                    </div>
                    
                    <div className="filter-tabs">
                        <button className={activePatientFilter === 'all' ? 'active' : ''} onClick={() => setActivePatientFilter('all')}>All</button>
                        <button className={activePatientFilter === 'assigned' ? 'active' : ''} onClick={() => setActivePatientFilter('assigned')}>Assigned</button>
                        <button className={activePatientFilter === 'not-assigned' ? 'active' : ''} onClick={() => setActivePatientFilter('not-assigned')}>Unassigned</button>
                    </div>

                    <ul className="card-list">
                        {filteredPatients.map((p) => {
                            const isHighRisk = p.risk_level === 'High';
                            const riskClass = isHighRisk ? 'badge-high' : (p.risk_level === 'Moderate' ? 'badge-mid' : 'badge-low');
                            
                            return (
                                <li key={p.id} className="card-item">
                                    <Link href={`/patientDetails/${p.id}`}>
                                        <div className="card-row">
                                            <strong>{p.name}</strong>
                                            <span className={`badge ${riskClass}`}>{p.risk_level || 'Low'}</span>
                                        </div>
                                        <div className="card-row subtitle">
                                            <span>Status: {p.status || 'Active'}</span>
                                            {isAssigned(p) ? <span className="assigned-check">✓ Assigned</span> : <span className="unassigned-alert">⚠ Unassigned</span>}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Doctors Column */}
                <div className="panel" id="doctors">
                    <div className="panel-header">
                        <h2>Doctors</h2>
                        <span className="count-badge">{filteredDoctors.length}</span>
                    </div>

                    <div className="filter-tabs">
                        <button className={activeDoctorFilter === 'all' ? 'active' : ''} onClick={() => setActiveDoctorFilter('all')}>All</button>
                        <button className={activeDoctorFilter === 'assigned' ? 'active' : ''} onClick={() => setActiveDoctorFilter('assigned')}>Active</button>
                        <button className={activeDoctorFilter === 'not-assigned' ? 'active' : ''} onClick={() => setActiveDoctorFilter('not-assigned')}>Available</button>
                    </div>

                    <ul className="card-list">
                        {filteredDoctors.map((d) => {
                            const spec = d.doctor_profiles?.[0]?.specialization || 'General';
                            return (
                                <li key={d.id} className="card-item">
                                    <Link href={`/doctorDetails/${d.id}`}>
                                        <div className="card-row">
                                            <strong>{d.name}</strong>
                                        </div>
                                        <div className="card-row subtitle">
                                            <span>{spec}</span>
                                            <span>Department: {d.doctor_profiles?.[0]?.department || 'General'}</span>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}