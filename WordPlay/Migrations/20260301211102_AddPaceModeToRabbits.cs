using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordPlay.Migrations
{
    /// <inheritdoc />
    public partial class AddPaceModeToRabbits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaceMode",
                table: "RabbitAssignments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "leading");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaceMode",
                table: "RabbitAssignments");
        }
    }
}
