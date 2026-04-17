using Articulum.Application.DTOs;
using Articulum.Domain;
using Articulum.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Articulum.WebApplication.Controllers
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
                    CurrentBookAuthor = currentBook?.Author,
                    AvatarUrl = user.AvatarUrl
                });
            }

            return Ok(result);
        }

        [HttpGet("ratings")]
        public async Task<ActionResult<List<RatingDto>>> GetRatings()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var ratings = await _context.Ratings
                .Include(r => r.AppUser) // Ważne: dołączamy dane użytkownika!
                .OrderByDescending(r => r.CreatedAt) // Najnowsze na górze
                .ToListAsync();

            var dtos = ratings.Select(r => new RatingDto
            {
                Id = r.Id,
                Username = r.AppUser.DisplayName ?? r.AppUser.UserName,
                UserAvatarInitials = (r.AppUser.DisplayName ?? "X").Substring(0, 2).ToUpper(),
                UserAvatarUrl = r.AppUser.AvatarUrl,
                BookTitle = r.BookTitle,
                BookAuthor = r.BookAuthor,
                BookCover = r.BookCover,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
                IsMine = r.AppUserId == currentUserId
            }).ToList();

            return Ok(dtos);
        }

        // POST: api/community/ratings
        // Dodaje nową ocenę
        [HttpPost("ratings")]
        public async Task<ActionResult<RatingDto>> AddRating(CreateRatingDto dto)
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirstValue(ClaimTypes.Email));
            if (user == null) return Unauthorized();

            var rating = new CommunityRating
            {
                Id = Guid.NewGuid(),
                AppUserId = user.Id,
                BookTitle = dto.BookTitle,
                BookAuthor = dto.BookAuthor,
                BookCover = dto.BookCover,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Ratings.Add(rating);
            var result = await _context.SaveChangesAsync();

            if (result > 0)
            {
                // Zwracamy stworzony obiekt, żeby frontend mógł go od razu wyświetlić
                return Ok(new RatingDto
                {
                    Id = rating.Id,
                    Username = user.DisplayName,
                    UserAvatarInitials = user.DisplayName.Substring(0, 2).ToUpper(),
                    UserAvatarUrl = user.AvatarUrl,
                    BookTitle = rating.BookTitle,
                    BookAuthor = rating.BookAuthor,
                    BookCover = rating.BookCover,
                    Rating = rating.Rating,
                    Comment = rating.Comment,
                    CreatedAt = rating.CreatedAt,
                    IsMine = true
                });
            }

            return BadRequest("Nie udało się zapisać oceny");
        }

        // DELETE: api/community/ratings/{id}
        // Usuwa ocenę (tylko właściciel może usunąć)
        [HttpDelete("ratings/{id}")]
        public async Task<IActionResult> DeleteRating(Guid id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var rating = await _context.Ratings.FindAsync(id);
            if (rating == null) return NotFound();

            // Sprawdzenie czy użytkownik usuwa SWOJĄ ocenę
            if (rating.AppUserId != currentUserId)
            {
                return Forbid("Nie możesz usunąć cudzej recenzji.");
            }

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/community/ratings/{id}
        // Pobiera pojedynczą ocenę (opcjonalne, rzadziej używane w feedzie)
        [HttpGet("ratings/{id}")]
        public async Task<ActionResult<RatingDto>> GetRating(Guid id)
        {
            var rating = await _context.Ratings
                .Include(r => r.AppUser)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (rating == null) return NotFound();

            return Ok(new RatingDto
            {
                Id = rating.Id,
                Username = rating.AppUser.DisplayName,
                BookTitle = rating.BookTitle,
                Rating = rating.Rating,
                Comment = rating.Comment,
                CreatedAt = rating.CreatedAt
            });
        }
    }
}