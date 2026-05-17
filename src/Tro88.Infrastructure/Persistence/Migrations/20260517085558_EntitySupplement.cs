using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EntitySupplement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Rooms_RoomId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_AssigneeId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_RequesterId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantInRooms_Users_TenantId",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_UtilityReadings_RoomId",
                table: "UtilityReadings");

            migrationBuilder.DropIndex(
                name: "IX_UtilityReadings_RoomId_Month_Year",
                table: "UtilityReadings");

            migrationBuilder.DropIndex(
                name: "IX_TenantInRooms_ContractId",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_Status",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_MaintenanceRequests_AssigneeId",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "ElectricityCurrent",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "ElectricityPrevious",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "RecordedAt",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "WaterCurrent",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "WaterPrevious",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "TenantInRooms");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "IsPerRoom",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                table: "RoomImages");

            migrationBuilder.DropColumn(
                name: "Channel",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "RelatedEntityType",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "AssignedTo",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "AssigneeId",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "RequestedBy",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "EntityType",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "UserAgent",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "TenantId",
                table: "TenantInRooms",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "CheckOutDate",
                table: "TenantInRooms",
                newName: "CheckOut");

            migrationBuilder.RenameColumn(
                name: "CheckInDate",
                table: "TenantInRooms",
                newName: "CheckIn");

            migrationBuilder.RenameIndex(
                name: "IX_TenantInRooms_TenantId",
                table: "TenantInRooms",
                newName: "IX_TenantInRooms_UserId");

            migrationBuilder.RenameColumn(
                name: "RelatedEntityId",
                table: "Notifications",
                newName: "ReferenceId");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "Notifications",
                newName: "Body");

            migrationBuilder.RenameColumn(
                name: "RequesterId",
                table: "MaintenanceRequests",
                newName: "RequestedByUserId");

            migrationBuilder.RenameColumn(
                name: "DeletedBy",
                table: "MaintenanceRequests",
                newName: "AssignedToUserId");

            migrationBuilder.RenameColumn(
                name: "DeletedAt",
                table: "MaintenanceRequests",
                newName: "ResolvedAt");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceRequests_RequesterId",
                table: "MaintenanceRequests",
                newName: "IX_MaintenanceRequests_RequestedByUserId");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "AuditLogs",
                newName: "TargetId");

            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityNew",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityOld",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityUsage",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "UtilityReadings",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WaterNew",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WaterOld",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WaterUsage",
                table: "UtilityReadings",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "TenantInRooms",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ServiceFees",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "ServiceFees",
                type: "decimal(18,0)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldPrecision: 18,
                oldScale: 2);

            migrationBuilder.AddColumn<string>(
                name: "FeeType",
                table: "ServiceFees",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "ServiceFees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Notifications",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "MaintenanceRequests",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrls",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResolutionNote",
                table: "MaintenanceRequests",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "IpAddress",
                table: "AuditLogs",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "AuditLogs",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Module",
                table: "AuditLogs",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "AiConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiConversations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AiAgentTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWSEQUENTIALID()"),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TaskType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    Input = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Output = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiAgentTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiAgentTasks_AiConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "AiConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AiMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Role = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InputTokens = table.Column<int>(type: "int", nullable: true),
                    OutputTokens = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiMessages_AiConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "AiConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UtilityReadings_RoomId_Year_Month",
                table: "UtilityReadings",
                columns: new[] { "RoomId", "Year", "Month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantInRooms_ContractId_UserId",
                table: "TenantInRooms",
                columns: new[] { "ContractId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_TenantInRooms_Status",
                table: "TenantInRooms",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_Status",
                table: "Notifications",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRequests_AssignedToUserId",
                table: "MaintenanceRequests",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Module",
                table: "AuditLogs",
                column: "Module");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AiAgentTasks_ConversationId",
                table: "AiAgentTasks",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_AiAgentTasks_Status",
                table: "AiAgentTasks",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_AiConversations_UserId",
                table: "AiConversations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AiMessages_ConversationId",
                table: "AiMessages",
                column: "ConversationId");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Rooms_RoomId",
                table: "MaintenanceRequests",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_AssignedToUserId",
                table: "MaintenanceRequests",
                column: "AssignedToUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_RequestedByUserId",
                table: "MaintenanceRequests",
                column: "RequestedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantInRooms_Users_UserId",
                table: "TenantInRooms",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Rooms_RoomId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_AssignedToUserId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_MaintenanceRequests_Users_RequestedByUserId",
                table: "MaintenanceRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantInRooms_Users_UserId",
                table: "TenantInRooms");

            migrationBuilder.DropTable(
                name: "AiAgentTasks");

            migrationBuilder.DropTable(
                name: "AiMessages");

            migrationBuilder.DropTable(
                name: "AiConversations");

            migrationBuilder.DropIndex(
                name: "IX_UtilityReadings_RoomId_Year_Month",
                table: "UtilityReadings");

            migrationBuilder.DropIndex(
                name: "IX_TenantInRooms_ContractId_UserId",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_TenantInRooms_Status",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_Status",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_MaintenanceRequests_AssignedToUserId",
                table: "MaintenanceRequests");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_CreatedAt",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_Module",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "ElectricityNew",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "ElectricityOld",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "ElectricityUsage",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "WaterNew",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "WaterOld",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "WaterUsage",
                table: "UtilityReadings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "TenantInRooms");

            migrationBuilder.DropColumn(
                name: "FeeType",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "ServiceFees");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "ImageUrls",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "ResolutionNote",
                table: "MaintenanceRequests");

            migrationBuilder.DropColumn(
                name: "Module",
                table: "AuditLogs");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "TenantInRooms",
                newName: "TenantId");

            migrationBuilder.RenameColumn(
                name: "CheckOut",
                table: "TenantInRooms",
                newName: "CheckOutDate");

            migrationBuilder.RenameColumn(
                name: "CheckIn",
                table: "TenantInRooms",
                newName: "CheckInDate");

            migrationBuilder.RenameIndex(
                name: "IX_TenantInRooms_UserId",
                table: "TenantInRooms",
                newName: "IX_TenantInRooms_TenantId");

            migrationBuilder.RenameColumn(
                name: "ReferenceId",
                table: "Notifications",
                newName: "RelatedEntityId");

            migrationBuilder.RenameColumn(
                name: "Body",
                table: "Notifications",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "ResolvedAt",
                table: "MaintenanceRequests",
                newName: "DeletedAt");

            migrationBuilder.RenameColumn(
                name: "RequestedByUserId",
                table: "MaintenanceRequests",
                newName: "RequesterId");

            migrationBuilder.RenameColumn(
                name: "AssignedToUserId",
                table: "MaintenanceRequests",
                newName: "DeletedBy");

            migrationBuilder.RenameIndex(
                name: "IX_MaintenanceRequests_RequestedByUserId",
                table: "MaintenanceRequests",
                newName: "IX_MaintenanceRequests_RequesterId");

            migrationBuilder.RenameColumn(
                name: "TargetId",
                table: "AuditLogs",
                newName: "UpdatedBy");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "UtilityReadings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "UtilityReadings",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityCurrent",
                table: "UtilityReadings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ElectricityPrevious",
                table: "UtilityReadings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "UtilityReadings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "RecordedAt",
                table: "UtilityReadings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "WaterCurrent",
                table: "UtilityReadings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "WaterPrevious",
                table: "UtilityReadings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "TenantInRooms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "ServiceFees",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<decimal>(
                name: "Amount",
                table: "ServiceFees",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,0)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "ServiceFees",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedBy",
                table: "ServiceFees",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ServiceFees",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ServiceFees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsPerRoom",
                table: "ServiceFees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                table: "RoomImages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Channel",
                table: "Notifications",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RelatedEntityType",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssignedTo",
                table: "MaintenanceRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AssigneeId",
                table: "MaintenanceRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "MaintenanceRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "MaintenanceRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "MaintenanceRequests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RequestedBy",
                table: "MaintenanceRequests",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "MaintenanceRequests",
                type: "date",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "IpAddress",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "varchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Action",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "EntityId",
                table: "AuditLogs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityType",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "AuditLogs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserAgent",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_UtilityReadings_RoomId",
                table: "UtilityReadings",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_UtilityReadings_RoomId_Month_Year",
                table: "UtilityReadings",
                columns: new[] { "RoomId", "Month", "Year" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantInRooms_ContractId",
                table: "TenantInRooms",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Status",
                table: "Notifications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceRequests_AssigneeId",
                table: "MaintenanceRequests",
                column: "AssigneeId");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Rooms_RoomId",
                table: "MaintenanceRequests",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_AssigneeId",
                table: "MaintenanceRequests",
                column: "AssigneeId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MaintenanceRequests_Users_RequesterId",
                table: "MaintenanceRequests",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantInRooms_Users_TenantId",
                table: "TenantInRooms",
                column: "TenantId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
