using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomIdAndHouseIdToTenantInRoom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "HouseId",
                table: "TenantInRooms",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "TenantInRooms",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantInRooms_HouseId",
                table: "TenantInRooms",
                column: "HouseId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantInRooms_RoomId",
                table: "TenantInRooms",
                column: "RoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_TenantInRooms_Houses_HouseId",
                table: "TenantInRooms",
                column: "HouseId",
                principalTable: "Houses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TenantInRooms_Rooms_RoomId",
                table: "TenantInRooms",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TenantInRooms_Houses_HouseId",
                table: "TenantInRooms");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantInRooms_Rooms_RoomId",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_TenantInRooms_HouseId",
                table: "TenantInRooms");

            migrationBuilder.DropIndex(
                name: "IX_TenantInRooms_RoomId",
                table: "TenantInRooms");

            migrationBuilder.DropColumn(
                name: "HouseId",
                table: "TenantInRooms");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "TenantInRooms");
        }
    }
}
