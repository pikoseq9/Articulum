using Books.Application;
using Books.Application.Books;
using Books.Domain;
using Books.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;

namespace BooksWebApplication.Controllers
{
    public class BooksController : BaseApiController
    {
        private readonly IMediator _mediator;
        private readonly DataContext _context;
        public BooksController(DataContext context,IMediator mediator)
        {
            _mediator = mediator;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<UserBook>>> GetBooks()
        {
            var result = await Mediator.Send(new List.Query());
            if (result == null || result.Value == null) return NotFound();
            if (result.IsSuccess) return Ok(result.Value);
            return BadRequest(result.Error);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(Guid id)
        {
            var result = await Mediator.Send(new Details.Query { Id = id });

            if (result == null || result.Value == null)
                return NotFound(); // 404 – zasób nie istnieje
            if (result.IsSuccess)
                return Ok(result.Value); // 200 – znaleziono samochód
            return BadRequest(result.Error); // 400 – błąd zapytan
        }

        [HttpPost]
        public async Task<IActionResult> AddBook(UserBook book)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Opcjonalne: Sprawdzenie bezpieczeństwa
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Nie jesteś zalogowany lub token jest błędny.");
            }

            book.AppUserId = userId;

            if (book.Id == Guid.Empty) book.Id = Guid.NewGuid();
            if (book.AddedAt == default) book.AddedAt = DateTime.UtcNow;

            var result = await Mediator.Send(new Add.Command { UserBook = book });
            if (result == null)
                return BadRequest(); // 400 – niepoprawne dane
            if (result.IsSuccess && result.Value != null)
            {
                // 201 – zasób utworzony; nagłówek Location zawiera adres nowego samochodu
                return CreatedAtAction(
                 nameof(GetBook), // metoda, do której prowadzi link
                 new { id = result.Value.Id }, // parametr route
                 result.Value // zwracany obiekt
             );
            }
            return BadRequest(result.Error);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> EditBook(Guid id, UserBook book)
        {
            book.Id = id;
            var result = await Mediator.Send(new Edit.Command { UserBook = book });
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(Guid id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
                return NotFound();

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpPost("fetch/{isbn}")]
        public async Task<IActionResult> AddByIsbn(string isbn)
        {
            var result = await Mediator.Send(new AddByIsbn.Command { Isbn = isbn });

            if (result == null) return BadRequest();

            if (result.IsSuccess && result.Value != null)
            {
                return CreatedAtAction(
                    nameof(GetBook),
                    new { id = result.Value.Id },
                    result.Value
                );
            }

            return BadRequest(result.Error);
        }

    }
}
