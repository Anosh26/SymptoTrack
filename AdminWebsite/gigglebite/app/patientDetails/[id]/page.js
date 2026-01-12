'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import "./stylePatientDetails.css";

export default function PatientDetails({ params }) {
    const { id } = use(params);     //get ID from URL
    const router = useRouter();

    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [currentDoctorName, setCurrentDoctorName] = useState('no one');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            //get this patient
            const { data: pData } = await supabase
                .from('users')
                .select('name, assigned_doc')
                .eq('id', id)
                .single();

            //get all doctors
            const { data: dData } = await supabase
                .from('users')
                .select('id, name')
                .eq('role', 'doctor');

            //getting currently assigned doctor name
            if (pData && pData.assigned_doc && pData.assigned_doc !== 'Dr. Smit') {
                const { data: docData } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', pData.assigned_doc)
                    .single();
                
                if (docData) setCurrentDoctorName(docData.name);
            } else {
                setCurrentDoctorName('no one');
            }

            setPatient(pData);
            setDoctors(dData || []);
            setLoading(false);
        }
        loadData();
    }, [id]);

    async function assignDoctor(formData) {
        const selectedDoctorId = formData.get('selectedDoctor');
        const selectedDoctorName = doctors.find(d => d.id === selectedDoctorId).name;

        const { error } = await supabase
            .from('users')
            .update({ assigned_doc: selectedDoctorId })
            .eq('id', id);

        if (error) {
            alert("could not assign DOTOR");
            console.log(error.message);
        } else {
            alert(`${selectedDoctorName} assigned to ${patient.name}`);
            setCurrentDoctorName(selectedDoctorName);
        }
    }

    if (loading) return <div id="main">Take a break, have a KitKat!</div>;
    if (!patient) return <div id="main">Patient is an Enigma!</div>;

    return (
        <div id="main">
            <div id="top">
                <h1>{patient.name}</h1>
                <button id="home" onClick={() => router.push('/')}>HOME</button>
            </div>
            <br/>

            <h3>Currently assigned doctor is {currentDoctorName}</h3>

            <form action={assignDoctor}>
                <label htmlFor="doctorsList">Assign a doctor:</label>
                <select id="doctorsList" name="selectedDoctor" defaultValue={patient.assigned_doc}>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                        </option>
                    ))}
                </select>

                <input type="submit" value="Assign" />
            </form>
        </div>
    );
}