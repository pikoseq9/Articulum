using Books.Domain;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Books.Infrastructure
{
    public class Seed
    {
        public static async Task SeedData(DataContext context, UserManager<AppUser> userManager)
        {

            if (!userManager.Users.Any())
            {
                var users = new List<AppUser>
                {
                    new AppUser{DisplayName = "admin", UserName = "admin", Email = "admin@wp.pl"},
                    new AppUser{DisplayName = "user", UserName = "user", Email = "user@wp.pl"}
                };

                foreach (var user in users)
                {
                    await userManager.CreateAsync(user, "Zaq12wsx");
                }
            }


            if (context.Books.Any()) return;

            var books = new List<UserBook>
            {
                new UserBook
                {
                    Title = "Harry PoTter",
                    Author = "J.K. Rowling",
                    Isbn = "9788869183157",
                    ImageUrl = "",
                    Description = "Description",
                    Pages = 211,
                    Status = BookStatus.Reading,
                    AddedAt = DateTime.Now

                }
            };
            await context.Books.AddRangeAsync(books);
            await context.SaveChangesAsync();
        }
    }
}
