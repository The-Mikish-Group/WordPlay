using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordPlay.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalCoinsEarned : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MonthlyCoinsStart",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalCoinsEarned",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MonthlyCoinsStart",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "TotalCoinsEarned",
                table: "UserProgress");
        }
    }
}
