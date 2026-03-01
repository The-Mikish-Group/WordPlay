using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordPlay.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesAndRabbits : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "user");

            migrationBuilder.CreateTable(
                name: "RabbitAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BotUserId = table.Column<int>(type: "int", nullable: false),
                    TargetUserId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RabbitAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RabbitAssignments_Users_BotUserId",
                        column: x => x.BotUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RabbitAssignments_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_RabbitAssignments_BotUserId",
                table: "RabbitAssignments",
                column: "BotUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RabbitAssignments_TargetUserId_IsActive",
                table: "RabbitAssignments",
                columns: new[] { "TargetUserId", "IsActive" });

            // Seed: Word Dog (ID 1) → admin
            migrationBuilder.Sql("UPDATE Users SET Role = 'admin' WHERE Id = 1");

            // Seed: Fast Eddie (ID 9) → bot
            migrationBuilder.Sql("UPDATE Users SET Role = 'bot', Provider = 'bot', ProviderSubject = 'eddie-bot', Email = NULL WHERE Id = 9");

            // Seed: Assign Eddie as rabbit for Bridget (user 7)
            migrationBuilder.Sql("INSERT INTO RabbitAssignments (BotUserId, TargetUserId, IsActive, CreatedAt) VALUES (9, 7, 1, GETUTCDATE())");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RabbitAssignments");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");
        }
    }
}
