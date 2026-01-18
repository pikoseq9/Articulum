using Books.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Books.Domain
{
    public class EmailVerificationCode
    {
        public Guid Id { get; set; }

        public string UserId { get; set; }
        public AppUser User { get; set; }

        public string CodeHash { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; }
    }

}
