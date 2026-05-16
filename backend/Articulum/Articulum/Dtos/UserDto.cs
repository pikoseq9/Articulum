namespace Articulum.Dtos
{
    public class UserDto
    {
        public string DisplayName { get; set; }
        public string Token { get; set; }
        public string UserName { get; set; }
        public int? MyGoal { get; set; }
        public string? Bio {  get; set; }
        public bool IsMfaRequired { get; set; }
        public bool IsMfaEnabled { get; set; }
        public string? MfaMethod { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
