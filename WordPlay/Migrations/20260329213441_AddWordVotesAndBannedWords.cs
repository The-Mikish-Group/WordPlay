using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WordPlay.Migrations
{
    /// <inheritdoc />
    public partial class AddWordVotesAndBannedWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BannedWords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Word = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BannedById = table.Column<int>(type: "int", nullable: false),
                    BannedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BannedWords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BannedWords_Users_BannedById",
                        column: x => x.BannedById,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WordVotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Word = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WordVotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WordVotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BannedWords_BannedById",
                table: "BannedWords",
                column: "BannedById");

            migrationBuilder.CreateIndex(
                name: "IX_BannedWords_Word",
                table: "BannedWords",
                column: "Word",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WordVotes_UserId",
                table: "WordVotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WordVotes_Word",
                table: "WordVotes",
                column: "Word");

            migrationBuilder.CreateIndex(
                name: "IX_WordVotes_Word_UserId",
                table: "WordVotes",
                columns: new[] { "Word", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BannedWords");

            migrationBuilder.DropTable(
                name: "WordVotes");
        }
    }
}
