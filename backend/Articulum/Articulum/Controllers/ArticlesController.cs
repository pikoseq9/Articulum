using Articulum.Application.Articles;
using Articulum.Domain;
using Articulum.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;

namespace Articulum.WebApplication.Controllers
{
    [Authorize]
    public class ArticlesController : BaseApiController
    {
        private readonly DataContext _context;

        public ArticlesController(DataContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<Article>>> GetArticles()
        {
            // Wywo³uje Twój Handler z Application/Articles/List.cs
            var result = await Mediator.Send(new List.Query());

            if (result == null || result.Value == null) return NotFound();
            if (result.IsSuccess) return Ok(result.Value);

            return BadRequest(result.Error);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticle(Guid id)
        {
            // Upewnij siê, ¿e masz klasê Details w Application/Articles
            var result = await Mediator.Send(new Details.Query { Id = id });

            if (result == null || result.Value == null) return NotFound();
            if (result.IsSuccess) return Ok(result.Value);

            return BadRequest(result.Error);
        }

        [HttpPost]
        public async Task<IActionResult> AddArticle(Article article)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie jesteœ zalogowany.");
            }

            article.AppUserId = userId;

            if (article.Id == Guid.Empty) article.Id = Guid.NewGuid();
            if (article.PublicationDate == default) article.PublicationDate = DateTime.UtcNow;

            // Upewnij siê, ¿e masz klasê Add w Application/Articles
            var result = await Mediator.Send(new Add.Command { Article = article });

            if (result == null) return BadRequest();
            if (result.IsSuccess && result.Value != null)
            {
                return CreatedAtAction(
                    nameof(GetArticle),
                    new { id = result.Value.Id },
                    result.Value
                );
            }
            return BadRequest(result.Error);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditArticle(Guid id, Article article)
        {
            article.Id = id;
            // Upewnij siê, ¿e masz klasê Edit w Application/Articles
            var result = await Mediator.Send(new Edit.Command { Article = article });

            if (result.IsSuccess) return Ok();
            return BadRequest(result.Error);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(Guid id)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
        }
    }
}