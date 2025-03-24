"use client"

import { useState } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Doctor } from "@/types/doctor"

const initialDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. John Doe",
    phone: "123-456-7890",
    email: "john@example.com",
    workload: {},
  },
  {
    id: "2",
    name: "Dr. Jane Smith",
    phone: "987-654-3210",
    email: "jane@example.com",
    workload: {},
  },
]

export default function ManageWorkerPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)
  const [open, setOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", email: "" })

  const handleAdd = () => {
    setEditDoctor(null)
    setForm({ name: "", phone: "", email: "" })
    setOpen(true)
  }

  const handleEdit = (doctor: Doctor) => {
    setEditDoctor(doctor)
    setForm({ name: doctor.name, phone: doctor.phone, email: doctor.email })
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((doc) => doc.id !== id))
  }

  const handleSave = () => {
    if (editDoctor) {
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === editDoctor.id ? { ...doc, ...form } : doc
        )
      )
    } else {
      const newDoctor: Doctor = {
        id: "5",
        name: form.name,
        phone: form.phone,
        email: form.email,
        workload: {},
      }
      setDoctors((prev) => [...prev, newDoctor])
    }
    setOpen(false)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Doctors</h1>
      <Button className="mb-4" onClick={handleAdd}>Add Doctor</Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>{doctor.name}</TableCell>
              <TableCell>{doctor.phone}</TableCell>
              <TableCell>{doctor.email}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleEdit(doctor)} className="mr-2">Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(doctor.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>Doctor information list</TableCaption>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDoctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editDoctor ? "Save Changes" : "Add Doctor"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
