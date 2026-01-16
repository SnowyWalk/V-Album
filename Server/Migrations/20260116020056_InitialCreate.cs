using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Group",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Group", x => x.Uuid);
                });

            migrationBuilder.CreateTable(
                name: "Place",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    ValidatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    ValidatedVersion = table.Column<long>(type: "INTEGER", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Place", x => x.Uuid);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    UserType = table.Column<int>(type: "INTEGER", nullable: false),
                    ExternalId = table.Column<Guid>(type: "TEXT", nullable: true),
                    RegisteredAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Uuid);
                });

            migrationBuilder.CreateTable(
                name: "Member",
                columns: table => new
                {
                    UserUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    GroupUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    Role = table.Column<int>(type: "INTEGER", nullable: false),
                    Alias = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    JoinedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Member", x => new { x.GroupUuid, x.UserUuid });
                    table.ForeignKey(
                        name: "FK_Member_Group_GroupUuid",
                        column: x => x.GroupUuid,
                        principalTable: "Group",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Member_User_UserUuid",
                        column: x => x.UserUuid,
                        principalTable: "User",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Post",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    GroupUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Post", x => x.Uuid);
                    table.ForeignKey(
                        name: "FK_Post_Group_GroupUuid",
                        column: x => x.GroupUuid,
                        principalTable: "Group",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Post_User_UserUuid",
                        column: x => x.UserUuid,
                        principalTable: "User",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Photo",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    GroupUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    PostUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    PlaceUuid = table.Column<Guid>(type: "TEXT", nullable: true),
                    Src = table.Column<string>(type: "TEXT", nullable: false),
                    PreviewSrc = table.Column<string>(type: "TEXT", nullable: false),
                    Width = table.Column<int>(type: "INTEGER", nullable: false),
                    Height = table.Column<int>(type: "INTEGER", nullable: false),
                    Size = table.Column<long>(type: "INTEGER", nullable: false),
                    SrcHash = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photo", x => x.Uuid);
                    table.ForeignKey(
                        name: "FK_Photo_Group_GroupUuid",
                        column: x => x.GroupUuid,
                        principalTable: "Group",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Photo_Place_PlaceUuid",
                        column: x => x.PlaceUuid,
                        principalTable: "Place",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Photo_Post_PostUuid",
                        column: x => x.PostUuid,
                        principalTable: "Post",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PostComment",
                columns: table => new
                {
                    Uuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    PostUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    Body = table.Column<string>(type: "TEXT", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostComment", x => x.Uuid);
                    table.ForeignKey(
                        name: "FK_PostComment_Post_PostUuid",
                        column: x => x.PostUuid,
                        principalTable: "Post",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostComment_User_UserUuid",
                        column: x => x.UserUuid,
                        principalTable: "User",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostTag",
                columns: table => new
                {
                    PostUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    TargetUserUuid = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PostTag", x => new { x.PostUuid, x.TargetUserUuid });
                    table.ForeignKey(
                        name: "FK_PostTag_Post_PostUuid",
                        column: x => x.PostUuid,
                        principalTable: "Post",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PostTag_User_TargetUserUuid",
                        column: x => x.TargetUserUuid,
                        principalTable: "User",
                        principalColumn: "Uuid",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Member_GroupUuid_JoinedAt_Active",
                table: "Member",
                columns: new[] { "GroupUuid", "JoinedAt" },
                filter: "deletedAt IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Member_UserUuid_Active",
                table: "Member",
                column: "UserUuid",
                filter: "deletedAt IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Photo_GroupUuid_CreatedAt_DESC_SortOrder_DESC",
                table: "Photo",
                columns: new[] { "GroupUuid", "CreatedAt", "SortOrder" },
                descending: new[] { false, true, true });

            migrationBuilder.CreateIndex(
                name: "IX_Photo_PlaceUuid",
                table: "Photo",
                column: "PlaceUuid");

            migrationBuilder.CreateIndex(
                name: "IX_Photo_PostUuid_SortOrder",
                table: "Photo",
                columns: new[] { "PostUuid", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Photo_SrcHash",
                table: "Photo",
                column: "SrcHash");

            migrationBuilder.CreateIndex(
                name: "UX_Photo_GroupUuid_SrcHash",
                table: "Photo",
                columns: new[] { "GroupUuid", "SrcHash" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Post_GroupUser_CreatedAt_DESC_Active",
                table: "Post",
                columns: new[] { "GroupUuid", "UserUuid", "CreatedAt" },
                descending: new[] { false, false, true },
                filter: "deletedAt IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Post_GroupUuid_CreatedAt_DESC",
                table: "Post",
                columns: new[] { "GroupUuid", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_Post_UserUuid",
                table: "Post",
                column: "UserUuid");

            migrationBuilder.CreateIndex(
                name: "IX_PostComment_PostUuid_CreatedAt_DESC_Active",
                table: "PostComment",
                columns: new[] { "PostUuid", "CreatedAt" },
                descending: new[] { false, true },
                filter: "deletedAt IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PostComment_UserUuid",
                table: "PostComment",
                column: "UserUuid");

            migrationBuilder.CreateIndex(
                name: "IX_PostTag_PostUuid_CreatedAt",
                table: "PostTag",
                columns: new[] { "PostUuid", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PostTag_TargetUserUuid",
                table: "PostTag",
                column: "TargetUserUuid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Member");

            migrationBuilder.DropTable(
                name: "Photo");

            migrationBuilder.DropTable(
                name: "PostComment");

            migrationBuilder.DropTable(
                name: "PostTag");

            migrationBuilder.DropTable(
                name: "Place");

            migrationBuilder.DropTable(
                name: "Post");

            migrationBuilder.DropTable(
                name: "Group");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
