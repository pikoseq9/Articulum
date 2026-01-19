using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Books.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixedAddMoreDataToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Genre",
                table: "Books",
                newName: "Subject");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Subject",
                table: "Books",
                newName: "Genre");
        }
    }
}
