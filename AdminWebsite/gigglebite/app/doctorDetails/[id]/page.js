'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import "./styleDoctorDetails.css"

export default function doctorDetails({ params }) {
    const { id } = use(params);     //get ID from URL
    const router = useRouter();

    const [patients, setPatients] = useState(null);
    const [doctor, setDoctor] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            //get all patients
            const { data: pData } = await supabase
                .from('users')
                .select('id, name')
                .eq('assigned_doc', id)

            //get this doctor
            const { data: dData } = await supabase
                .from('users')
                .select('name')
                .eq('id', id)
                .single();

            setPatients(pData || []);
            setDoctor(dData);
            setLoading(false);
        }
        loadData();
    }, [id]);

    async function goHome() {
        router.push('/');
    }

    if (loading) return <div id="main">Take a break, have a KitKat!</div>;
    if (!doctor) return <div id="main">Doctor is an Enigma!</div>;

    return (
        <div id="main">
            <div id="top">
                <h1>{doctor.name}</h1>
                <button id="home" onClick={goHome}>HOME</button>
            </div>

            {patients.length > 0 ? (
                <ul>
                    {patients.map((patient) => (
                        <li key={patient.id}>
                            <Link href={`/patientDetails/${patient.id}`}>{patient.name}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>This doctor currently has no assigned patients.</p>
            )}
        </div>
    )
}