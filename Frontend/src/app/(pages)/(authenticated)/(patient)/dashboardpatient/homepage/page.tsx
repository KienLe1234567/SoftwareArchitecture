"use client";

import { getAppointments } from "@/lib/appointment";
import { getPatientById } from "@/lib/patient";
import { getAllStaffs } from "@/lib/staff";
import { Appointment } from "@/types/appointment";
import { Doctor } from "@/types/doctor";
import { Staff } from "@/types/staff"; // 👈 đảm bảo bạn có định nghĩa này
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DateComponent() {
    const router = useRouter();
    const [today, setToday] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [patientName, setPatientName] = useState<string>("");
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);

    const patientID = "a2559b6b-0ca9-4d88-90b8-9565386339c0";

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0];
        setToday(currentDate);
    }, []);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const patient = await getPatientById(patientID);
                setPatientName(patient.firstName);
            } catch (error) {
                console.error("Error fetching patient:", error);
            }
        };
        fetchPatient();
    }, []);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const data = await getAllStaffs();

                const filteredDoctors: Doctor[] = data.staffs
                    .filter((staff: Staff) => !!staff.id)
                    .map((staff: Staff) => ({
                        id: staff.id!,
                        name: staff.name,
                        email: staff.email,
                        phoneNumber: staff.phoneNumber,
                        address: staff.address,
                    }));

                setDoctors(filteredDoctors);

                if (filteredDoctors.length > 0) {
                    setDoctor(filteredDoctors[0]);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };
        fetchDoctorData();
    }, []);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await getAppointments(undefined, patientID);

                const today = new Date().toISOString().split("T")[0]; // "yyyy-mm-dd"

                const futureAppointments = (res ?? []).filter((appt: Appointment) => {
                    const apptDate = appt.startTime.split("T")[0]; // lấy ngày từ startTime
                    //console.log(apptDate);
                    return appt.status !== "CANCELLED" && apptDate >= today;
                });

                setAppointments(futureAppointments);
            } catch (error) {
                console.error("Error fetching appointments:", error);
                setAppointments([]);
            }
        };

        fetchAppointments();

    }, []);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value.trim() === "") {
            setSuggestions([]);
        } else {
            const filteredSuggestions = doctors.filter((doctor) =>
                doctor.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        }
    };

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 className="ml-36 text-2xl font-semibold">Dashboard</h1>
                <div className="flex items-center p-4 w-fit">
                    <div>
                        <p className="text-gray-500 text-sm">Today's Date</p>
                        <p className="text-black text-xl font-semibold">{today}</p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-lg ml-4">
                        <img src="/calendar.svg" className="w-6 h-6" alt="Calendar Icon" />
                    </div>
                </div>
            </div>

            <div className="relative w-full h-[400px] rounded-xl overflow-visible shadow-lg max-w-7xl mx-auto mb-10">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/b3.jpg')", filter: "brightness(0.9)" }} />
                <div className="absolute inset-0 bg-white bg-opacity-40" />
                <div className="relative z-10 h-full flex items-center justify-start pl-10">
                    <div className="text-left max-w-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{patientName || "Patient"}</h1>
                        <p className="text-gray-700 mb-6">
                            Haven't any idea about doctors? No problem, let's jump to <strong>"All Doctors"</strong> section or <strong>"Sessions"</strong>.<br />
                            Track your past and future appointments history.<br />
                            Also find out the expected arrival time of your doctor or medical consultant.
                        </p>
                        <div className="mt-4">
                            <label className="text-lg font-semibold text-gray-800 mb-2 block">Channel a Doctor Here</label>
                            <div className="flex relative">
                                <input
                                    style={{
                                        backgroundImage: "url('/search.svg')",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "10px 50%",
                                    }}
                                    type="text"
                                    placeholder="Search Doctor and We will Find The Session Available"
                                    className="w-full px-9 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    value={searchQuery}
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                        {suggestions.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setSearchQuery(doctor.name);
                                                    setSuggestions([]);
                                                    router.push(`/dashboardpatient/doctorSessions/${doctor.id}`);
                                                }}
                                            >
                                                {doctor.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-r-md"
                                    style={{ boxShadow: "0 4px 5px 0 rgba(57,108,240,0.3)" }}
                                    onClick={() => router.push("/dashboardpatient/doctorinfo")}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex p-4 gap-4 mx-auto w-[90%]">
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 mx-auto">
                        <button className="border-2 rounded p-4 flex justify-between items-center w-[15rem]" onClick={() => router.push('/dashboardpatient/profilePatient')}>
                            <div><p className="text-gray-700">Patient Profile</p></div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/patients-hover.svg" className="w-8 h-8" alt="Patient Profile Icon" />
                            </div>
                        </button>
                        <button className="border-2 rounded p-4 flex justify-between items-center w-[15rem]" onClick={() => router.push('/dashboardpatient/doctorinfo')}>
                            <div><p className="text-gray-700">Doctor List</p></div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/doctors-hover.svg" className="w-8 h-8" alt="Doctor List Icon" />
                            </div>
                        </button>
                        <button className="border-2 rounded p-4 flex justify-between items-center w-[15rem]">
                            <div><p className="text-gray-700">Medical Histories</p></div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/book-hover.svg" className="w-8 h-8" alt="Medical Histories Icon" />
                            </div>
                        </button>
                        <button className="border-2 rounded p-4 flex justify-between items-center w-[15rem]" onClick={() => router.push('/dashboardpatient/mySessions')}>
                            <div><p className="text-gray-700 text-left">Upcoming Appointments</p></div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/session-iceblue.svg" className="w-8 h-8" alt="Upcoming Appointments Icon" />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="w-1/2 border-2 rounded py-4 overflow-auto">
                    <h2 className="text-xl text-center font-semibold mb-2">Your Up Coming Bookings</h2>
                    <table className="w-full table-fixed text-center" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr>
                                <th className="border-b-2 border-blue-500">Appoint.<br />Number</th>
                                <th className="border-b-2 border-blue-500">Session Title</th>
                                <th className="border-b-2 border-blue-500">Doctor</th>
                                <th className="border-b-2 border-blue-500">Scheduled Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length > 0 ? (
                                appointments.map((appointment, index) => {
                                    const date = appointment.startTime.split("T")[0];
                                    const time = appointment.startTime.split("T")[1]?.slice(0, 5);
                                    return (
                                        <tr key={appointment.appointmentId}>
                                            <td className="font-bold text-lg py-4">{index + 1}</td>
                                            <td>{`Session with ${appointment.doctorName}`}</td>
                                            <td>{appointment.doctorName}</td>
                                            <td>{`${date} ${time}`}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10">
                                        <img src="/notfound.svg" alt="No sessions" className="mx-auto w-32" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
