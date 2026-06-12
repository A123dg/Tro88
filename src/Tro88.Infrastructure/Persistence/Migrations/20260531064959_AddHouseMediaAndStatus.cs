using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseMediaAndStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaUrl",
                table: "Houses",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Houses",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "PendingApproval");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MediaUrl",
                table: "Houses");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Houses");
        }
    }
}

