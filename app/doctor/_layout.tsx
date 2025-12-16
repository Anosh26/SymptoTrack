import { Stack } from "expo-router";
export default function DoctorLayout(){
    return(
        <Stack>
            <Stack.Screen
                name="index"
                options={{title: 'Doctors Dashboard'}}
            />
            <Stack.Screen 
                name="patient-detail" 
                options={{ title: 'Patient Details' }} 
            />
        </Stack>
    );
}