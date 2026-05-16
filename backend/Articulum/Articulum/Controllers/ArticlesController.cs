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
            var result = await Mediator.Send(new List.Query());

            if (result == null || result.Value == null) return NotFound();
            if (result.IsSuccess) return Ok(result.Value);

            return BadRequest(result.Error);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticle(Guid id)
        {
            var result = await Mediator.Send(new Details.Query { Id = id });

            if (result == null || result.Value == null) return NotFound();
            if (result.IsSuccess) return Ok(result.Value);

            return BadRequest(result.Error);
        }

        [AllowAnonymous]
        [HttpGet("latest")]
        public async Task<ActionResult<List<Article>>> GetLatestArticles()
        {
            // Endpoint dla zakładki "Najnowsze artykuły" - wymaga stworzenia ListLatest.Query w Application
            var result = await Mediator.Send(new ListLatest.Query());
            return HandleResult(result);
        }

        [AllowAnonymous]
        [HttpGet("archive")]
        public async Task<ActionResult<List<Article>>> GetArchiveArticles()
        {
            // Endpoint dla zakładki "Roczniki" - wymaga stworzenia ListArchive.Query w Application
            var result = await Mediator.Send(new ListArchive.Query());
            return HandleResult(result);
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<ActionResult<List<Article>>> SearchArticles([FromQuery] string searchTerm)
        {
            // Endpoint dla wyszukiwarki - wymaga stworzenia Search.Query w Application
            var result = await Mediator.Send(new Search.Query { SearchTerm = searchTerm });
            return HandleResult(result);
        }

        [Authorize(Roles = "Administrator")]
        [HttpPost]
        public async Task<IActionResult> AddArticle([FromForm] Article article, IFormFile file)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            article.AppUserId = userId;

            var result = await Mediator.Send(new Add.Command { Article = article, File = file });

            if (result.IsSuccess && result.Value != null)
            {
                return CreatedAtAction(nameof(GetArticle), new { id = result.Value.Id }, result.Value);
            }

            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Administrator")]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditArticle(Guid id, [FromForm] Article article, IFormFile? file)
        {
            article.Id = id;

            var result = await Mediator.Send(new Edit.Command { Article = article, File = file });

            if (result.IsSuccess) return Ok();

            return BadRequest(result.Error);
        }

        [Authorize(Roles = "Administrator")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArticle(Guid id)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }));
        }



        [AllowAnonymous]
        [HttpGet("{id}/view")]
        public async Task<IActionResult> ViewPdf(Guid id)
        {
            var article = await _context.Articles.FindAsync(id);

            if (article == null || string.IsNullOrEmpty(article.PdfFileName))
                return NotFound();

            var filePath = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "pdfs",
                Path.GetFileName(article.PdfFileName)
            );

            article.OpenCount++;
            // zwiększanie liczby otworzeń 
            await _context.SaveChangesAsync();

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);

            return File(stream, "application/pdf", enableRangeProcessing: true);
        }

        [AllowAnonymous]
        [HttpGet("{id}/download-additional")]
        public async Task<IActionResult> DownloadAdditional(Guid id)
        {
            var article = await _context.Articles.FindAsync(id);

            if (article == null || string.IsNullOrEmpty(article.AdditionalFileName))
                return NotFound();

            var safeFileName = article.AdditionalFileName.Replace("\r", "").Replace("\n", "").Trim();
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "additional", safeFileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return File(stream, "application/octet-stream", safeFileName);
        }
    }
}