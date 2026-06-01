using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Tro88.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HouseMediaUrlsArray : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaUrls",
                table: "Houses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.Sql("""
                UPDATE Houses
                SET MediaUrls = CASE
                    WHEN MediaUrl IS NULL OR LTRIM(RTRIM(MediaUrl)) = '' THEN '[]'
                    ELSE CONCAT('["', STRING_ESCAPE(MediaUrl, 'json'), '"]')
                END
                """);

            migrationBuilder.DropColumn(
                name: "MediaUrl",
                table: "Houses");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaUrl",
                table: "Houses",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE Houses
                SET MediaUrl = JSON_VALUE(MediaUrls, '$[0]')
                WHERE ISJSON(MediaUrls) = 1
                """);

            migrationBuilder.DropColumn(
                name: "MediaUrls",
                table: "Houses");
        }
    }
}
