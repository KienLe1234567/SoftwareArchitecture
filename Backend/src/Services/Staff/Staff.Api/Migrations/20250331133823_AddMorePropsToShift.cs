using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Staffs.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMorePropsToShift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                schema: "staff",
                table: "Shifts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Location",
                schema: "staff",
                table: "Shifts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                schema: "staff",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "Location",
                schema: "staff",
                table: "Shifts");
        }
    }
}
