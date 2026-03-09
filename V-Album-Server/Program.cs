using Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.Group;
using V_Album_Server.Services.Login;
using V_Album_Server.Services.Login.Handlers;
using V_Album_Server.Services.User;
using V_Album_Server.UseCases.Post;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<V_Album_Server.Infrastructures.Persistence.Scaffold.AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Main");
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

// Service
builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ILoginHandler, GoogleLoginHandler>();
builder.Services.AddScoped<GroupService>();

// UseCase
builder.Services.AddScoped<CreatePostUseCase>();

// Repository
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<MemberRepository>();
builder.Services.AddScoped<GroupRepository>();
builder.Services.AddScoped<PostRepository>();

// Configuration
builder.Services.Configure<AppDefaultsOptions>(builder.Configuration.GetSection("AppDefaults"));

// BackgroundJobs
builder.Services.AddSingleton<ThumbnailQueue>();
builder.Services.AddHostedService<ThumbnailWorker>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Count > 0)
            .Select(x => new
            {
                Field = x.Key,
                Errors = x.Value!.Errors.Select(e => e.ErrorMessage)
            });

        var logger = context.HttpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("ModelBinding");

        logger.LogError("Model binding failed: {@Errors}", errors);

        return new BadRequestObjectResult(context.ModelState);
    };
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthorization();
app.MapControllers();
app.Run();
