"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditPatientProfile() {
    const router = useRouter();

    const [form, setForm] = useState({
        id: "P-123456",
        name: "Test Patient 1",
        age: 18,
        dob: "2003-01-01",
        gender: "Male",
        phone: "0901234567",
        address: "123 To Hien Thanh Str, Ward 1, District 1",
        healthInsurance: "Yes",
        livingArrangement: "With family",
        allergies: {
            drugs: "",
            drugsReaction: "",
            environment: "",
            environmentReaction: "",
            adr: "",
            adrReaction: ""
        },
        medical: {
            chiefComplaint: "",
            history: "",
            past: "",
            family: ""
        },
        social: {
            tobacco: "No",
            tobaccoDetail: "",
            alcohol: "No",
            alcoholDetail: "",
            caffeine: "No",
            caffeineDetail: "",
            drugs: "No",
            drugsList: ""
        }
    });

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (group: string, field: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            [group]: { ...(prev[group as keyof typeof form] as Record<string, any>), [field]: value }
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg space-y-6">
            <h1 className="text-2xl font-semibold mb-2">Edit Patient Info</h1>

            {/* Patient Info */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Patient Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="font-medium">Name:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Age:</label>
                        <input
                            type="number"
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.age}
                            onChange={(e) => handleChange("age", parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Date of Birth:</label>
                        <input
                            type="date"
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.dob}
                            onChange={(e) => handleChange("dob", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Gender:</label>
                        <select
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.gender}
                            onChange={(e) => handleChange("gender", e.target.value)}
                        >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-medium">Phone Number:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="font-medium">Address:</label>
                        <textarea
                            className="w-full border rounded px-2 py-1 mt-1"
                            rows={2}
                            value={form.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Health Insurance:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.healthInsurance}
                            onChange={(e) => handleChange("healthInsurance", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="font-medium">Living Arrangement:</label>
                        <input
                            className="w-full border rounded px-2 py-1 mt-1"
                            value={form.livingArrangement}
                            onChange={(e) => handleChange("livingArrangement", e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Allergies */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Allergies</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {["drugs", "environment", "adr"].map((item) => (
                        <div key={item}>
                            <label className="font-medium capitalize">{item}:</label>
                            <input
                                className="w-full border rounded px-2 py-1 mt-1"
                                value={form.allergies[item as keyof typeof form.allergies]}
                                onChange={(e) =>
                                    handleNestedChange("allergies", item, e.target.value)
                                }
                            />
                        </div>
                    ))}
                    {["drugsReaction", "environmentReaction", "adrReaction"].map((item) => (
                        <div key={item}>
                            <label className="font-medium capitalize">{item.replace("Reaction", " Reaction")}:</label>
                            <input
                                className="w-full border rounded px-2 py-1 mt-1"
                                value={form.allergies[item as keyof typeof form.allergies]}
                                onChange={(e) =>
                                    handleNestedChange("allergies", item, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Medical Info */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Medical Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {["chiefComplaint", "history", "past", "family"].map((field) => (
                        <div key={field} className="col-span-2">
                            <label className="font-medium capitalize">{field.replace(/([A-Z])/g, " $1")}:</label>
                            <textarea
                                className="w-full border rounded px-2 py-1 mt-1"
                                rows={2}
                                value={form.medical[field as keyof typeof form.medical]}
                                onChange={(e) =>
                                    handleNestedChange("medical", field, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Social History */}
            <section>
                <h2 className="text-lg font-semibold mb-2 border-b pb-1">Social History</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {["tobacco", "alcohol", "caffeine", "drugs"].map((field) => (
                        <div key={field}>
                            <label className="font-medium capitalize">{field} use:</label>
                            <select
                                className="w-full border rounded px-2 py-1 mt-1"
                                value={form.social[field as keyof typeof form.social]}
                                onChange={(e) =>
                                    handleNestedChange("social", field, e.target.value)
                                }
                            >
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>
                    ))}
                    {["tobaccoDetail", "alcoholDetail", "caffeineDetail", "drugsList"].map((field) => (
                        <div key={field}>
                            <label className="font-medium capitalize">{field.replace(/Detail|List/, "")} Detail:</label>
                            <input
                                className="w-full border rounded px-2 py-1 mt-1"
                                value={form.social[field as keyof typeof form.social]}
                                onChange={(e) =>
                                    handleNestedChange("social", field, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
                <button
                    onClick={() => router.back()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                    Cancel
                </button>
                <button
                    onClick={() => alert("Save logic goes here")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
