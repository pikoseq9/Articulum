using System;
using System.Collections.Generic;
using System.Linq;
using Books.Domain;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Books.Infrastructure
{
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options) { }
        public DbSet<UserBook> Books { get; set; }

        public DbSet<EmailVerificationCode> EmailVerificationCodes { get; set; }
        public DbSet<CommunityRating> Ratings { get; set; }

    }
}
