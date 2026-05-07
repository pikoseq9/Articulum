using Articulum.Domain;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using Articulum.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Articulum.Infrastructure
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


            if (context.Articles.Any()) return;

            var articles = new List<Article>
            {
                new Article
                {
                    Title = "Test",
                    Authors = "Janek",
                    PageRange = "300",
                    PublicationDate = DateTime.Now,
                    Category = ArticleCategory.Mathematics,
                    PdfFileName = "Unknown",
                    OpenCount = 0

                }
            };
            await context.Articles.AddRangeAsync(articles);
            await context.SaveChangesAsync();
        }
    }
}
