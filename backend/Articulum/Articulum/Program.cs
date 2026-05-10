using Microsoft.EntityFrameworkCore;
using Articulum.Infrastructure;
using Articulum.Application;
using FluentValidation;
using FluentValidation.AspNetCore;
using Articulum.Application.Articles;
using Microsoft.AspNetCore.Http.HttpResults;
using Articulum.WebApplication;
using Articulum.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
}
);

builder.Services.AddDbContext<DataContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});



builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000");
    });
}
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Articulum API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Autoryzacja JWT. Wpisz s³owo 'Bearer', spacjê, a nastêpnie swój token.\r\n\r\nPrzyk³ad: \"Bearer eyJhbGciOiJIUzI1Ni...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});
builder.Services.AddHttpClient();
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<IUserAccessor, UserAccessor>();

builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Add>();

builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddMediatR(cfg =>
cfg.RegisterServicesFromAssembly(typeof(List.Handler).Assembly));

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<EmailVerificationService>();


builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:3000");
    });
}
);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    if (path != null && (path.StartsWith("/pdfs", StringComparison.OrdinalIgnoreCase) ||
                         path.StartsWith("/additional", StringComparison.OrdinalIgnoreCase)))
    {
        context.Response.StatusCode = 403;
        await context.Response.WriteAsync("Brak autoryzacji. Uzyj dedykowanego endpointu API do pobrania pliku.");
        return;
    }
    await next();
});

app.UseStaticFiles();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

//próba utworzenia bazy danych
try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    await context.Database.MigrateAsync();
    await Seed.SeedData(context, userManager, roleManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Error occured during migration");
}


app.Run();
