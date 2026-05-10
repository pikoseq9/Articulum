using Articulum.Domain;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using Articulum.Infrastructure;
using System.Linq;
using System.Threading.Tasks;

namespace Articulum.Infrastructure
{
    public class Seed
    {
        public static async Task SeedData(DataContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            if (!roleManager.Roles.Any())
            {
                await roleManager.CreateAsync(new IdentityRole("Administrator"));
                await roleManager.CreateAsync(new IdentityRole("User"));
            }

            if (!userManager.Users.Any())
            {
                var adminUser = new AppUser { DisplayName = "admin", UserName = "admin", Email = "admin@wp.pl" };
                var standardUser = new AppUser { DisplayName = "user", UserName = "user", Email = "user@wp.pl" };

                await userManager.CreateAsync(adminUser, "Zaq12wsx");
                await userManager.AddToRoleAsync(adminUser, "Administrator");

                await userManager.CreateAsync(standardUser, "Zaq12wsx");
                await userManager.AddToRoleAsync(standardUser, "User");
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

            var existingAdmin = await userManager.FindByEmailAsync("admin@wp.pl");
            if (existingAdmin != null)
            {
                if (!await userManager.IsInRoleAsync(existingAdmin, "Administrator"))
                {
                    await userManager.AddToRoleAsync(existingAdmin, "Administrator");
                }
            }

            await context.Articles.AddRangeAsync(articles);
            await context.SaveChangesAsync();
        }
    }
}