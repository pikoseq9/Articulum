using Books.Application.DTOs;
using Books.Domain;
using Books.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BooksWebApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommunityController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly DataContext _context;

        public CommunityController(UserManager<AppUser> userManager, DataContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<CommunityUserDto>>> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<CommunityUserDto>();

            foreach (var user in users)
            {
                var currentBook = await _context.Books
                    .Where(b => b.AppUserId == user.Id && b.Status == BookStatus.Reading)
                    .OrderByDescending(b => b.AddedAt)
                    .FirstOrDefaultAsync();

                result.Add(new CommunityUserDto
                {
                    Username = user.UserName,
                    DisplayName = user.DisplayName,
                    CurrentBookTitle = currentBook?.Title,
                    CurrentBookAuthor = currentBook?.Author
                });
            }

            return Ok(result);
        }
    }
}