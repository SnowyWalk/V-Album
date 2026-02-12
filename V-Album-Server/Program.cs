using Microsoft.EntityFrameworkCore;
using V_Album_Server.Infrastructures.Persistence.Repositories;
using V_Album_Server.Services.Login;
using V_Album_Server.Services.Login.Handlers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<V_Album_Server.Infrastructures.Persistence.Scaffold.AppDbContext>(opt =>
{
    var cs = builder.Configuration.GetConnectionString("Main");
    opt.UseMySql(cs, ServerVersion.AutoDetect(cs));
});

builder.Services.AddScoped<LoginService>();
builder.Services.AddScoped<ILoginHandler, GoogleLoginHandler>();
builder.Services.AddScoped<UserRepository>();

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
