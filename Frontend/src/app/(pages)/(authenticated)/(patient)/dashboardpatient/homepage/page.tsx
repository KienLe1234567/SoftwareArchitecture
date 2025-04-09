"use client";

import { Doctor } from "@/types/doctor";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DateComponent() {
    const router = useRouter();
    const [today, setToday] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [doctor, setDoctor] = useState<Doctor | null>(null); // Sử dụng interface Doctor

    useEffect(() => {
        const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        setToday(currentDate);
    }, []);

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [suggestions, setSuggestions] = useState<{ id: string; name: string; }[]>([]);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const response = await fetch('http://localhost:7000/staffs-api/api/staffs'); // Cập nhật URL API để lấy danh sách bác sĩ
                const data = await response.json();
                setDoctors(data.staffs); // Giả sử dữ liệu trả về có cấu trúc { staffs: [...] }

                // Lấy thông tin bác sĩ đầu tiên để hiển thị
                if (data.staffs.length > 0) {
                    const firstDoctor = data.staffs[0];
                    setDoctor({
                        id: firstDoctor.id,
                        name: firstDoctor.name,
                        email: firstDoctor.email,
                        phoneNumber: firstDoctor.phoneNumber,
                        address: firstDoctor.address
                    });
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
            }
        };

        fetchDoctorData();
    }, []);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value.trim() === "") {
            setSuggestions([]); // Nếu không có ký tự nào, xóa gợi ý
        } else {
            const filteredSuggestions = doctors.filter(doctor =>
                doctor.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        }
    };

    const handleSearchClick = () => {
        const filteredDoctors = doctors.filter(doctor =>
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log("Searching for:", filteredDoctors);
    };

    return (
        <div>
            <div className="flex flex-row justify-between">
                <h1 style={{ marginTop: "auto", marginBottom: "auto", marginLeft: "140px", fontSize: "30px", fontWeight: 600 }}>Dashboard</h1>
                <div className="flex items-center justify-between p-4 w-fit">
                    {/* Bên trái: ngày tháng */}
                    <div>
                        <p className="text-gray-500 text-sm">Today's Date</p>
                        <p className="text-black text-xl font-semibold">{today}</p>
                    </div>

                    {/* Bên phải: icon */}
                    <div className="bg-gray-100 p-2 rounded-lg ml-4">
                        <img src="/calendar.svg" className="w-6 h-6" alt="Calendar Icon" />
                    </div>
                </div>

            </div>

            <div className="relative w-full h-[400px] rounded-xl overflow-visible shadow-lg max-w-7xl mx-auto" style={{ marginBottom: "40px" }}>
                {/* <!-- Background image --> */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/b3.jpg')", filter: "brightness(0.9)" }}>
                </div>

                {/* <!-- Overlay (optional, để làm nền tối nhẹ cho dễ đọc chữ) --> */}
                <div className="absolute inset-0 bg-white bg-opacity-40"></div>


                {/* <!-- Text content --> */}
                <div className="relative z-10 h-full flex items-center justify-start pl-10">
                    <div className="text-left max-w-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{doctor?.name}</h1>
                        <p className="text-gray-700 mb-6">
                            Haven't any idea about doctors? No problem, let's jump to <strong>"All Doctors"</strong> section or <strong>"Sessions"</strong>.<br />
                            Track your past and future appointments history.<br />
                            Also find out the expected arrival time of your doctor or medical consultant.
                        </p>
                        <div className="mt-4">
                            <label className="text-lg font-semibold text-gray-800 mb-2 block">Channel a Doctor Here</label>
                            <div className="flex relative">
                                <input
                                    style={{ backgroundImage: "url('/search.svg')", backgroundRepeat: "no-repeat", backgroundPosition: "10px 50%" }}
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
                                    onClick={handleSearchClick} // Gọi hàm tìm kiếm khi nhấn nút
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex p-4 gap-4 mx-auto" style={{ width: "90%" }}>
                {/* Left Side - Status */}
                <div className="w-1/2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 mx-auto">
                        <button className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "15rem" }}>
                            <div>
                                <p className="text-gray-700">Patient Profile</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img
                                    src="/patients-hover.svg"
                                    className="w-8 h-8"
                                    alt="Patient Profile Icon"
                                />
                            </div>
                        </button>

                        <button
                            className="border-2 rounded p-4 flex justify-between items-center"
                            style={{ width: "15rem" }}
                            onClick={() => router.push('/dashboardpatient/doctorinfo')}
                        >
                            <div>
                                <p className="text-gray-700">Doctor List</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/doctors-hover.svg" className="w-8 h-8" alt="Doctor List Icon" />
                            </div>
                        </button>

                        <button className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "15rem" }}>
                            <div>
                                <p className="text-gray-700">Medical Histories</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/book-hover.svg" className="w-8 h-8" alt="Medical Histories Icon" />
                            </div>
                        </button>

                        <button className="border-2 rounded p-4 flex justify-between items-center" style={{ width: "15rem" }}>
                            <div>
                                <p className="text-gray-700 text-left">Upcoming Appointments</p>
                            </div>
                            <div className="bg-gray-200 p-3 rounded-md">
                                <img src="/session-iceblue.svg" className="w-8 h-8" alt="Upcoming Appointments Icon" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Side - Upcoming Sessions */}
                <div className="w-1/2 border-2 rounded py-4 overflow-auto" style={{ width: "45%" }}>
                    <h2 className="text-xl text-center font-semibold mb-2">
                        Your Up Coming Bookings
                    </h2>
                    <table className="w-full table-fixed text-center" style={{ borderCollapse: "separate" }}>
                        <thead>
                            <tr>
                                <th className="border-b-2 border-blue-500">Appoint.<br />Number</th>
                                <th className="border-b-2 border-blue-500">Session Title</th>
                                <th className="border-b-2 border-blue-500">Doctor</th>
                                <th className="border-b-2 border-blue-500">Sheduled Date & Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Nếu có dữ liệu */}
                            {/* <tr>
                                <td className="font-bold text-lg py-4">1</td>
                                <td>Test Session</td>
                                <td>Test Doctor</td>
                                <td>2050-01-01 18:00</td>
                            </tr> */}

                            {/* Nếu không có dữ liệu, thì dùng phần này thay thế (bạn có thể điều kiện hóa nó với dữ liệu thực tế) */}

                            <tr>
                                <td colSpan={4} className="text-center py-10">
                                    <img
                                        src="/notfound.svg"
                                        alt="No sessions"
                                        className="mx-auto w-32"
                                    />
                                </td>
                            </tr>

                        </tbody>
                    </table>

                </div>
            </div>

        </div >
    );
}
