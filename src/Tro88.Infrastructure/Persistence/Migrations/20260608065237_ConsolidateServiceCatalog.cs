using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    public partial class ConsolidateServiceCatalog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Services table
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FeeType = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            // 2. Insert Seeded Services
            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "FeeType", "IsActive", "Name", "Unit", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), DateTime.UtcNow, Guid.Empty, "Usage", true, "Điện", "kWh", null, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), DateTime.UtcNow, Guid.Empty, "Usage", true, "Nước", "m³", null, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), DateTime.UtcNow, Guid.Empty, "Fixed", true, "Wifi", "Tháng", null, null },
                    { new Guid("44444444-4444-4444-4444-444444444444"), DateTime.UtcNow, Guid.Empty, "Fixed", true, "Gửi xe", "Xe", null, null },
                    { new Guid("55555555-5555-5555-5555-555555555555"), DateTime.UtcNow, Guid.Empty, "Fixed", true, "Rác", "Tháng", null, null }
                });

            // 3. Add ServiceId to ServiceFees as nullable first
            migrationBuilder.AddColumn<Guid>(
                name: "ServiceId",
                table: "ServiceFees",
                type: "uniqueidentifier",
                nullable: true);

            // 4. Map existing ServiceFees by name to seeded services
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '11111111-1111-1111-1111-111111111111' WHERE LOWER(Name) LIKE N'%điện%' OR LOWER(Name) LIKE N'%dien%'");
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '22222222-2222-2222-2222-222222222222' WHERE LOWER(Name) LIKE N'%nước%' OR LOWER(Name) LIKE N'%nuoc%'");
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '33333333-3333-3333-3333-333333333333' WHERE LOWER(Name) LIKE N'%wifi%' OR LOWER(Name) LIKE N'%mạng%' OR LOWER(Name) LIKE N'%internet%'");
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '44444444-4444-4444-4444-444444444444' WHERE LOWER(Name) LIKE N'%xe%' OR LOWER(Name) LIKE N'%parking%'");
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '55555555-5555-5555-5555-555555555555' WHERE LOWER(Name) LIKE N'%rác%' OR LOWER(Name) LIKE N'%rac%' OR LOWER(Name) LIKE N'%vệ sinh%' OR LOWER(Name) LIKE N'%ve sinh%'");

            // Insert other non-matched unique ServiceFees names into Services
            migrationBuilder.Sql(@"
                INSERT INTO Services (Id, Name, FeeType, Unit, IsActive, CreatedAt, CreatedBy)
                SELECT NEWID(), Name, FeeType, ISNULL(Unit, N'Tháng'), 1, GETUTCDATE(), '00000000-0000-0000-0000-000000000000'
                FROM ServiceFees
                WHERE ServiceId IS NULL
                GROUP BY Name, FeeType, Unit
            ");

            // Update ServiceId for custom service fees
            migrationBuilder.Sql(@"
                UPDATE sf
                SET sf.ServiceId = s.Id
                FROM ServiceFees sf
                JOIN Services s ON sf.Name = s.Name AND sf.FeeType = s.FeeType
                WHERE sf.ServiceId IS NULL
            ");

            // Fallback remaining null ServiceId to Wifi
            migrationBuilder.Sql("UPDATE ServiceFees SET ServiceId = '33333333-3333-3333-3333-333333333333' WHERE ServiceId IS NULL");

            // 5. Alter ServiceId to be non-nullable
            migrationBuilder.AlterColumn<Guid>(
                name: "ServiceId",
                table: "ServiceFees",
                type: "uniqueidentifier",
                nullable: false);

            // 6. Clean up old indexes and columns
            migrationBuilder.DropIndex(
                name: "IX_ServiceFees_HouseId",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "FeeType",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "ServiceFees");

            // 7. Add foreign key and new indexes
            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_HouseId_ServiceId",
                table: "ServiceFees",
                columns: new[] { "HouseId", "ServiceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_ServiceId",
                table: "ServiceFees",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceFees_Services_ServiceId",
                table: "ServiceFees",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // 8. Create RoomServiceFees table
            migrationBuilder.CreateTable(
                name: "RoomServiceFees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    RoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,0)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomServiceFees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoomServiceFees_Rooms_RoomId",
                        column: x => x.RoomId,
                        principalTable: "Rooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoomServiceFees_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // 9. Migrate existing Room prices for Electricity and Water into RoomServiceFees
            migrationBuilder.Sql(@"
                INSERT INTO RoomServiceFees (Id, RoomId, ServiceId, Amount, CreatedAt, CreatedBy)
                SELECT NEWID(), Id, '11111111-1111-1111-1111-111111111111', ElectricityUnitPrice, GETUTCDATE(), '00000000-0000-0000-0000-000000000000'
                FROM Rooms
                WHERE ElectricityUnitPrice >= 0 AND Id NOT IN (SELECT RoomId FROM RoomServiceFees WHERE ServiceId = '11111111-1111-1111-1111-111111111111')
            ");

            migrationBuilder.Sql(@"
                INSERT INTO RoomServiceFees (Id, RoomId, ServiceId, Amount, CreatedAt, CreatedBy)
                SELECT NEWID(), Id, '22222222-2222-2222-2222-222222222222', WaterUnitPrice, GETUTCDATE(), '00000000-0000-0000-0000-000000000000'
                FROM Rooms
                WHERE WaterUnitPrice >= 0 AND Id NOT IN (SELECT RoomId FROM RoomServiceFees WHERE ServiceId = '22222222-2222-2222-2222-222222222222')
            ");

            migrationBuilder.CreateIndex(
                name: "IX_RoomServiceFees_RoomId_ServiceId",
                table: "RoomServiceFees",
                columns: new[] { "RoomId", "ServiceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoomServiceFees_ServiceId",
                table: "RoomServiceFees",
                column: "ServiceId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceFees_Services_ServiceId",
                table: "ServiceFees");

            migrationBuilder.DropTable(
                name: "RoomServiceFees");

            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.DropIndex(
                name: "IX_ServiceFees_HouseId_ServiceId",
                table: "ServiceFees");

            migrationBuilder.DropIndex(
                name: "IX_ServiceFees_ServiceId",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "ServiceFees");

            migrationBuilder.AddColumn<string>(
                name: "FeeType",
                table: "ServiceFees",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ServiceFees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "ServiceFees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_HouseId",
                table: "ServiceFees",
                column: "HouseId");
        }
    }
}

