using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContractSignatureFields2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOwnerSigned",
                table: "Contracts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTenantSigned",
                table: "Contracts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOwnerSigned",
                table: "Contracts");

            migrationBuilder.DropColumn(
                name: "IsTenantSigned",
                table: "Contracts");
        }
    }
}

