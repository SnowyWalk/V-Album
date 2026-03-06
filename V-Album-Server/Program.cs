using Configuration;
using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.BackgroundJobs;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.Group;
using V_Album_Server.Services.Login;
using V_Album_Server.Services.Login.Handlers;
using V_Album_Server.Services.User;

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

// Repository
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<MemberRepository>();
builder.Services.AddScoped<GroupRepository>();

// Configuration
builder.Services.Configure<AppDefaultsOptions>(builder.Configuration.GetSection("AppDefaults"));

// BackgroundJobs
builder.Services.AddSingleton<ThumbnailQueue>();
builder.Services.AddHostedService<ThumbnailWorker>();

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
