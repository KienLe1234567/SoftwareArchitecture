using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Appointments.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppointmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DoctorName",
                schema: "appointment",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PatientName",
                schema: "appointment",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DoctorName",
                schema: "appointment",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "PatientName",
                schema: "appointment",
                table: "Appointments");
        }
    }
}
