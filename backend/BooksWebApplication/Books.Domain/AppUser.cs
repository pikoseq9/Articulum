using Microsoft.AspNetCore.Identity;

namespace Books.Domain
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }
        public string Bio { get; set; } = string.Empty;
        public int? MyGoal { get; set; } = 10;

        public string? TwoFactorSecret { get; set; }
        // "email" albo "authenticator"
        public string? TwoFactorMethod { get; set; }
    }
}
