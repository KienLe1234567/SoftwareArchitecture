"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddPatient() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        age: "",
        dob: "",
        gender: "",
        phone: "",
        address: ""
    });

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
            <h1 className="text-2xl font-semibold mb-6">Add New Patient</h1>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <label className="font-medium">Name</label>
                    <input
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                    />
                </div>
                <div>
                    <label className="font-medium">Age</label>
                    <input
                        className="w-full border rounded px-2 py-1 mt-1"
                        type="number"
                        value={form.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                    />
                </div>
                <div>
                    <label className="font-medium">Date of Birth</label>
                    <input
                        type="date"
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={form.dob}
                        onChange={(e) => handleChange("dob", e.target.value)}
                    />
                </div>
                <div>
                    <label className="font-medium">Gender</label>
                    <select
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={form.gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                    >
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="font-medium">Phone</label>
                    <input
                        className="w-full border rounded px-2 py-1 mt-1"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                    />
                </div>
                <div className="col-span-2">
                    <label className="font-medium">Address</label>
                    <textarea
                        className="w-full border rounded px-2 py-1 mt-1"
                        rows={2}
                        value={form.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                    Cancel
                </button>
                <button
                    onClick={() => alert("Patient added (fake logic)")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                    Add Patient
                </button>
            </div>
        </div>
    );
}
