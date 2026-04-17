using System;

namespace Articulum.Domain
{
    public class EmailVerificationCode
    {
        public Guid Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public AppUser? User { get; set; }

        public string CodeHash { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; }
    }

}
