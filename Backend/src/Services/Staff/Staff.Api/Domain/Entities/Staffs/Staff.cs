using Staffs.Api.Domain.Enums;

namespace Staffs.Api.Domain.Entities;

public class Staff
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Address { get; set; }
    public required StaffType Type { get; set; }
    public List<Shift> Shifts { get; set; } = [];

    public Guid RegisterShift(Shift shift)
    {
        Shifts.Add(shift);
        return shift.Id;
    }

    public void RegisterShifts(List<Shift> shifts)
    {
        Shifts.AddRange(shifts);
    }

    public void Update(string name, string email, string phoneNumber, string address)
    {
        Name = name;
        Email = email;
        PhoneNumber = phoneNumber;
        Address = address;
    }
}
