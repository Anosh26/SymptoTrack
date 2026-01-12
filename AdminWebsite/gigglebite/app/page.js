'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

        //get all patients
        const { data: pData } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'patient');

        //get all doctors
        const { data: dData } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'doctor');

        setPatients(pData || []);
        setDoctors(dData || []);
        setLoading(false);
    }

    //get the IDs of all doctors who have at least one patient
    async function getAssignedDoctorIds() {
        const { data } = await supabase
            .from('users')
            .select('assigned_doc')
            .not('assigned_doc', 'is', null)
            .neq('assigned_doc', 'Dr. Smit');       //ignore the placeholder for no assigned doctor

        return [...new Set(data.map(item => item.assigned_doc))];
    }

    //patient filters
    async function patientsAll() {
        setActivePatientFilter('all');

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'patient');
        setPatients(data);
    }

    async function patientsAssigned() {
        setActivePatientFilter('assigned');

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'patient')
            .neq('assigned_doc', 'Dr. Smit');
        setPatients(data);
    }

    async function patientsNotAssigned() {
        setActivePatientFilter('not-assigned');

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'patient')
            .eq('assigned_doc', 'Dr. Smit');
        setPatients(data);
    }

    //doctor filters
    async function doctorsAll() {
        setActiveDoctorFilter('all');

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'doctor');
        setDoctors(data);
    }

    async function doctorsAssigned() {
        setActiveDoctorFilter('assigned');
        const assignedIds = await getAssignedDoctorIds();

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'doctor')
            .in('id', assignedIds);     //doctors whose IDs are in the assigned doctor list

        setDoctors(data || []);
    }

    async function doctorsNotAssigned() {
        setActiveDoctorFilter('not-assigned');
        const assignedIds = await getAssignedDoctorIds();

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'doctor')
            .not('id', 'in', `(${assignedIds.join(',')})`);     //doctors whose IDs are not in the assigned doctor list

        setDoctors(data || []);
    }

    if (loading) return <div id="main">Take a break, have a KitKat!</div>;

    return (
        <div id="main">
            <div id="bothColumns">

                <div id="patients">
                    <h2>Patients</h2>
                    <div className="topButtons">
                        <button className={activePatientFilter === 'all' ? 'active' : ''} onClick={patientsAll}>All</button>
                        <button className={activePatientFilter === 'assigned' ? 'active' : ''} onClick={patientsAssigned}>Assigned</button>
                        <button className={activePatientFilter === 'not-assigned' ? 'active' : ''} onClick={patientsNotAssigned}>Not Assigned</button>
                    </div>
                    <ul>
                        {patients.map((p) => (
                            <li key={p.id}>
                                <Link href={`/patientDetails/${p.id}`}>{p.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div id="doctors">
                    <h2>Doctors</h2>
                    <div className="topButtons">
                        <button className={activeDoctorFilter === 'all' ? 'active' : ''} onClick={doctorsAll}>All</button>
                        <button className={activeDoctorFilter === 'assigned' ? 'active' : ''} onClick={doctorsAssigned}>Assigned</button>
                        <button className={activeDoctorFilter === 'not-assigned' ? 'active' : ''} onClick={doctorsNotAssigned}>Not Assigned</button>
                    </div>
                    <ul>
                        {doctors.map((d) => (
                            <li key={d.id}>
                                <Link href={`/doctorDetails/${d.id}`}>{d.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}