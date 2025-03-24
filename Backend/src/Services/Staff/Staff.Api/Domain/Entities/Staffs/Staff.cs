namespace Staffs.Api.Domain.Entities;

public class Staff
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
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
