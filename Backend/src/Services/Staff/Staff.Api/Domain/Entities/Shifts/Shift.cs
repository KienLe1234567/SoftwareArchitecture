namespace Staffs.Api.Domain.Entities;

public class Shift
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Description { get; set; } = default!;
    public string Location { get; set; } = default!;
    public Guid StaffId { get; set; }
    public Staff Staff { get; set; } = default!;
}
