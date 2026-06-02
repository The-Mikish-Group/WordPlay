using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordPlay.Migrations
{
    /// <inheritdoc />
    public partial class AddLeagues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CohortId",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CurrentWeek",
                table: "UserProgress",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "LeagueDivision",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LeagueXp",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WeeklyXpStart",
                table: "UserProgress",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "LeagueBotMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CohortId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    AvatarData = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    WeeklyXp = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueBotMembers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeagueCohorts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WeekId = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Division = table.Column<int>(type: "int", nullable: false),
                    SettledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueCohorts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeagueResults",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    WeekId = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Division = table.Column<int>(type: "int", nullable: false),
                    Rank = table.Column<int>(type: "int", nullable: false),
                    Outcome = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    RewardCoins = table.Column<int>(type: "int", nullable: false),
                    RewardHoney = table.Column<int>(type: "int", nullable: false),
                    RewardBeeId = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: true),
                    Claimed = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueResults", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeagueBotMembers_CohortId",
                table: "LeagueBotMembers",
                column: "CohortId");

            migrationBuilder.CreateIndex(
                name: "IX_LeagueCohorts_WeekId_Division",
                table: "LeagueCohorts",
                columns: new[] { "WeekId", "Division" });

            migrationBuilder.CreateIndex(
                name: "IX_LeagueResults_UserId_Claimed",
                table: "LeagueResults",
                columns: new[] { "UserId", "Claimed" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeagueBotMembers");

            migrationBuilder.DropTable(
                name: "LeagueCohorts");

            migrationBuilder.DropTable(
                name: "LeagueResults");

            migrationBuilder.DropColumn(
                name: "CohortId",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "CurrentWeek",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "LeagueDivision",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "LeagueXp",
                table: "UserProgress");

            migrationBuilder.DropColumn(
                name: "WeeklyXpStart",
                table: "UserProgress");
        }
    }
}
