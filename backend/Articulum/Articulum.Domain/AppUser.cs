using Microsoft.AspNetCore.Identity;

namespace Articulum.Domain
{
    public class AppUser : IdentityUser
    {
        public string DisplayName { get; set; }

        public string? TwoFactorSecret { get; set; }
        // "email" albo "authenticator"
        public string? TwoFactorMethod { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
