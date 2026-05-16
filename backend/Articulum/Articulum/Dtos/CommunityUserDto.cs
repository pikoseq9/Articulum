namespace Articulum.Dtos
{
    public class CommunityUserDto
    {
        public string Username { get; set; }
        public string DisplayName { get; set; }
        public string? CurrentBookTitle { get; set; }
        public string? CurrentBookAuthor { get; set; }
        public string? AvatarUrl { get; set; }
    }
}